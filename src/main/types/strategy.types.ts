import { DebuggerDomain } from "../domains/debugger";
import { RuntimeDomain } from "../domains/runtime";
import { FileManager } from "../modules/fileManager";
import Subprocess from "../modules/subprocess";
import { WS } from "../modules/wsdbserver";

export type MainContext = {
	ws?: WS;
	subprocess?: Subprocess;
	fileManager?: FileManager;
	debugger?: DebuggerDomain;
	runtime?: RuntimeDomain;
};

export interface IStrategy<T> {
	context: T;
	run(): Promise<void>;
}
