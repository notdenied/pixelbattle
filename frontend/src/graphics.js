import { Graphics } from "pixi.js";

const box = new Graphics();
box.interactive = true;
box.position.set(0, 0);

function draw_pixel(x, y, color) {
    // console.log('draw pixel ' + x + ' ' + y + ' ' + color);
    box.beginFill(color, 1);
    box.drawRect(x, y, 1, 1);
}

export { draw_pixel, box };