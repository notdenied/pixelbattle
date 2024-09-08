import React from "react";
import { SnackbarProvider } from "notistack";
import { useSnackbar } from "notistack";
// import { Button, Alert } from "@mui/material";

import './globals';

function Notification(props) {
    const { enqueueSnackbar } = useSnackbar();

    // Как будто бы теперь нет кейса, где мне нужно давать кнопку для релоада? Ну и это сложно -> скип.

    globalThis.add_snackbar_error_alert = (msg) => {
        enqueueSnackbar(
            <div className="snackbar_alert">{msg}</div>,
            {
                variant: "error",
                autoHideDuration: 10000,
                anchorOrigin: { vertical: "top", horizontal: "right" }
            });
    }

    globalThis.add_snackbar_info_alert = (msg) => {
        enqueueSnackbar(
            <div className="snackbar_alert">{msg}</div>,
            {
                variant: "info",
                autoHideDuration: 5000,
                anchorOrigin: { vertical: "top", horizontal: "right" }
            });
    }

    globalThis.add_snackbar_success_alert = (msg) => {
        enqueueSnackbar(
            <div className="snackbar_alert">{msg}</div>,
            {
                variant: "success",
                autoHideDuration: 5000,
                anchorOrigin: { vertical: "top", horizontal: "right" }
            });
    }

    return (
        <div></div> // ))
    );
}

export default function Snackbar() {
    return (
        <SnackbarProvider maxSnack={3}>
            <Notification />
        </SnackbarProvider>
    );
}