import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
} from "electron";
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
    SET_BREAKPOINT_BY_URL,
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
import { DebuggingResponse } from "./types/debugger";
import { Entry, FileManager } from "./modules/fileManager";
import { Logger, passMessage } from "./modules/logger";
import Subprocess from "./modules/subprocess";
import { WS } from "./modules/wsdbserver";
import { LocationByUrl } from "./types/debugger";
import { StartSubprocessTask } from "./strategies/startSubprocessStrategyTask";
import { TaskQueueRunner } from "./modules/taskQueueRunner";
import { GetConnectionStringTask } from "./strategies/getConnectionStringStrategyTask";

let detectedUrl = "";
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
// const queueProcessor = QueueProcessor.instance();
const urls: string[] = [];
const scriptIds: string[] = [];

let mainWindow: BrowserWindow;
const logger = new Logger("IPC MAIN");
const taskRunner = TaskQueueRunner.instance();

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

    process.on("SIGTERM", () => {
        logger.log("received SIGTERM signal");
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
ipcMain.on(SET_BREAKPOINT_BY_URL, onSetBreakpointByUrlHandler);
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
    const startTask = new StartSubprocessTask({
        mainWindow,
        fileManager,
        subprocess,
    });

    const getConnStrTask = new GetConnectionStringTask({
        ws,
    });

    taskRunner.enqueue(startTask);
    taskRunner.enqueue(getConnStrTask);
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

function onSetBreakpointByUrlHandler(_: IpcMainEvent, loc: LocationByUrl) {
    const ou = fileManager.getOriginUrl(loc.url);
    logger.log(`Original url: ${ou}`);
    debuggerDomain.setBreakpointByUrl(Ids.DEBUGGER.SET_BREAKPOINT_BY_URL, loc);
}
