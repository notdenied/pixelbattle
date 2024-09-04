import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Point } from "@pixi/math";

import './globals';

import { width, height, default_zoom, min_scale, max_scale, back_color } from './constants';

import { send_pixel } from "./websockets";


document.querySelector("canvas").style['display'] = 'none';

export const app = new PIXI.Application({
  view: document.querySelector("canvas"),
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  autoDensity: true,
  backgroundColor: back_color,
  resolution: devicePixelRatio
});

export const viewport = new Viewport({
  worldWidth: width,
  worldHeight: height,
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  divWheel: app.view,
  interaction: app.renderer.plugins.interaction
}).drag()
  .pinch()
  .wheel()
  .fit(true, width, height)
  .zoomPercent(default_zoom, true)
  .clampZoom({
    maxScale: max_scale,
    minScale: min_scale,
    // maxWidth: size.x * config.zoom.maxLevel,
    // maxHeight: size.y * config.zoom.maxLevel,
    // minWidth: config.zoom.minLevelPx,
    // minHeight: config.zoom.minLevelPx
  })
  .moveCenter(new Point(width / 2, height / 2)).decelerate();

function pos_to_coords(pos) {
  return { x: Math.round(pos.x - 0.5), y: Math.round(pos.y - 0.5) };
}

function handle_click(x, y) {
  if (x < 0 || y < 0 || x > width || y > height) {
    return;
  }

  send_pixel(x, y, globalThis.color);
}

let mooved = true; // trick for case with click before loading

function handle_down(e) {
  mooved = false;
}

function handle_move(e) {
  mooved = true;
}

function handle_up(e) {
  const pos = pos_to_coords(viewport.toWorld(e.data.global));
  if (!mooved) {
    // console.log('handling click:');
    // console.log({ x: pos.x, y: pos.y });
    handle_click(pos.x, pos.y);
  }
}

viewport.on('mousedown', (e) => {
  handle_down(e);
});

viewport.on('mousemove', (e) => {
  handle_move(e);
});

viewport.on('mouseup', (e) => {
  // console.log('mouseup');
  handle_up(e);
});

viewport.on('touchstart', (e) => {
  handle_down(e);
});

viewport.on('touchmove', (e) => {
  handle_move(e);
});

viewport.on('touchend', (e) => {
  handle_up(e);
  // console.log('touchend');
});

app.stage.addChild(viewport);
app.ticker.start();

const onResize = () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  viewport.resize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);
