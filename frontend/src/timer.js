import React from 'react';

import { useState, useEffect } from 'react';

import { draw_cooldown } from './constants';

import "./globals";


const Timer = () => {
    const [seconds, setSeconds] = useState('00');

    const getTime = () => {
        let time = draw_cooldown * 1000 - (Date.now() - globalThis.last_pixel_drawn_time);

        if (globalThis.loading) {
            return;
        }

        if (time < 0) {
            setSeconds('ok');
        } else {
            time = Math.ceil(time / 1000);
            if (time < 10) {
                setSeconds('0' + time);
            }
            else {
                setSeconds(time);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => getTime(), 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="timer" >
            {seconds}
        </div>
    );
};


export default Timer;