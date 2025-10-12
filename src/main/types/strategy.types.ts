import type { WS } from "../modules/wsdbserver";
import type Subprocess from "../modules/subprocess";
import type { FileManager } from "../modules/fileManager";
import type { DebuggerDomain } from "../domains/debugger";
import type { RuntimeDomain } from "../domains/runtime";

export type MainContext = {
    ws?: WS;
    subprocess?: Subprocess;
    fileManager?: FileManager;
    debugger?: DebuggerDomain;
    runtime?: RuntimeDomain;
};

export interface IStrategy<T> {
    context: T;
    run: () => Promise<void>;
}
