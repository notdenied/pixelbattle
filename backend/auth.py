import uuid

from yandexid import AsyncYandexOAuth
from yandexid import AsyncYandexID

from config import yandex_client_id, yandex_client_secret, yandex_redirect_url, admin_ids
from database import *

from sqlalchemy.orm import Session
from sqlalchemy import select


yandex_oauth = AsyncYandexOAuth(
    client_id=yandex_client_id,
    client_secret=yandex_client_secret,
    redirect_uri=yandex_redirect_url
)


def get_auth_url():
    auth_url = yandex_oauth.get_authorization_url()
    return auth_url


async def get_user_by_code(code):
    token = await yandex_oauth.get_token_from_code(code)
    yandex_id = AsyncYandexID(token.access_token)
    user_info = await yandex_id.get_user_info_json()
    return user_info


async def handle_user_auth(email):
    with Session(engine) as session:
        res = select(User).where(User.email == email)
        user = session.scalars(res).one_or_none()

        if not user:
            cookie = uuid.uuid4().__str__()
            session.add(User(email=email, cookie=cookie))
        else:
            cookie = user.cookie
        session.commit()

    return cookie


async def get_user_by_cookie(auth_token):
    with Session(engine) as session:
        res = select(User).where(User.cookie == auth_token)
        user = session.scalars(res).one_or_none()
        return (user.user_id, user.last_pixel_time, user.user_id in admin_ids) if user else (-1, -1, False)
