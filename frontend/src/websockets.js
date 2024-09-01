import { draw_pixel } from "./graphics";
import { width, height, draw_cooldown } from "./constants";

import './globals';
import { ws_url, auth_url } from "./constants";


function finish_loading() {
    document.querySelector("canvas").style.removeProperty('display');
    document.querySelector(".loading_container").style['display'] = 'none';
    document.querySelector(".palette").style.removeProperty('display');
    globalThis.loading = false;
}

function send_pixel(x, y, color) {
    let time = draw_cooldown * 1000 - (Date.now() - globalThis.last_pixel_drawn_time);
    if (time >= 0) {
        // time = Math.ceil(time / 1000);
        alert('cant draw');
        return;
    }

    globalThis.last_pixel_drawn_time = Date.now(); // TODO: add ~ping?
    // Костыль: рисуем у себя локально с минимальным приоритетом, затем высылаем.
    socket.send(JSON.stringify({ 'type': 'put_pixel', 'content': { 'x': x, 'y': y, 'color': color } }));
    pixels_map[y * width + x] = 0;
    draw_pixel(x, y, color);
}

function div(val, by) {
    return (val - val % by) / by;
}

//
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 365));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
//

// response.set_cookie(key="auth_token", value=cookie, expires=int(time.time()) + 365 * 86400, domain="*.localhost", secure=True, httponly=True)
// Страшный костыль: ставим куки на стороне фронта...
const url_params = new URLSearchParams(window.location.search);
const auth_token = url_params.get('auth_token');
if (auth_token) {
    setCookie('auth_token', auth_token, 365)
    window.location.replace('/');
}

var pixels_map = new Array(width * height).fill(0);

let socket = new WebSocket(ws_url);

socket.onopen = function (e) {
    console.log("[open]");
};

socket.onmessage = function (event) {
    console.log(`[message] Данные получены с сервера: ${event.data}`);

    var data = JSON.parse(event.data);

    if (data.type == 'draw_pixel') {
        pixels_map[data.content.y * width + data.content.x] = Math.max(pixels_map[data.content.y * width + data.content.x], data.content.event_id);

        if (pixels_map[data.content.y * width + data.content.x] == data.content.event_id) {
            draw_pixel(data.content.x, data.content.y, data.content.color);
        }
    }

    else if (data.type == 'draw_initial_map') {
        globalThis.last_pixel_drawn_time = data.content.last_placed;
        for (let i = 0; i < width * height; i++) {
            var x = i % width;
            var y = div(i, width);
            if (pixels_map[i] == 0)
                draw_pixel(x, y, data.content.map[i]);
        }
        finish_loading();
    }

    else if (data.type == 'need_reauth') {
        window.location.replace(auth_url);
    }

    else if (data.type == 'placed_time') {
        globalThis.last_pixel_drawn_time = data.content;
    }

    // TODO: too_early, placed_time
};

function show_error_alert() {
    document.querySelector(".alert_load_error").style.removeProperty('display');
    document.querySelector(".palette").style['display'] = 'none';
}

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
        console.log('[close] Соединение прервано');
    }

    show_error_alert();
};

socket.onerror = function (error) {
    console.log('[error]', error);

    show_error_alert();
};

export { send_pixel };