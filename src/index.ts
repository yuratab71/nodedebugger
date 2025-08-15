import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
} from "electron";
import path from "path";
import {
    CONNECT_TO_DEBUGGER,
    GET_FILE_CONTENT,
    GET_FILE_STRUCTURE,
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_DIRECTORY,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants/commands";
import { Status } from "./constants/status";
import { DebuggerDomain } from "./domains/debugger";
import { RuntimeDomain } from "./domains/runtime";
import { DebuggingResponse, MEMORY_USAGE_ID } from "./modules/debugger";
import { Entry, FileManager } from "./modules/fileManager";
import { passMessage } from "./modules/logger";
import Subprocess from "./modules/subprocess";
import { WS } from "./modules/wsdbserver";
import { detectConnectionString } from "./utils/connmatch";

let detectedUrl = "";
let shouldDetectUrl = true;
let platform: NodeJS.Platform;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// eslint-disable-next-line
let ws: WS;
let runtimeDomain: RuntimeDomain;
let debuggerDomain: DebuggerDomain;

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
    platform = process.platform;
    console.log(`Starting Nquisitor on: ${platform}`);
    mainWindow = new BrowserWindow({
        height: 760,
        width: 1024,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    sendStatus(Status.NOT_ACTIVE);

    setInterval(() => {
        if (WS.isConnected() && !!runtimeDomain) {
            runtimeDomain.getMemoryUsage(MEMORY_USAGE_ID);
        }
    }, 2000);
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    Subprocess.kill();
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
    console.log(data.toString());
    mainWindow.webContents.send(PROCESS_LOG, data.toString());
};

const subprocessOnErrror = (data: any) => {
    const str = data.toString();
    if (shouldDetectUrl) {
        const url = detectConnectionString(str);
        if (url) {
            detectedUrl = url;
        }

        shouldDetectUrl = !shouldDetectUrl;
    }
    mainWindow.webContents.send(PROCESS_LOG, `ERROR: ${data.toString()}`);
};

const subprocessOnExit = (code: number, signal: NodeJS.Signals) => {
    console.log(`Process exit code ${code} and signal ${signal}`);
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
        FileManager.removeInstance();
        fileManager = FileManager.instance({
            src: result.filePaths[0],
            onFileStructureResolveCallback: (files: Entry[]) => {
                mainWindow.webContents.send(GET_FILE_STRUCTURE, files);
            },
        });
        return;
    }

    console.log("Unable to locate directory");
});

ipcMain.on(START_SUBPROCESS, () => {
    if (Subprocess.isRunning()) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("Process already running"),
        );
        return;
    }
    let mainPath = fileManager.getPathToMain();
    if (!mainPath) {
        // TODO just a hardcode
        mainPath = "C:\Users\ASUS\Desktop\nest_app\dist";
    }
    subprocess = Subprocess.instance({
        entry: path.normalize(mainPath),
        onData: subprocessOnData,
        onError: subprocessOnErrror,
        onExit: subprocessOnExit,
    });

    mainWindow.webContents.send(
        PROCESS_LOG,
        passMessage(
            `starting and external process with entry: ${subprocess.entry}`,
        ),
    );
});

ipcMain.on(TERMINATE_SUBPROCESS, () => {
    if (Subprocess.isRunning()) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("terminating the process"),
        );
        Subprocess.kill();
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("process isnt running"),
        );
    }
});

const onConnectToDebugger = (connectionString: string) => {
    console.log(
        `Connecting to debugger with ${connectionString} and isAlreadyAttached ${WS.isConnected()}`,
    );
    if (!WS.isConnected()) {
        ws = WS.instance({
            url: connectionString,
            onStatusUpdateCallback: sendStatus,
            onMessageCallback: processWebSocketMessage,
        });
        runtimeDomain = new RuntimeDomain(ws);
        debuggerDomain = new DebuggerDomain(ws);
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("Debugger already attached"),
        );
    }
};

ipcMain.on(CONNECT_TO_DEBUGGER, (_: IpcMainEvent, connstr: string) => {
    let connectionString;
    if (!connstr) {
        connectionString = detectedUrl;
    } else {
        connectionString = connstr;
    }

    onConnectToDebugger(connectionString);
});

ipcMain.on(SET_WS_STATUS, (_: IpcMainEvent, status: string) => {
    mainWindow.webContents.send(SET_WS_STATUS, status);
});

ipcMain.on(RESUME_EXECUTION, () => {
    runtimeDomain.runIfWaitingForDebugger(messageId++);
});

ipcMain.handle(GET_FILE_CONTENT, async (_: IpcMainInvokeEvent, src: string) => {
    if (fileManager?.main) return fileManager.readFile(src);

    return "";
});
