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
            setWsStatus: (callback: (string) => void) => void;
            setMemoryUsage: (
                callback: (data: DebuggingResponse) => void,
            ) => void;
            setSubprocessDirectory: () => void;
            onProcessLog: (callback: (string) => void) => void;
            getFileStructure: (callback: (files: Entry[]) => void) => void;
            getFileContent: (src: string) => Promise<any>;
        };
    }
}

declare type FilePath = fs.PathOrFileDescriptor;
