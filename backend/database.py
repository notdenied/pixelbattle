from sqlalchemy_utils import database_exists, create_database
from sqlalchemy import create_engine
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.types import BigInteger
from urllib import parse

from config import db_user, db_password


db_ip = 'localhost'


class Base(DeclarativeBase):
    pass


class Pixel(Base):
    __tablename__ = "pixels"
    x: Mapped[int] = mapped_column(index=True, primary_key=True)
    y: Mapped[int] = mapped_column(index=True, primary_key=True)
    color: Mapped[str] = mapped_column(String(10))


class User(Base):
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(index=True, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(64))
    last_pixel_time: Mapped[int] = mapped_column(BigInteger(), default=0)
    cookie: Mapped[str] = mapped_column(String(128))  # TODO: table with sessions


url = f"mysql+pymysql://{db_user}:{parse.quote_plus(db_password)}"
url += f"@{db_ip}/pixelbattle"

engine = create_engine(url, echo=False, pool_recycle=10*60, pool_size=8)

if not database_exists(engine.url):
    create_database(engine.url)

Base.metadata.create_all(engine)
