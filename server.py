import json

from fastapi import FastAPI
from fastapi.websockets import WebSocket

import starlette.websockets


from canvas import Canvas


clients: dict[int, WebSocket] = {}
canvas = Canvas()
current_uid_number = 0
current_event_number = 1


app = FastAPI()


def check_user_token(token: str):
    ...


async def broadcast_pixel(x, y, color, event_id) -> None:
    for user in list(clients.values()):
        try:
            await user.send_text(json.dumps({'type': 'draw_pixel', 'content': {'x': x, 'y': y, 'color': color, 'event_id': event_id}}))
        except Exception as err:
            print('broadcast err:', err)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global current_uid_number, current_event_number
    params = dict(websocket.query_params.items())

    if params['a'] != '1':
        return

    uid = current_uid_number
    current_uid_number += 1

    await websocket.accept()
    clients[uid] = websocket

    await websocket.send_text(json.dumps({'type': 'draw_initial_map', 'content': canvas.get_map()}))

    while True:
        try:
            message = json.loads(await websocket.receive_text())
            if message['type'] == 'put_pixel':
                x, y, color = message['content']['x'], message['content']['y'], message['content']['color']
                await canvas.put_pixel(x, y, color)
                event_id = current_event_number
                current_event_number += 1
                await broadcast_pixel(x, y, color, current_event_number)
            else:
                print('unknown message recieved!', message)
        except starlette.websockets.WebSocketDisconnect:
            print('disconnect')
            del clients[uid]
            return
        except Exception as err:
            print('unknown err', err)
            del clients[uid]
            return
