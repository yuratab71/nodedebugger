import { contextBridge, ipcRenderer } from "electron";
import {
    ON_PROCESS_LOG_UPDATE,
    RUN_RESUME_EXECUTION,
    ON_MEMORY_USAGE_UPDATE,
    ON_WS_CONNECTION_STATUS_UPDATE,
    RUN_START_SUBPROCESS,
    RUN_TERMINATE_SUBPROCESS,
    SET_DIRECTORY,
    GET_FILE_STRUCTURE,
    GET_FILE_CONTENT,
    GET_SCRIPT_SOURCE,
    SET_BREAKPOINT_BY_URL,
    SET_BREAKPOINT_BY_SCRIPT_ID,
    GET_ROOT_DIR,
    ON_ROOT_DIR_RESOLVE,
    ON_FILE_STRUCTURE_RESOLVE,
    GET_SOURCE_MAP,
    ON_PARSED_FILES_UPDATE,
} from "../main/constants/commands";
import { Entry } from "../main/modules/fileManager";
import { DebuggingResponse, LocationByUrl } from "../main/types/debugger";

const Window: Pick<Window, "electronAPI"> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(RUN_START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(RUN_TERMINATE_SUBPROCESS),
        resumeExecution: () => ipcRenderer.send(RUN_RESUME_EXECUTION),
        getScriptSource: () => ipcRenderer.send(GET_SCRIPT_SOURCE),
        setBreakpoint: () => ipcRenderer.send(SET_BREAKPOINT_BY_SCRIPT_ID),
        setBreakpointByUrl: (data: LocationByUrl) => {
            ipcRenderer.send(SET_BREAKPOINT_BY_URL, data);
        },
        setWsStatus: (callback: (status: string) => void) => {
            ipcRenderer.on(ON_WS_CONNECTION_STATUS_UPDATE, (_, status) =>
                callback(status),
            );
        },
        setSubprocessDirectory: () => ipcRenderer.send(SET_DIRECTORY),
        setMemoryUsage: (callback: (data: DebuggingResponse) => void) => {
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
        onParsedFilesUpdate: (callback: (entry: Entry) => void) => {
            ipcRenderer.on(ON_PARSED_FILES_UPDATE, (_, entry) =>
                callback(entry),
            );
        },
    },
};

contextBridge.exposeInMainWorld("electronAPI", Window.electronAPI);
