import { Entry } from "./modules/fileManager";
import fs from "fs";
import { SourceMapConsumer } from "source-map-js";
import { Breakpoint, LocationByUrl } from "./types/debugger";
import { Runtime } from "./types/runtime.types";
import { FileContent } from "./types/fileManager.types";
import { Debugger } from "./types/debugger.types";

export type Result<R> = {
	id: number;
	result: R;
};

export type Parameters<P> = {
	id: number;
	method: string;
	params?: P;
};

export type ErrorMsg = {
	id: number;
	error: {
		code: number;
		message: string;
		data: string;
	};
};

export type Event<R> = {
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
			getFileContent: (src: string) => Promise<FileContent>;
			getSourceMap: (src: string) => Promise<SourceMapConsumer | null>;
			getRootDir: (callback: (rootDir: string) => void) => void;
			onParsedFilesUpdate: (callback: (entries: Entry[]) => void) => void;
			onRegisterBreakpoint: (callback: (brk: Breakpoint) => void) => void;
			getObjectId: (name: string) => Promise<unknown>;
			onBreakpointHit: (
				callback: (callFrames: Debugger.CallFrame[]) => void,
			) => void;
		};
	}
}

declare type FilePath = fs.PathOrFileDescriptor;

declare type Environment = {
	VERBOSE: "true" | "false";
	MODE: "development" | "production" | "debug";
};
