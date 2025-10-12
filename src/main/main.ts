import type * as electron from "electron";
import { app, BrowserWindow, crashReporter, dialog, ipcMain } from "electron";
import "dotenv/config";
import path from "path";
import type { SourceMapConsumer } from "source-map-js";
import * as commands from "./constants/commands";
import { MEMORY_USAGE_UPDATE_DELAY } from "./constants/debugger";
import { Ids } from "./constants/debuggerMessageIds";
import { Status } from "./constants/status";
import { DebuggerDomain } from "./domains/debugger";
import { RuntimeDomain } from "./domains/runtime";
import { FileManager } from "./modules/fileManager";
import { Logger, passMessage } from "./modules/logger";
import Subprocess from "./modules/subprocess";
import { TaskQueueRunner } from "./modules/taskQueueRunner";
import { WS } from "./modules/wsdbserver";
import { EnableDebuggerTask } from "./strategies/enableDebuggerStrategy";
import { GetConnectionStringTask } from "./strategies/getConnectionStringStrategyTask";
import { StartSubprocessTask } from "./strategies/startSubprocessStrategyTask";
import type { Debugger } from "./types/debugger.types";
import { DebuggerEvents } from "./types/debugger.types";
import type { Entry } from "./types/fileManager.types";
import type { InspectorMessage } from "./types/message.types";

declare const MAIN_WINDOW_VITE_NAME: string | undefined;
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;

// Innit all required modules ====================
let ws: WS;
let status: Status = Status.NOT_ACTIVE;
let runtimeDomain: RuntimeDomain;
let debuggerDomain: DebuggerDomain;
let subprocess: Subprocess;
let fileManager: FileManager;
let mainWindow: BrowserWindow;
const logger = new Logger("IPC MAIN");
const taskRunner = TaskQueueRunner.instance();

// =============================================

if (require("electron-squirrel-startup") != undefined) {
    app.quit();
}

const sendStatus = (st: Status): void => {
    status = st;
    mainWindow.webContents.send(
        commands.ON_WS_CONNECTION_STATUS_UPDATE,
        status,
    );
    return;
};

const createWindow = (): void => {
    logger.log(`Starting Nquisitor on: ${process.platform}`);
    mainWindow = new BrowserWindow({
        height: 760,
        width: 1024,
        icon: path.join(__dirname, "../../public/icon.ico"),
        //        webPreferences: {
        //           preload: "", // path.join(__dirname, "preload.js"),
        //      },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                `../renderer/${MAIN_WINDOW_VITE_NAME ?? ""}index.html`,
            ),
        );
    }

    sendStatus(Status.NOT_ACTIVE);

    setInterval(() => {
        if (WS.isConnected()) {
            runtimeDomain.getMemoryUsage(Ids.RUNTIME.GET_MEMORY_USAGE);
        }
    }, MEMORY_USAGE_UPDATE_DELAY);

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

    mainWindow.webContents.openDevTools();

    process.removeAllListeners("uncaughtException");

    process.on("uncaughtException", (err: Error) => {
        console.error(err);
        process.exit(1);
    });

    console.log("listener set");
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

const processWebSocketMessageCallback = (message: InspectorMessage): void => {
    if (message.id) {
        switch (message.id) {
            case Ids.RUNTIME.GET_MEMORY_USAGE:
                mainWindow.webContents.send(
                    commands.ON_MEMORY_USAGE_UPDATE,
                    message.result.result.value,
                );
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
                if (message.result.locations.length === 0) {
                    logger.log("received invalid breakpoint");
                    return;
                }
                if (message.result.breakpointId) {
                    debuggerDomain.registerBreakpoint(
                        message.result.breakpointId,
                    );
                    logger.group(message.result.locations);
                    mainWindow.webContents.send(
                        commands.ON_REGISTER_BREAKPOINT,
                        {
                            id: message.result.breakpointId,
                        },
                    );
                }
                return;
            default:
                logger.log("Unknown message with id: " + message.id);
                logger.group(message);
                return;
        }
    }

    if (message.method) {
        switch (message.method) {
            case DebuggerEvents.PAUSED:
                mainWindow.webContents.send(
                    commands.ON_PROCESS_LOG_UPDATE,
                    `debugger paused, reason: ${message.params.reason}`,
                );
                break;
            case DebuggerEvents.SCRIPT_PARSED:
                if (!message.params.url) break;
                if (
                    !message.params.url.includes("node_modules") &&
                    message.params.sourceMapURL != undefined
                ) {
                    const params: DebuggerEvents.ScriptParsed = message.params;
                    const entry = fileManager.registerParsedFile(params);
                    mainWindow.webContents.send(
                        commands.ON_PARSED_FILES_UPDATE,
                        [entry],
                    );
                }
                break;
            default:
                logger.log("Unknown event: " + message.method);
                logger.group(message);
                return;
        }
    }
    return;
};
// main event that trigger all application, must be set first
// parse directory where project located
ipcMain.on(commands.SET_DIRECTORY, onSetDirectoryHandler);

ipcMain.on(commands.RUN_START_SUBPROCESS, onStartSubprocessHandler);
ipcMain.on(commands.RUN_TERMINATE_SUBPROCESS, onTerminateSubprocessHandler);
ipcMain.on(commands.ON_WS_CONNECTION_STATUS_UPDATE, onSetWsStatusHandler);

ipcMain.handle(commands.GET_FILE_CONTENT, onGetFileContentHandler);
ipcMain.handle(commands.GET_FILE_STRUCTURE, onGetFileStructureHandler);
ipcMain.handle(commands.GET_SOURCE_MAP, onGetSourceMapHandler);
ipcMain.handle(commands.GET_OBJECT_ID, onGetObjectIdHandler);
ipcMain.on(commands.SET_BREAKPOINT_BY_URL, onSetBreakpointByUrlHandler);
ipcMain.on(commands.RUN_RESUME_EXECUTION, onDebuggerResumeHandler);

function onGetObjectIdHandler(
    _: electron.IpcMainInvokeEvent,
    name: string,
): void {
    logger.log(name);
    return;
}

async function onSetDirectoryHandler(): Promise<void> {
    const result: Electron.OpenDialogReturnValue = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    if (!result.canceled && result.filePaths[0] != undefined) {
        FileManager.removeInstance();
        fileManager = FileManager.instance({
            src: result.filePaths[0],
            onFileStructureResolveCallback: (root: string, files: Entry[]) => {
                logger.log("sending data to ui");
                mainWindow.webContents.send(
                    commands.ON_FILE_STRUCTURE_RESOLVE,
                    files,
                );
                mainWindow.webContents.send(commands.ON_ROOT_DIR_RESOLVE, root);
            },
        });
        return;
    }

    logger.log("Unable to detect directory");
    return;
}

async function onStartSubprocessHandler(): Promise<void> {
    if (!Subprocess.isRunning()) {
        const startTask = new StartSubprocessTask({
            mainWindow,
            fileManager,
            subprocess,
        });

        const getConnStrTask = new GetConnectionStringTask({
            ws,
        });

        await taskRunner.enqueue(startTask);
        await taskRunner.enqueue(getConnStrTask);
    }
    // all initialization goes in this file
    // all tasks goes in strategies and queue
    if (!WS.isConnected(ws.url)) {
        logger.log("initializing the ws");
        ws = WS.instance({
            url: ws.url,
            onStatusUpdateCallback: sendStatus,
            onMessageCallback: processWebSocketMessageCallback,
        });
        runtimeDomain = new RuntimeDomain(ws);
        debuggerDomain = new DebuggerDomain(ws);
    } else {
        mainWindow.webContents.send(
            commands.ON_PROCESS_LOG_UPDATE,
            passMessage("Debugger already attached"),
        );
    }
    //

    await taskRunner.enqueue(
        new EnableDebuggerTask({ debuggerDomain, runtimeDomain, ws }),
    );
}

function onTerminateSubprocessHandler(): void {
    if (Subprocess.isRunning()) {
        mainWindow.webContents.send(
            commands.ON_PROCESS_LOG_UPDATE,
            passMessage("terminating the process"),
        );
        Subprocess.kill();
    } else {
        mainWindow.webContents.send(
            commands.ON_PROCESS_LOG_UPDATE,
            passMessage("process isnt running"),
        );
    }
}

function onSetWsStatusHandler(_: electron.IpcMainEvent, status: string): void {
    mainWindow.webContents.send(
        commands.ON_WS_CONNECTION_STATUS_UPDATE,
        status,
    );
}

function onGetFileContentHandler(
    _: electron.IpcMainInvokeEvent,
    src: string,
): string {
    if (fileManager.main != null) return fileManager.readFile(src);
    return "";
}

function onGetFileStructureHandler(
    _: electron.IpcMainInvokeEvent,
    src: string,
): Entry[] {
    if (fileManager.main != null) return fileManager.getDirectoryContent(src);

    return [];
}

function onDebuggerResumeHandler(): void {
    debuggerDomain.resume(Ids.DEBUGGER.RESUME);
}

function onGetSourceMapHandler(
    _: electron.IpcMainInvokeEvent,
    src: string,
): SourceMapConsumer | null {
    return fileManager.evaluateSourceMap(src);
}

async function onSetBreakpointByUrlHandler(
    _: electron.IpcMainEvent,
    loc: Debugger.LocationWithUrl,
): Promise<void> {
    const origLoc = fileManager.getOriginLocation(loc);

    logger.group(origLoc, "original location");
    if (origLoc != null) {
        loc = origLoc;
    }

    logger.group(loc, "origin location");
    await debuggerDomain.setBreakpointByUrl(
        Ids.DEBUGGER.SET_BREAKPOINT_BY_URL,
        loc,
    );

    return;
}
