export {};

declare global {
    interface Window {
        electronAPI: {
            startProcess: () => void;
            terminateProcess: () => void;
            connectWebSocket: (connection: string) => void;
            setWsStatus: (callback: (string) => void) => void;
            onProcessLog: (callback: (string) => void) => void;
        };
    }
}
