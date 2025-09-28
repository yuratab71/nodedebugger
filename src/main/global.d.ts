import { DebuggingResponse } from "./modules/debuggigmessages";
import { Entry } from "./modules/fileManager";
import fs from "fs";
import { SourceMapConsumer } from "source-map-js";
import { Breakpoint, LocationByUrl } from "./types/debugger";
import { Runtime } from "./types/runtime.types";

type Result<R> = {
    id: number;
    result: R;
};

type Parameters<P> = {
    id: number;
    method: string;
    params?: P;
};

type Error = {
    id: number;
    error: {
        code: number;
        message: string;
        data: string;
    };
};

type Event<R> = {
    method: string;
    params: R;
};

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
                callback: (data: Runtime.MemoryStats) => void,
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
            onRegisterBreakpoint: (callback: (brk: Breakpoint) => void) => void;
            getObjectId: (name: string) => Promise<any>;
        };
    }
}

declare type FilePath = fs.PathOrFileDescriptor;
