import type { Entry } from "./modules/fileManager";
import type fs from "fs";
import type { SourceMapConsumer } from "source-map-js";
import type { Breakpoint } from "./types/debugger";
import { LocationByUrl } from "./types/debugger";
import type { Runtime } from "./types/runtime.types";
import type { Debugger } from "electron";

declare type Result<R> = {
    id: number;
    result: R;
};

declare type Parameters<P> = {
    id: number;
    method: string;
    params?: P;
};

declare type InspectorErrorResp = {
    id: number;
    error: {
        code: number;
        message: string;
        data: string;
    };
};

declare type Event<R> = {
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
            setBreakpointByUrl: (data: Debugger.LocationByUrl) => void;
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
            getFileContent: (src: string) => Promise<string>;
            getSourceMap: (src: string) => Promise<SourceMapConsumer | null>;
            getRootDir: (callback: (rootDir: string) => void) => void;
            onParsedFilesUpdate: (callback: (entries: Entry[]) => void) => void;
            onRegisterBreakpoint: (callback: (brk: Breakpoint) => void) => void;
            getObjectId: (name: string) => Promise<string>;
        };
    }
}

declare type FilePath = fs.PathOrFileDescriptor;

declare type Environment = {
    VERBOSE: "true" | "false";
    MODE: "development" | "production" | "debug";
};
