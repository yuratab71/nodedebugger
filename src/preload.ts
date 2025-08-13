import { contextBridge, ipcRenderer } from "electron";
import {
    PROCESS_LOG,
    RESUME_EXECUTION,
    CONNECT_TO_DEBUGGER,
    SET_MEMORY_USAGE,
    SET_WS_STATUS,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
    SET_DIRECTORY,
    GET_FILE_STRUCTURE,
    GET_FILE_CONTENT,
} from "./constants/commands";
import { DebuggingResponse } from "./modules/debugger";
import { Entry } from "./modules/fileManager";

const Window: Pick<Window, "electronAPI"> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(TERMINATE_SUBPROCESS),
        connectWebSocket: () => ipcRenderer.send(CONNECT_TO_DEBUGGER),
        resumeExecution: () => ipcRenderer.send(RESUME_EXECUTION),
        setWsStatus: (callback: (status: string) => void) => {
            ipcRenderer.on(SET_WS_STATUS, (_, status) => callback(status));
        },
        setSubprocessDirectory: () => ipcRenderer.send(SET_DIRECTORY),
        setMemoryUsage: (callback: (data: DebuggingResponse) => void) => {
            ipcRenderer.on(SET_MEMORY_USAGE, (_, data) => callback(data));
        },
        onProcessLog: (callback: (msg: string) => void) =>
            ipcRenderer.on(PROCESS_LOG, (_, msg) => callback(msg)),
        getFileStructure: (callback: (files: Entry[]) => void) =>
            ipcRenderer.on(GET_FILE_STRUCTURE, (_, files) => callback(files)),
        getFileContent: (src: string) =>
            ipcRenderer.invoke(GET_FILE_CONTENT, src),
    },
};

contextBridge.exposeInMainWorld("electronAPI", Window.electronAPI);
