import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent } from "electron";
import path from "path";
import {
    CONNECT_TO_DEBUGGER,
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_DIRECTORY,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants/commands";
import { Status } from "./constants/status";
// import { DebuggerDomain } from "./domains/debugger";
import { RuntimeDomain } from "./domains/runtime";
import { DebuggingResponse, MEMORY_USAGE_ID } from "./modules/debugger";
import { FileManager } from "./modules/fileManager";
import { passMessage } from "./modules/logger";
import Subprocess from "./modules/subprocess";
import { WS } from "./modules/wsdbserver";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// eslint-disable-next-line
let ws: WS;
let runtimeDomain: RuntimeDomain;
// let debuggerDomain: DebuggerDomain;

let fileManager: FileManager;
let subprocess: Subprocess;
let status: Status = Status.NOT_ACTIVE;
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

const subprocessOnData = (data: any) => {
    mainWindow.webContents.send(PROCESS_LOG, data.toString());
};

const subprocessOnErrror = (data: any) => {
    const str = data.toString();

    const match = str.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
    );

    if (match) {
        onConnectToDebugger(`ws://127.0.0.1:9229/${match[0]}`);
        console.log(`Connection string is ws://127.0.0.1:9229/${match[0]}`);
    }
    mainWindow.webContents.send(PROCESS_LOG, `ERROR: ${data.toString()}`);
};

const subprocessOnExit = (code: number, signal: NodeJS.Signals) => {
    mainWindow.webContents.send(
        PROCESS_LOG,
        passMessage(`Process exited with code ${code} and signal:${signal}`),
    );
};

// main event that trigger all application, must be set first;
ipcMain.on(SET_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    if (
        !result.canceled &&
        result.filePaths.length > 0 &&
        result.filePaths[0]
    ) {
        fileManager = new FileManager(result.filePaths[0]);
        return;
    }

    console.log("Unable to locate directory");
});

ipcMain.on(START_SUBPROCESS, () => {
    if (subprocess?.isRunning()) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("Process already running"),
        );
        return;
    }
    mainWindow.webContents.send(
        PROCESS_LOG,
        passMessage("starting and external process"),
    );

    subprocess = new Subprocess({
        src: path.normalize(fileManager.getPathToMain()),
        onData: subprocessOnData,
        onError: subprocessOnErrror,
        onExit: subprocessOnExit,
    });
});

ipcMain.on(TERMINATE_SUBPROCESS, () => {
    if (subprocess.isRunning()) {
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

const onConnectToDebugger = (connectionString: string) => {
    if (!WS.isReady(ws)) {
        ws = new WS({
            url: connectionString,
            onStatusChange: sendStatus,
            onMessage: processWebSocketMessage,
        });
        runtimeDomain = new RuntimeDomain(ws);
        // debuggerDomain = new DebuggerDomain(ws);
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("Debugger already attached"),
        );
    }
};

ipcMain.on(CONNECT_TO_DEBUGGER, (_: IpcMainEvent, connstr: string) =>
    onConnectToDebugger(connstr),
);

ipcMain.on(SET_WS_STATUS, (_: IpcMainEvent, status: string) => {
    mainWindow.webContents.send(SET_WS_STATUS, status);
});

ipcMain.on(RESUME_EXECUTION, () => {
    runtimeDomain.runIfWaitingForDebugger(messageId++);
});
