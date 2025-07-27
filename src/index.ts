import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";
import { WebSocket } from "ws";
import {
    PROCESS_LOG,
    SET_CONNECTION_STRING,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants";
import { passMessage } from "./modules/logger";
import { ConnectionStatus, initWs } from "./modules/wsdbserver";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let subprocess: ChildProcessWithoutNullStreams; 
// eslint-disable-next-line
let ws: WebSocket;

let mainWindow: BrowserWindow;

if (require("electron-squirrel-startup")) {
    app.quit();
}

const sendStatus = (status: ConnectionStatus) => {
    mainWindow.webContents.send(SET_WS_STATUS, status);
};

const createWindow = (): void => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    sendStatus("not active");
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const isProcessRunning = (): boolean => {
    return !subprocess?.killed && subprocess?.exitCode === null;
};

ipcMain.on(START_SUBPROCESS, () => {
    if (isProcessRunning()) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("process already running"),
        );
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("starting and external process"),
        );
        subprocess = spawn("node", [
            "--inspect-brk",
            path.normalize("C:\\Users\\ASUS\\Desktop\\nest_app\\dist\\main.js"),
        ]);

        subprocess.stdout.on("data", (data) => {
            mainWindow.webContents.send(PROCESS_LOG, data.toString());
        });

        subprocess.stderr.on("data", (data) => {
            mainWindow.webContents.send(
                PROCESS_LOG,
                `ERROR: ${data.toString()}`,
            );
        });

        subprocess.on("exit", (code) => {
            mainWindow.webContents.send(
                PROCESS_LOG,
                passMessage(`Process exited with code ${code}`),
            );
        });


    }
});

ipcMain.on(TERMINATE_SUBPROCESS, () => {
    if (isProcessRunning()) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("terminating the process"),
        );
        subprocess.kill();
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("process isnt running"),
        );
    }
});

ipcMain.on(SET_CONNECTION_STRING, (_: IpcMainEvent, connectionString: string) => {
    if (ws?.readyState != WebSocket.OPEN) { ws = initWs(connectionString, sendStatus) } else {
        mainWindow.webContents.send(PROCESS_LOG, passMessage("Debugger already attached"));
    }
})

ipcMain.on(SET_WS_STATUS, (event: IpcMainEvent, status: string) => {
    mainWindow.webContents.send(SET_WS_STATUS, status);
});
