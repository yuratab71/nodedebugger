import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";
import {
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_CONNECTION_STRING,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants/commands";
import { Status } from "./constants/status";
import { DebuggerDomain } from "./domains/debugger";
import { RuntimeDomain } from "./domains/runtime";
import { DebuggingResponse, MEMORY_USAGE_ID } from "./modules/debugger";
import { passMessage } from "./modules/logger";
import { WS } from "./modules/wsdbserver";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let subprocess: ChildProcessWithoutNullStreams;
// eslint-disable-next-line
let ws: WS;
let runtimeDomain: RuntimeDomain;
let debuggerDomain: DebuggerDomain;

let status: Status = Status.NOT_ACTIVE;
let isStringChecked = false;
let connectionString = null;
let messageId = 4;

let mainWindow: BrowserWindow;

if (require("electron-squirrel-startup")) {
    app.quit();
}

const sendStatus = (st: Status) => {
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

    sendStatus(Status.NOT_ACTIVE);

    setInterval(() => {
        if (status === "connected" && !!runtimeDomain) {
            runtimeDomain.getMemoryUsage(MEMORY_USAGE_ID);
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

const processWebSocketMessage = (message: DebuggingResponse) => {
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
            if (!isStringChecked) {
                const str = data.toString();

                const match = str.match(
                    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
                );

                if (match) {
                    connectionString = match[0];
                    console.log(
                        `Connection string is ws://127.0.0.1:9229/${match[0]}`,
                    );

                    isStringChecked = true;
                }
            }
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
        ws = null;
        isStringChecked = false;
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
        if (!WS.isReady(ws)) {
            ws = new WS({
                url: connectionString,
                onStatusChange: sendStatus,
                onMessage: processWebSocketMessage,
            });
            runtimeDomain = new RuntimeDomain(ws);
            debuggerDomain = new DebuggerDomain(ws);
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
    runtimeDomain.runIfWaitingForDebugger(messageId++);
});
