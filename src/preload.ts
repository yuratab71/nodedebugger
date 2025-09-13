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
    GET_SCRIPT_SOURCE,
    DEBUGGER_ENABLE,
    SET_BREAKPOINT_BY_URL,
    SET_BREAKPOINT,
    GET_ROOT_DIR,
    ON_ROOT_DIR_RESOLVE,
    ON_FILE_STRUCTURE_RESOLVE,
    GET_SOURCE_MAP,
} from "./constants/commands";
import { DebuggingResponse } from "./modules/debugger";
import { Entry } from "./modules/fileManager";
import { LocationByUrl } from "./types/debugger";

const Window: Pick<Window, "electronAPI"> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(TERMINATE_SUBPROCESS),
        connectWebSocket: () => ipcRenderer.send(CONNECT_TO_DEBUGGER),
        resumeExecution: () => ipcRenderer.send(RESUME_EXECUTION),
        getScriptSource: () => ipcRenderer.send(GET_SCRIPT_SOURCE),
        enableDebugger: () => ipcRenderer.send(DEBUGGER_ENABLE),
        setBreakpoint: () => ipcRenderer.send(SET_BREAKPOINT),
        setBreakpointByUrl: (data: LocationByUrl) => {
            console.log(`PRELOAD SET DATA ${data}`);
            ipcRenderer.send(SET_BREAKPOINT_BY_URL, data);
        },
        setWsStatus: (callback: (status: string) => void) => {
            ipcRenderer.on(SET_WS_STATUS, (_, status) => callback(status));
        },
        setSubprocessDirectory: () => ipcRenderer.send(SET_DIRECTORY),
        setMemoryUsage: (callback: (data: DebuggingResponse) => void) => {
            ipcRenderer.on(SET_MEMORY_USAGE, (_, data) => callback(data));
        },
        onProcessLog: (callback: (msg: string) => void) =>
            ipcRenderer.on(PROCESS_LOG, (_, msg) => callback(msg)),
        onRootDirResolve: (callback: (rootDir: string) => void) =>
            ipcRenderer.on(ON_ROOT_DIR_RESOLVE, (_, rootDir) =>
                callback(rootDir),
            ),
        onFileStructureResolve: (callback: (files: Entry[]) => void) =>
            ipcRenderer.on(ON_FILE_STRUCTURE_RESOLVE, (_, files) =>
                callback(files),
            ),

        getFileStructure: (src: string) =>
            ipcRenderer.invoke(GET_FILE_STRUCTURE, src),
        getFileContent: (src: string) =>
            ipcRenderer.invoke(GET_FILE_CONTENT, src),

        getSourceMap: (src: string) => ipcRenderer.invoke(GET_SOURCE_MAP, src),
        getRootDir: (callback: (rootDir: string) => void) =>
            ipcRenderer.on(GET_ROOT_DIR, (_, rootDir) => callback(rootDir)),
    },
};

contextBridge.exposeInMainWorld("electronAPI", Window.electronAPI);
