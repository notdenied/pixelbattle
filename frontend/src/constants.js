const width = 100;
const height = 100;

const default_zoom = -0.1;
const max_scale = 50; // 75;
const min_scale = 2;

const draw_cooldown = 10;

const back_color = 0x0123;
const colors = ["000000", "858585", "FFFFFF", "FF218B", "FE2000", "FFA500", "FCF700", "00EE00", "3AAFFF", "074BF3", "4D2C9C"];

const debug = false;

const ws_url = debug ? 'ws://localhost:8000/ws' : 'wss://ws.c3po.ru/ws';
const auth_url = debug ? 'http://localhost:8000/static/rules.html' : "https://ws.c3po.ru/static/rules.html";

export { draw_cooldown, width, height, default_zoom, min_scale, max_scale, back_color, colors, ws_url, auth_url };