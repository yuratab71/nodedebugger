import {
	app,
	BrowserWindow,
	dialog,
	IpcMainEvent,
	IpcMainInvokeEvent,
	ipcMain,
} from "electron";
import "dotenv/config";
import path from "path";
import { SourceMapConsumer } from "source-map-js";
import {
	GET_FILE_CONTENT,
	GET_FILE_STRUCTURE,
	GET_OBJECT_ID,
	GET_SOURCE_MAP,
	ON_FILE_STRUCTURE_RESOLVE,
	ON_MEMORY_USAGE_UPDATE,
	ON_PARSED_FILES_UPDATE,
	ON_PROCESS_LOG_UPDATE,
	ON_REGISTER_BREAKPOINT,
	ON_ROOT_DIR_RESOLVE,
	ON_WS_CONNECTION_STATUS_UPDATE,
	RUN_RESUME_EXECUTION,
	RUN_START_SUBPROCESS,
	RUN_TERMINATE_SUBPROCESS,
	SET_BREAKPOINT_BY_URL,
	SET_DIRECTORY,
} from "./constants/commands";
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
import { Debugger, DebuggerEvents } from "./types/debugger.types";
import { Entry, FileContent } from "./types/fileManager.types";
import { InspectorMessage } from "./types/message.types";
import { Runtime } from "./types/runtime.types";

declare const MAIN_WINDOW_VITE_NAME: string | undefined;
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;

let platform: NodeJS.Platform;

// declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
// declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Inti all required modules ====================
// eslint-disable-next-line
let ws: WS;
let status: Status = Status.NOT_ACTIVE;

let runtimeDomain: RuntimeDomain;
let debuggerDomain: DebuggerDomain;

let subprocess: Subprocess;
let fileManager: FileManager;
// const queueProcessor = QueueProcessor.instance();

let mainWindow: BrowserWindow;
const logger: Logger = new Logger("IPC MAIN");
const taskRunner: TaskQueueRunner = TaskQueueRunner.instance();

// =============================================

if (require("electron-squirrel-startup")) {
	app.quit();
}

const sendStatus = (st: Status): void => {
	status = st;
	mainWindow.webContents.send(ON_WS_CONNECTION_STATUS_UPDATE, status);
};

const createWindow = (): void => {
	platform = process.platform;
	logger.log(`Starting Nquisitor on: ${platform}`);
	mainWindow = new BrowserWindow({
		height: 760,
		width: 1024,
		icon: path.join(__dirname, "../../public/icon.ico"),
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(
				__dirname,
				`../renderer/${MAIN_WINDOW_VITE_NAME}index.html`,
			),
		);
	}

	sendStatus(Status.NOT_ACTIVE);

	// prevent subprocess to continue execution on linux
	process.on("SIGINT", () => {
		logger.log("received SIGINT signal");
		if (Subprocess.kill()) {
			logger.log("Subprocess killed succesfully");
		} else {
			logger.log("Failed to kill subprocess");
		}

		process.exit(0);
	});

	process.on("SIGTERM", () => {
		logger.log("received SIGTERM signal");
		if (Subprocess.kill()) {
			logger.log("Subprocess killed succesfully");
		} else {
			logger.log("Failed to kill subprocess");
		}

		process.exit(0);
	});

	setInterval(() => {
		if (WS.isConnected() && !!runtimeDomain) {
			runtimeDomain.getMemoryUsage(Ids.RUNTIME.GET_MEMORY_USAGE);
		}
	}, MEMORY_USAGE_UPDATE_DELAY);

	// crash on exception for debugging purposes
	process.removeAllListeners("uncaughtException");

	process.on("uncaughtException", (err: Error) => {
		logger.error(err);
		process.exit(1);
	});
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
					ON_MEMORY_USAGE_UPDATE,
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
				if (message.result?.locations.length === 0) {
					logger.log("received invalid breakpoint");
					return;
				}
				if (message.result?.breakpointId) {
					debuggerDomain.registerBreakpoint(
						message.result?.breakpointId,
					);
					logger.group(message.result?.locations);
					mainWindow.webContents.send(ON_REGISTER_BREAKPOINT, {
						id: message.result?.breakpointId,
					});
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
				logger.group(message, "debugger pause");
				mainWindow.webContents.send(
					ON_PROCESS_LOG_UPDATE,
					`debugger paused, reason: ${message.params?.reason}`,
				);
				break;
			case DebuggerEvents.SCRIPT_PARSED:
				if (!message.params?.url) break;
				if (
					!message?.params?.url.includes("node_modules")
					&& message?.params?.sourceMapURL
				) {
					const params: DebuggerEvents.ScriptParsed = message.params;
					const entry = fileManager.registerParsedFile(params);
					mainWindow.webContents.send(ON_PARSED_FILES_UPDATE, [
						entry,
					]);
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
ipcMain.on(SET_DIRECTORY, onSetDirectoryHandler);

ipcMain.on(RUN_START_SUBPROCESS, onStartSubprocessHandler);
ipcMain.on(RUN_TERMINATE_SUBPROCESS, onTerminateSubprocessHandler);
ipcMain.on(ON_WS_CONNECTION_STATUS_UPDATE, onSetWsStatusHandler);

ipcMain.handle(GET_FILE_CONTENT, onGetFileContentHandler);
ipcMain.handle(GET_FILE_STRUCTURE, onGetFileStructureHandler);
ipcMain.handle(GET_SOURCE_MAP, onGetSourceMapHandler);
ipcMain.handle(GET_OBJECT_ID, onGetObjectIdHandler);
ipcMain.on(SET_BREAKPOINT_BY_URL, onSetBreakpointByUrlHandler);
ipcMain.on(RUN_RESUME_EXECUTION, onDebuggerResumeHandler);

async function onGetObjectIdHandler(
	_: IpcMainInvokeEvent,
	name: string,
): Promise<Runtime.EvaluateResult | null> {
	const scope = await runtimeDomain.globalLexicalScopeNames();
	logger.log("scope");
	logger.group(scope);
	return await runtimeDomain.evaluateExpression(name);
}

async function onSetDirectoryHandler(): Promise<void> {
	const result = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});

	if (result.canceled || result.filePaths[0] === undefined) {
		logger.log("Unable to detect directory");
		return;
	}

	FileManager.removeInstance();

	fileManager = FileManager.instance({
		src: result.filePaths[0],
		onFileStructureResolveCallback: (root: string, files: Entry[]) => {
			logger.log("sending data to ui");
			mainWindow.webContents.send(ON_FILE_STRUCTURE_RESOLVE, files);
			mainWindow.webContents.send(ON_ROOT_DIR_RESOLVE, root);
		},
	});

	logger.log(
		`succesfully detect a node js application at:\n${fileManager.main}`,
	);

	mainWindow.webContents.send(
		ON_PROCESS_LOG_UPDATE,
		passMessage(`Detect a node js application at: \n${fileManager.main}`),
	);
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
	if (!WS.isConnected(ws?.url)) {
		logger.log("initializing the ws");

		ws = WS.instance({
			url: ws?.url,
			onStatusUpdateCallback: sendStatus,
			onMessageCallback: processWebSocketMessageCallback,
		});

		runtimeDomain = new RuntimeDomain(ws);
		debuggerDomain = new DebuggerDomain(ws);
	} else {
		mainWindow.webContents.send(
			ON_PROCESS_LOG_UPDATE,
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
			ON_PROCESS_LOG_UPDATE,
			passMessage("terminating the process"),
		);
		Subprocess.kill();
	} else {
		mainWindow.webContents.send(
			ON_PROCESS_LOG_UPDATE,
			passMessage("process isnt running"),
		);
	}
}

function onSetWsStatusHandler(_: IpcMainEvent, status: string): void {
	mainWindow.webContents.send(ON_WS_CONNECTION_STATUS_UPDATE, status);
}

function onGetFileContentHandler(
	_: IpcMainInvokeEvent,
	src: string,
): FileContent {
	const fileContent: FileContent = {
		content: fileManager.readFile(src),
		activeBreakpoints: debuggerDomain.getActiveBreakpointOnPage(),
	};

	return fileContent;
}

function onGetFileStructureHandler(
	_: IpcMainInvokeEvent,
	src: string,
): Entry[] {
	if (fileManager?.main) return fileManager.getDirectoryContent(src);

	return [];
}

function onDebuggerResumeHandler(): void {
	debuggerDomain.resume(Ids.DEBUGGER.RESUME);
}

function onGetSourceMapHandler(
	_: IpcMainInvokeEvent,
	src: string,
): SourceMapConsumer | null {
	return fileManager.evaluateSourceMap(src);
}

async function onSetBreakpointByUrlHandler(
	_: IpcMainEvent,
	loc: Debugger.LocationWithUrl,
): Promise<void> {
	const origLoc = fileManager.getOriginLocation(loc);

	if (origLoc != null) {
		loc = origLoc;
	}

	await debuggerDomain.setBreakpointByUrl(
		Ids.DEBUGGER.SET_BREAKPOINT_BY_URL,
		loc,
	);

	return;
}
