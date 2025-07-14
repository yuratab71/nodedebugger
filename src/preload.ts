// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { PROCESS_LOG, START_SUBPROCESS } from "./constants";

contextBridge.exposeInMainWorld("electronAPI", {
  startProcess: () => ipcRenderer.send(START_SUBPROCESS),
  onProcessLog: (callback: any) =>
    ipcRenderer.on(PROCESS_LOG, (_, msg) => callback(msg)),
});
