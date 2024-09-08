import { Graphics } from "pixi.js";
import { width, height, borders_color } from "./constants";

const box = new Graphics();
box.interactive = true;
box.position.set(0, 0);

function draw_pixel(x, y, color) {
    // console.log('draw pixel ' + x + ' ' + y + ' ' + color);
    box.beginFill(color, 1);
    box.drawRect(x, y, 1, 1);
}

function draw_borders() {
    for (let x = -1; x <= width; x++) {
        draw_pixel(x, -1, borders_color);
    }
    for (let x = -1; x <= width; x++) {
        draw_pixel(x, height, borders_color);
    }
    for (let y = -1; y <= width; y++) {
        draw_pixel(-1, y, borders_color);
    }
    for (let y = -1; y <= width; y++) {
        draw_pixel(width, y, borders_color);
    }
}

draw_borders();

export { draw_pixel, box };