// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import {
    PROCESS_LOG,
    RESUME_EXECUTION,
    SET_CONNECTION_STRING,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from "./constants";
import { DebuggingResponse } from "./modules/debuggigmessages";

const Window: Pick<Window, "electronAPI"> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(TERMINATE_SUBPROCESS),
        connectWebSocket: (connection: string) =>
            ipcRenderer.send(SET_CONNECTION_STRING, connection),
        resumeExecution: () => ipcRenderer.send(RESUME_EXECUTION),
        setWsStatus: (callback: (status: string) => void) => {
            ipcRenderer.on(SET_WS_STATUS, (_, status) => callback(status));
        },
        setMemoryUsage: (callback: (data: DebuggingResponse) => void) => {
            ipcRenderer.on(SET_MEMORY_USAGE, (_, data) => callback(data));
        },
        onProcessLog: (callback: (msg: string) => void) =>
            ipcRenderer.on(PROCESS_LOG, (_, msg) => callback(msg)),
    },
};

contextBridge.exposeInMainWorld("electronAPI", Window.electronAPI);
