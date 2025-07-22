import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";
import pidusage from "pidusage";
import {
    PROCESS_LOG,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants";
import { passMessage } from "./logger";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let subprocess: ChildProcessWithoutNullStreams;

if (require("electron-squirrel-startup")) {
    app.quit();
}

let mainWindow: BrowserWindow;

const createWindow = (): void => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
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
            passMessage("process already running")
        );
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("starting and external process")
        );
        subprocess = spawn("node", [
            path.normalize("C:\\Users\\ASUS\\Desktop\\nest_app\\dist\\main.js"),
        ]);

        pidusage(subprocess.pid, (_, stats) => {
            console.log(stats);
        });

        subprocess.stdout.on("data", (data) => {
            mainWindow.webContents.send(PROCESS_LOG, data.toString());
        });

        subprocess.stderr.on("data", (data) => {
            mainWindow.webContents.send(
                PROCESS_LOG,
                `ERROR: ${data.toString()}`
            );
        });

        subprocess.on("exit", (code) => {
            mainWindow.webContents.send(
                PROCESS_LOG,
                passMessage(`Process exited with code ${code}`)
            );
        });
    }
});

ipcMain.on(TERMINATE_SUBPROCESS, () => {
    if (!subprocess.killed && subprocess.exitCode == null) {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("terminating the process")
        );
        subprocess.kill();
    } else {
        mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage("process isnt running")
        );
    }
});
