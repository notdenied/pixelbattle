// import { GraphPaper, GraphStyle } from "pixi-graphpaper";
import { viewport, app } from "./scene";
import { box } from './graphics';
// import { width, height } from "./constants";
import App from './bottom';

import { LoadingScreen } from "./loading";

import "./globals";

import Snackbar from "./snackbar";

import React from 'react';
import ReactDOM from 'react-dom/client';


// Background grid for reference
// const paper = new GraphPaper(GraphStyle.BLUEPRINT)
// paper.graphHeight = height;
// paper.graphWidth = width;
// viewport.addChild(paper);

viewport.addChild(box);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div>
        <LoadingScreen />
        <App />
        <Snackbar />
    </div>
);

