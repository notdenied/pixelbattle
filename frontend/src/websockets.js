import { draw_pixel } from "./graphics";
import { width, height, draw_cooldown } from "./constants";

import './globals';
import { ws_url, auth_url } from "./constants";

import ReconnectingWebSocket from "./reconnecting_socket";


function finish_loading() {
    document.querySelector("canvas").style.removeProperty('display');
    document.querySelector(".loading_container").style['display'] = 'none';
    document.querySelector(".palette").style.removeProperty('display');
    globalThis.loading = false;
}

function send_pixel(x, y, color) {
    if (globalThis.game_ended) {
        globalThis.add_snackbar_info_alert('Пиксель не поставлен - игра окончена, спасибо за участие!');
        return;
    }

    if (!globalThis.socket_opened) {
        globalThis.add_snackbar_error_alert('Нет соединения с сервером! Попробуйте обновить страницу...');
        return;
    }

    if (pixels_colors[y * width + x] == color) {
        globalThis.add_snackbar_info_alert('Пиксель не поставлен - он уже покрашен в этот цвет!');
        return;
    }

    let time = draw_cooldown * 1000 - (Date.now() - globalThis.last_pixel_drawn_time);
    if (time >= 0 && !globalThis.is_admin) {
        // time = Math.ceil(time / 1000);
        globalThis.add_snackbar_info_alert('Пиксель не поставлен - кулдаун ещё не прошёл!');
        return;
    }

    globalThis.last_pixel_drawn_time = Date.now(); // TODO: add ~ping?

    // Костыль: рисуем у себя локально с минимальным приоритетом, затем высылаем.
    socket.send(JSON.stringify({ 'type': 'put_pixel', 'content': { 'x': x, 'y': y, 'color': color } }));
    pixels_priority[y * width + x] = 0;
    draw_pixel(x, y, color);
}

function div(val, by) {
    return (val - val % by) / by;
}

var pixels_priority = new Array(width * height).fill(0);
var pixels_colors = new Array(width * height).fill(0);

let socket = new ReconnectingWebSocket(ws_url + '?time=' + Date.now());
globalThis.socket_opened = false;

let send_sync_event_time = 0;

socket.onopen = function (e) {
    console.log("[open]");
    globalThis.socket_opened = true;


};

socket.onmessage = function (event) {
    console.log(`[message] Данные получены с сервера: ${event.data}`);

    var data = JSON.parse(event.data);

    if (data.type == 'draw_pixel') {
        pixels_priority[data.content.y * width + data.content.x] = Math.max(pixels_priority[data.content.y * width + data.content.x], data.content.event_id);

        if (pixels_priority[data.content.y * width + data.content.x] == data.content.event_id) {
            pixels_colors[data.content.y * width + data.content.x] = data.content.color;
            draw_pixel(data.content.x, data.content.y, data.content.color);
        }
    }

    else if (data.type == 'draw_initial_map') {
        globalThis.last_pixel_drawn_time = data.content.last_placed;
        for (let i = 0; i < width * height; i++) {
            var x = i % width;
            var y = div(i, width);
            if (pixels_priority[i] == 0) {
                pixels_colors[y * width + x] = data.content.map[i];
                draw_pixel(x, y, data.content.map[i]);
            }
        }

        send_sync_event_time = Date.now();
        socket.send(JSON.stringify({ 'type': 'sync_time' }));
        finish_loading();
    }

    else if (data.type == 'need_reauth') {
        socket.close();
        window.location.replace(auth_url);
    }

    else if (data.type == 'placed_time') {
        globalThis.last_pixel_drawn_time = data.content + globalThis.timedelta;
    }

    else if (data.type == 'too_early') {
        globalThis.add_snackbar_error_alert('Пиксель не поставлен! Кулдаун ещё не прошёл...')
    }

    else if (data.type == 'game_ended') {
        globalThis.add_snackbar_success_alert('Игра закончена. Спасибо! <3');
        globalThis.game_ended = true;
        socket.close();
    }

    else if (data.type == 'set_admin') {
        globalThis.add_snackbar_success_alert('Админские права применены!');
        globalThis.is_admin = true;
    }

    else if (data.type == 'sync_time') {
        let our_time = Date.now();
        let send_recieve_time = our_time - send_sync_event_time;
        let cur_server_time = data.content + send_recieve_time / 2;
        globalThis.timedelta = our_time - cur_server_time;
        console.log('send + receive (in ms): ' + send_recieve_time);
        console.log('timedelta (our - server): ' + globalThis.timedelta);
    }

    else {
        globalThis.add_snackbar_error_alert('Получено неизвестное событие: ' + data);
    }
};

// function show_error_alert(text) {
//     document.querySelector(".alert_load_error").style.removeProperty('display');
//     document.querySelector(".palette").style['display'] = 'none';
// }

socket.onclose = function (event) {
    console.log('ws closed:');
    console.log(event);

    globalThis.socket_opened = false;

    if (event.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
        console.log('[close] Соединение прервано');

        // setTimeout(() => { create_socket(); }, 5000);
        // setTimeout(() => { handle_error(); }, 10000);
    }

    // show_error_alert();
};

// function handle_error() {
//     if (socket_opened) {
//         return;
//     }

//     show_error_alert();
// }

// function create_socket() {
//     console.log('creating socket instance...');
//     socket = new WebSocket(ws_url + '?time=' + Date.now());
//     console.log('created socket instance!');
// }

socket.onerror = function (error) {
    console.log('ws error:');
    console.log(error);

    // setTimeout(() => { create_socket(); }, 1000);
    // setTimeout(() => { handle_error(); }, 5000); // 5s
};

export { send_pixel };