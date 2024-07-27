from contants import WIDTH, HEIGHT
from database import *

from sqlalchemy.orm import Session
from sqlalchemy import select


class Canvas:
    def __init__(self):
        with Session(engine) as session:
            res = select(Pixel)
            pixels = session.scalars(res).all()
            self.data = [f'#FFFFFF' for _ in range(WIDTH*HEIGHT)]
            for pixel in pixels:
                self.data[pixel.y * WIDTH + pixel.x] = pixel.color

    async def put_pixel(self, x, y, color):
        self.data[y * WIDTH + x] = color
        with Session(engine) as session:
            query = select(Pixel).where(Pixel.x == x).where(Pixel.y == y)
            pixel = session.scalars(query).one_or_none()
            if pixel:
                pixel.color = color
            else:
                session.add(Pixel(x=x, y=y, color=color))

            session.commit()

    def get_map(self):
        return self.data

    def color_to_hex(self, r, g, b):
        def clamp(x):
            return max(0, min(x, 255))

        return "#{0:02x}{1:02x}{2:02x}".format(clamp(r), clamp(g), clamp(b))
