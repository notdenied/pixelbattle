from sqlalchemy_utils import database_exists, create_database
from sqlalchemy import create_engine
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from urllib import parse


db_ip = 'localhost'
user = 'root'
password = ''


class Base(DeclarativeBase):
    pass


class Pixel(Base):
    __tablename__ = "pixels"
    x: Mapped[int] = mapped_column(index=True, primary_key=True)
    y: Mapped[int] = mapped_column(index=True, primary_key=True)
    color: Mapped[str] = mapped_column(String(10))


url = f"mysql+pymysql://{user}:{parse.quote_plus(password)}"
url += f"@{db_ip}/pixelbattle"

engine = create_engine(url, echo=True, pool_recycle=10*60, pool_size=8)

if not database_exists(engine.url):
    create_database(engine.url)

Base.metadata.create_all(engine)
