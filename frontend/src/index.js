import { GraphPaper, GraphStyle } from "pixi-graphpaper";
import { viewport, app } from "./scene";
import { box } from './graphics';
import { width, height } from "./constants";
import App from './bottom';

import { LoadingScreen } from "./loading";

import React from 'react';
import ReactDOM from 'react-dom/client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';


// Background grid for reference
const paper = new GraphPaper(GraphStyle.BLUEPRINT)
paper.graphHeight = height;
paper.graphWidth = width;
viewport.addChild(paper);

viewport.addChild(box);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div>
        <LoadingScreen />
        <App />
        <div className="alert_load_error" style={{display: 'none'}}>
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={() => { window.location.reload() }}>
                        Reload
                    </Button>
                }
            >
                Произошла непредвиденная ошибка, попробуй перезагрузить страницу...
            </Alert>
        </div>
    </div>
);

