import json
import time
import asyncio
import logging

from fastapi import FastAPI, Response
from fastapi.websockets import WebSocket
from fastapi.responses import RedirectResponse

import starlette.websockets

from auth import *
from config import front_url
from canvas import Canvas


clients: dict[int, WebSocket] = {}
canvas = Canvas()
current_uid_number = 0
current_event_number = 1


app = FastAPI()

logger = logging.getLogger('uvicorn.error')


async def broadcast_pixel_impl(params) -> None:
    data, user = params
    try:
        await user.send_text(data)
    except Exception as err:
        logger.error('broadcast err:', err)


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
        logger.error(f'auth_token not in cookies: {cookies}')
        await websocket.send_text(json.dumps({'type': 'need_reauth', 'error': 'no_cookie'}))
        return

    user_id, last_placed = await get_user_by_cookie(cookies['auth_token'])
    logger.error('get_user_by_cookie', user_id, cookies)
    if user_id == -1:
        logger.error('user not found', cookies)
        await websocket.send_text(json.dumps({'type': 'need_reauth', 'error': 'user_not_found'}))
        return

    local_uid = current_uid_number
    current_uid_number += 1
    clients[local_uid] = websocket

    await websocket.send_text(json.dumps({'type': 'draw_initial_map', 'content': {'map': canvas.get_map(), 'last_placed': last_placed}}))

    while True:
        try:
            message = json.loads(await websocket.receive_text())

            if message['type'] == 'put_pixel':
                x, y, color = message['content']['x'], message['content']['y'], message['content']['color']
                time_placed = await canvas.handle_put_pixel(user_id)
                if not time_placed:
                    await websocket.send_text(json.dumps({'type': 'too_early', 'content': time_placed}))
                    continue
                else:
                    await websocket.send_text(json.dumps({'type': 'placed_time', 'content': time_placed}))

                await canvas.put_pixel(x, y, color)
                event_id = current_event_number
                current_event_number += 1
                await broadcast_pixel(x, y, color, event_id)
            else:
                logger.error('unknown message recieved!', message)

        except starlette.websockets.WebSocketDisconnect:
            logger.error('disconnect')
            del clients[local_uid]
            return
        except Exception as err:
            logger.error('unknown err', err)
            del clients[local_uid]
            return


@ app.get("/get_auth_url")
async def yandex_get_auth_url() -> RedirectResponse:
    return RedirectResponse(get_auth_url())


@ app.get("/handle_code")
async def yandex_get_user_info(code: str, cid: str) -> RedirectResponse:  # cid - ???
    user = await get_user_by_code(code)
    # TODO: only phystech.edu mails
    cookie = await handle_user_auth(user.default_email)

    response = RedirectResponse(front_url)
    response.set_cookie(key="auth_token", value=cookie, expires=int(time.time()) + 365 * 86400, secure=True, httponly=True)

    return response
