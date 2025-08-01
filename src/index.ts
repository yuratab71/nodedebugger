import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";
import { WebSocket } from "ws";
import {
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_CONNECTION_STRING,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants";
import {
    DebuggingMessage,
    DebuggingResponse,
    MEMORY_USAGE_ID,
    RUNTIME,
} from "./modules/debuggigmessages";
import { passMessage } from "./modules/logger";
import { ConnectionStatus, initWs } from "./modules/wsdbserver";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let subprocess: ChildProcessWithoutNullStreams;
// eslint-disable-next-line
let ws: WebSocket;

let status: ConnectionStatus = "not active";
let messageId = 2;

let mainWindow: BrowserWindow;

if (require("electron-squirrel-startup")) {
    app.quit();
}

const sendStatus = (st: ConnectionStatus) => {
    status = st;
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

    setInterval(() => {
        if (status === "connected") {
            ws.send(
                JSON.stringify(
                    new DebuggingMessage(MEMORY_USAGE_ID, RUNTIME.evaluate, {
                        expression: "process.memoryUsage()",
                        returnByValue: true,
                    }),
                ),
            );
        }
    }, 2000);
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

const processMessage = (message: DebuggingResponse) => {
    console.log(message);
    switch (message.id) {
        case MEMORY_USAGE_ID:
            mainWindow.webContents.send(SET_MEMORY_USAGE, message);
    }
};

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
            "--max-old-space-size=1024",
            "--trace-gc",
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

ipcMain.on(
    SET_CONNECTION_STRING,
    (_: IpcMainEvent, connectionString: string) => {
        if (ws?.readyState != WebSocket.OPEN) {
            ws = initWs(connectionString, sendStatus, processMessage);
        } else {
            mainWindow.webContents.send(
                PROCESS_LOG,
                passMessage("Debugger already attached"),
            );
        }
    },
);

ipcMain.on(SET_WS_STATUS, (_: IpcMainEvent, status: string) => {
    mainWindow.webContents.send(SET_WS_STATUS, status);
});

ipcMain.on(RESUME_EXECUTION, () => {
    console.log(messageId);
    ws.send(
        JSON.stringify(
            new DebuggingMessage(messageId++, RUNTIME.runIfWaitingForDebugger),
        ),
    );
});
