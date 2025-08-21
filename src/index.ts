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
    DEBUGGER_ENABLE,
    GET_FILE_CONTENT,
    GET_FILE_STRUCTURE,
    GET_SOURCE_MAP,
    ON_FILE_STRUCTURE_RESOLVE,
    ON_ROOT_DIR_RESOLVE,
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_BREAKPOINT,
    SET_DIRECTORY,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants/commands";
import { MEMORY_USAGE_UPDATE_DELAY } from "./constants/debugger";
import { Ids } from "./constants/debuggerMessageIds";
import { Status } from "./constants/status";
import { DebuggerDomain, DebuggerEvents } from "./domains/debugger";
import { RuntimeDomain } from "./domains/runtime";
import { DebuggingResponse } from "./modules/debugger";
import { Entry, FileManager } from "./modules/fileManager";
import { Logger, passMessage } from "./modules/logger";
import Subprocess from "./modules/subprocess";
import { WS } from "./modules/wsdbserver";
import { detectConnectionString } from "./utils/connmatch";

let detectedUrl = "";
let shouldDetectUrl = true;
let platform: NodeJS.Platform;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Inti all required modules ====================
// eslint-disable-next-line
let ws: WS;
let status: Status = Status.NOT_ACTIVE;

let runtimeDomain: RuntimeDomain;
let debuggerDomain: DebuggerDomain;

let subprocess: Subprocess;
let fileManager: FileManager;
const urls: string[] = [];
const scriptIds: string[] = [];

let mainWindow: BrowserWindow;
const logger = new Logger("IPC MAIN");

// =============================================

if (require("electron-squirrel-startup")) {
    app.quit();
}

const sendStatus = (st: Status) => {
    status = st;
    mainWindow.webContents.send(SET_WS_STATUS, status);
};

const createWindow = (): void => {
    platform = process.platform;
    logger.log(`Starting Nquisitor on: ${platform}`);
    mainWindow = new BrowserWindow({
        height: 760,
        width: 1024,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    sendStatus(Status.NOT_ACTIVE);

    // prevent subprocess to continue execution on linux
    process.on("SIGINT", () => {
        logger.log("received SIGINT signal");
        Subprocess.kill();
        process.exit(0);
    });

    setInterval(() => {
        if (WS.isConnected() && !!runtimeDomain) {
            // logger.log("getting memory usage");
            runtimeDomain.getMemoryUsage(Ids.RUNTIME.GET_MEMORY_USAGE);
        }
    }, MEMORY_USAGE_UPDATE_DELAY);
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

const processWebSocketMessageCallback = (message: DebuggingResponse) => {
    if (message.id) {
        switch (message.id) {
            case Ids.RUNTIME.GET_MEMORY_USAGE:
                mainWindow.webContents.send(SET_MEMORY_USAGE, message);
                break;
            case Ids.DEBUGGER.ENABLE:
                logger.log("debugger enable response: ");
                logger.group(message);
                break;
            case Ids.DEBUGGER.PAUSE:
                logger.log("debugger pause resp: ");
                logger.group(message);
                break;
            case Ids.DEBUGGER.SET_BREAKPOINT:
                logger.log("set breakpoint");
                logger.group(message);
                break;
            case Ids.DEBUGGER.SET_BREAKPOINT_BY_URL:
                logger.log("set breakpoint by url response");
                logger.group(message);
                break;
            default:
                return;
        }
    }

    if (message.method) {
        // let scriptId;
        // const p = "files:" + fileManager.dir + "/\dist";
        switch (message.method) {
            case DebuggerEvents.PAUSED:
                logger.log("received pause method response");
                mainWindow.webContents.send(
                    PROCESS_LOG,
                    `debugger paused, reason: ${message.params?.reason}`,
                );
                break;
            case DebuggerEvents.SCRIPT_PARSED:
                if (!message.params?.url) break;
                // CONTINUE somewhere here
                if (
                    message?.params?.url.includes("nest_app/\dist") &&
                    message?.params?.sourceMapURL
                ) {
                    // logger.log(message.params.url);
                    fileManager.registerParsedFile(
                        message.params.url,
                        message.params?.sourceMapURL,
                    );
                }
                break;
            default:
                return;
        }
    }
    return;
};

const subprocessOnDataCallback = (data: any) => {
    logger.log("Received data from subprocess: " + data.toString());
    mainWindow.webContents.send(PROCESS_LOG, data.toString());
};

const subprocessOnErrrorCallback = (data: any) => {
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

const subprocessOnExitCallback = (code: number, signal: NodeJS.Signals) => {
    logger.log(`Process exit code ${code} and signal ${signal}`);
    mainWindow.webContents.send(
        PROCESS_LOG,
        passMessage(`Process exited with code ${code} and signal:${signal}`),
    );
};

// main event that trigger all application, must be set first
// parse directory where project located
ipcMain.on(SET_DIRECTORY, onSetDirectoryHandler);

ipcMain.on(START_SUBPROCESS, onStartSubprocessHandler);
ipcMain.on(TERMINATE_SUBPROCESS, onTerminateSubprocessHandler);
ipcMain.on(CONNECT_TO_DEBUGGER, onConnectToDebuggerHandler);
ipcMain.on(SET_WS_STATUS, onSetWsStatusHandler);

ipcMain.handle(GET_FILE_CONTENT, onGetFileContentHandler);
ipcMain.handle(GET_FILE_STRUCTURE, onGetFileStructureHandler);
ipcMain.handle(GET_SOURCE_MAP, onGetSourceMapHandler);
ipcMain.on(DEBUGGER_ENABLE, onDebuggerEnableHandler);
ipcMain.on(SET_BREAKPOINT, onSetBreakpoint);
ipcMain.on(RESUME_EXECUTION, onDebuggerResumeHandler);

async function onSetDirectoryHandler(): Promise<void> {
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
            onFileStructureResolveCallback: (root: string, files: Entry[]) => {
                logger.log("sending data to ui");
                mainWindow.webContents.send(ON_FILE_STRUCTURE_RESOLVE, files);
                mainWindow.webContents.send(ON_ROOT_DIR_RESOLVE, root);
            },
        });
        return;
    }

    logger.log("Unable to detect directory");
}

function onStartSubprocessHandler(): void {
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
        onData: subprocessOnDataCallback,
        onError: subprocessOnErrrorCallback,
        onExit: subprocessOnExitCallback,
    });

    mainWindow.webContents.send(
        PROCESS_LOG,
        passMessage(
            `starting and external process with entry: ${subprocess.entry}`,
        ),
    );
}

function onTerminateSubprocessHandler(): void {
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
}

function onConnectToDebuggerHandler(_: IpcMainEvent, connstr: string): void {
    let connectionString;
    if (!connstr) {
        connectionString = detectedUrl;
    } else {
        connectionString = connstr;
    }
    logger.log(
        `Connecting to debugger with ${connectionString} and isAlreadyAttached ${WS.isConnected()}`,
    );
    if (!WS.isConnected()) {
        ws = WS.instance({
            url: connectionString,
            onStatusUpdateCallback: sendStatus,
            onMessageCallback: processWebSocketMessageCallback,
        });
        runtimeDomain = new RuntimeDomain(ws);
        debuggerDomain = new DebuggerDomain(ws);
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("Debugger already attached"),
        );
    }
}

function onSetWsStatusHandler(_: IpcMainEvent, status: string): void {
    mainWindow.webContents.send(SET_WS_STATUS, status);
}

function onGetFileContentHandler(_: IpcMainInvokeEvent, src: string): string {
    if (fileManager?.main) return fileManager.readFile(src);
    return "";
}

function onGetFileStructureHandler(_: IpcMainInvokeEvent, src: string) {
    if (fileManager?.main) return fileManager.getDirectoryContent(src);

    return [];
}

function onDebuggerEnableHandler() {
    debuggerDomain.enable(Ids.DEBUGGER.ENABLE);
    runtimeDomain.runIfWaitingForDebugger(
        Ids.RUNTIME.RUN_IF_WAITING_FOR_DEBUGGER,
    );
}

function onDebuggerResumeHandler() {
    debuggerDomain.resume(Ids.DEBUGGER.RESUME);
}

function onSetBreakpoint() {
    for (let i = 0; i < urls.length; i++) {
        logger.log(urls[i]);
        logger.log(scriptIds[i]);
    }

    if (fileManager.main && urls[0] && scriptIds[0]) {
        debuggerDomain.setBreakpoint(Ids.DEBUGGER.SET_BREAKPOINT, scriptIds[0]);
    }
}

function onGetSourceMapHandler(_: IpcMainInvokeEvent, src: string) {
    return fileManager.evaluateSourceMap(src);
}
