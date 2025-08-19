import { DebuggingResponse } from "./modules/debuggigmessages";
import { Entry } from "./modules/fileManager";
import fs from "fs";

export {};

declare global {
    interface Window {
        electronAPI: {
            startProcess: () => void;
            terminateProcess: () => void;
            connectWebSocket: () => void;
            resumeExecution: () => void;
            getScriptSource: () => void;
            enableDebugger: () => void;
            setBreakpoint: () => void;
            setBreakpointByUrl: () => void;
            setWsStatus: (callback: (string) => void) => void;
            setMemoryUsage: (
                callback: (data: DebuggingResponse) => void,
            ) => void;
            setSubprocessDirectory: () => void;
            onProcessLog: (callback: (string) => void) => void;
            onFileStructureResolve: (
                callback: (files: Entry[]) => void,
            ) => void;
            onRootDirResolve: (callback: (rootDir: string) => void) => void;
            getFileStructure: (src: string) => Promise<Entry[]>;
            getFileContent: (src: string) => Promise<any>;
            getRootDir: (callback: (rootDir: string) => void) => void;
        };
    }
}

declare type FilePath = fs.PathOrFileDescriptor;
