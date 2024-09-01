import React from 'react';
import './globals';

export const LoadingScreen = () => {
    return (<div className="loading_container">
        <div className="balls">
            <div className="up">
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
            <div className="down">
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
            </div>
        </div>
    </div>)
}