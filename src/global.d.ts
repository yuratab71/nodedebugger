export {};

declare global {
  interface Window {
    electronAPI: {
      startProcess: () => void;
      terminateProcess: () => void;
      onProcessLog: (callback: (string) => void) => void;
    };
  }
}
