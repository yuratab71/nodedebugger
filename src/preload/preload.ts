import { contextBridge, ipcRenderer } from "electron";
import {
    GET_FILE_CONTENT,
    GET_FILE_STRUCTURE,
    GET_OBJECT_ID,
    GET_ROOT_DIR,
    GET_SCRIPT_SOURCE,
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
    SET_BREAKPOINT_BY_SCRIPT_ID,
    SET_BREAKPOINT_BY_URL,
    SET_DIRECTORY,
} from "../main/constants/commands";
import type { Debugger } from "../main/types/debugger.types";
import type { Entry } from "../main/types/fileManager.types";
import type { Runtime } from "../main/types/runtime.types";

const Window: Pick<Window, "electronAPI"> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(RUN_START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(RUN_TERMINATE_SUBPROCESS),
        resumeExecution: () => ipcRenderer.send(RUN_RESUME_EXECUTION),
        getScriptSource: () => ipcRenderer.send(GET_SCRIPT_SOURCE),
        setBreakpoint: () => ipcRenderer.send(SET_BREAKPOINT_BY_SCRIPT_ID),
        setBreakpointByUrl: (data: Debugger.LocationWithUrl) => {
            ipcRenderer.send(SET_BREAKPOINT_BY_URL, data);
        },
        setWsStatus: (callback: (status: string) => void) => {
            ipcRenderer.on(ON_WS_CONNECTION_STATUS_UPDATE, (_, status) =>
                callback(status),
            );
        },
        setSubprocessDirectory: () => ipcRenderer.send(SET_DIRECTORY),
        setMemoryUsage: (callback: (data: Runtime.MemoryStats) => void) => {
            ipcRenderer.on(ON_MEMORY_USAGE_UPDATE, (_, data) => callback(data));
        },
        onProcessLog: (callback: (msg: string) => void) =>
            ipcRenderer.on(ON_PROCESS_LOG_UPDATE, (_, msg) => {
                callback(msg);
            }),
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
        onParsedFilesUpdate: (callback: (entries: Entry[]) => void) => {
            ipcRenderer.on(ON_PARSED_FILES_UPDATE, (_, entries) => {
                callback(entries);
            });
        },
        onRegisterBreakpoint: (
            callback: (brk: Debugger.Breakpoint) => void,
        ) => {
            ipcRenderer.on(ON_REGISTER_BREAKPOINT, (_, brk) => callback(brk));
        },
        getObjectId: (name: string) => ipcRenderer.invoke(GET_OBJECT_ID, name),
    },
};

contextBridge.exposeInMainWorld("electronAPI", Window.electronAPI);
