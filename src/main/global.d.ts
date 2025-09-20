import { DebuggingResponse } from "./modules/debuggigmessages";
import { Entry } from "./modules/fileManager";
import fs from "fs";
import { SourceMapConsumer } from "source-map-js";
import { LocationByUrl } from "./types/debugger";

export {};

declare global {
    interface Window {
        electronAPI: {
            startProcess: () => void;
            terminateProcess: () => void;
            resumeExecution: () => void;
            getScriptSource: () => void;
            setBreakpoint: () => void;
            setBreakpointByUrl: (data: LocationByUrl) => void;
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
            getSourceMap: (src: string) => Promise<SourceMapConsumer | null>;
            getRootDir: (callback: (rootDir: string) => void) => void;
            onParsedFilesUpdate: (callback: (entry: Entry) => void) => void;
        };
    }
}

declare type FilePath = fs.PathOrFileDescriptor;
