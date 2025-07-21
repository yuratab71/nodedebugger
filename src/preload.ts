// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'
import {
    PROCESS_LOG,
    START_SUBPROCESS,
    TERMINATE_SUBPROCESS,
} from './constants'

const Window: Pick<Window, 'electronAPI'> = {
    electronAPI: {
        startProcess: () => ipcRenderer.send(START_SUBPROCESS),
        terminateProcess: () => ipcRenderer.send(TERMINATE_SUBPROCESS),
        onProcessLog: (callback: any) =>
            ipcRenderer.on(PROCESS_LOG, (_, msg) => callback(msg)),
    },
}

contextBridge.exposeInMainWorld('electronAPI', Window.electronAPI)
