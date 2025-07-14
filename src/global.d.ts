export {};

declare global {
  interface Window {
    electronAPI: {
      startProcess: () => void;
      onProcessLog: (callback: (string) => void) => void;
    };
  }
}
