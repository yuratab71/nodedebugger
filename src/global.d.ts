import { DebuggingResponse } from "./modules/debuggigmessages";

export {};

declare global {
    interface Window {
        electronAPI: {
            startProcess: () => void;
            terminateProcess: () => void;
            connectWebSocket: (connection: string) => void;
            resumeExecution: () => void;
            setWsStatus: (callback: (string) => void) => void;
            setMemoryUsage: (
                callback: (data: DebuggingResponse) => void,
            ) => void;
            onProcessLog: (callback: (string) => void) => void;
        };
    }
}
