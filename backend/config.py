import json


debug = False

with open('config.json') as f:
    data = json.load(f)

admin_ids = data['admin_ids']
is_game_ended = data['is_game_ended']

db_user = data['db_user']
db_password = data['db_password']

yandex_client_id = data['yandex_client_id']
yandex_client_secret = data['yandex_client_secret']
yandex_redirect_url = 'http://localhost:8000/handle_code' if debug else data['yandex_redirect_url']

front_url = 'http://localhost:1234/' if debug else data['front_url']
