import json
import time
import asyncio
import logging

from fastapi import FastAPI
from fastapi.websockets import WebSocket
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

import starlette.websockets

from auth import *
from config import front_url, is_game_ended, allow_any_mail, yandex_redirect_url
from canvas import Canvas


clients: dict[int, WebSocket] = {}
canvas = Canvas()
current_uid_number = 0
current_event_number = 1


app = FastAPI()

logger = logging.getLogger('uvicorn.info')


async def broadcast_pixel_impl(params) -> None:
    data, user = params
    try:
        await user.send_text(data)
    except Exception as err:
        logger.info(f'broadcast err: {err}')


async def broadcast_pixel(x, y, color, event_id) -> None:
    data = json.dumps({'type': 'draw_pixel', 'content': {'x': x, 'y': y, 'color': color, 'event_id': event_id}})
    users = list(clients.values())
    await asyncio.gather(*map(broadcast_pixel_impl, zip([data]*len(users), users)))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    global current_uid_number, current_event_number

    await websocket.accept()

    cookies = dict(websocket.cookies.items())

    if 'auth_token' not in cookies:
        logger.info(f'auth_token not in cookies: {cookies}')
        await websocket.send_text(json.dumps({'type': 'need_reauth', 'error': 'no_cookie'}))
        return

    user_id, last_placed, is_admin = await get_user_by_cookie(cookies['auth_token'])
    logger.info(f'get_user_by_cookie {user_id} {cookies}')
    if user_id == -1:
        logger.info(f'user not found {cookies}')
        await websocket.send_text(json.dumps({'type': 'need_reauth', 'error': 'user_not_found'}))
        return

    if is_game_ended:
        await websocket.send_text(json.dumps({'type': 'draw_initial_map', 'content': {'map': canvas.get_map(), 'last_placed': last_placed}}))
        await websocket.send_text(json.dumps({'type': 'game_ended'}))
        return

    if is_admin:
        await websocket.send_text(json.dumps({'type': 'set_admin'}))

    local_uid = current_uid_number
    current_uid_number += 1
    clients[local_uid] = websocket

    # all returns later HAVE to remove client from list before return!

    await websocket.send_text(json.dumps({'type': 'draw_initial_map', 'content': {'map': canvas.get_map(), 'last_placed': last_placed}}))

    while True:
        try:
            message = json.loads(await websocket.receive_text())

            if message['type'] == 'put_pixel':
                x, y, color = message['content']['x'], message['content']['y'], message['content']['color']
                time_placed = await canvas.handle_put_pixel(user_id)  # false if can't place a pixel and time of place else
                if not time_placed and not is_admin:  # bypass time check for admin
                    await websocket.send_text(json.dumps({'type': 'too_early', 'content': time_placed}))
                    continue
                else:
                    await websocket.send_text(json.dumps({'type': 'placed_time', 'content': time_placed if not is_admin else 0}))

                await canvas.put_pixel(x, y, color, user_id)
                event_id = current_event_number
                current_event_number += 1
                await broadcast_pixel(x, y, color, event_id)
            elif message['type'] == 'sync_time':
                await websocket.send_text(json.dumps({'type': 'sync_time', 'content': round(time.time()*1000)}))
            else:
                logger.info(f'unknown message recieved! {message}')

        except starlette.websockets.WebSocketDisconnect:
            logger.info('disconnect')
            del clients[local_uid]
            return
        except Exception as err:
            logger.info(f'unknown err {err}')
            # del clients[local_uid]
            # return


@app.get("/get_auth_url")
async def yandex_get_auth_url() -> RedirectResponse:
    return RedirectResponse(get_auth_url())


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/handle_code")
async def yandex_get_user_info(code: str, cid: str):  # cid - username, not needed
    user = await get_user_by_code(code)

    if not user.default_email.endswith('@phystech.edu') and not allow_any_mail:  # type: ignore
        return RedirectResponse('/static/email_error.html')

    cookie = await handle_user_auth(user.default_email)

    script = f"<script>window.location.href='{front_url}';</script>"
    response = HTMLResponse(content=script)
    domain = yandex_redirect_url.removeprefix('https://').removeprefix('http://').removesuffix('/handle_code')  # cringe
    response.set_cookie(key="auth_token", value=cookie, max_age=30 * 86400, domain=domain, secure=True, httponly=True, samesite='lax')

    return response
