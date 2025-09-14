import { BrowserWindow } from "electron";
import { PROCESS_LOG } from "../constants/commands";
import { IStrategy } from "../types/strategy";
import { FileManager } from "../modules/fileManager";
import { passMessage } from "../modules/logger";
import path from "path";
import Subprocess from "../modules/subprocess";

type StartSubprocessContext = {
    mainWindow: BrowserWindow;
    fileManager: FileManager;
    subprocess: Subprocess;
};

export class StartSubprocessTask implements IStrategy<StartSubprocessContext> {
    context: StartSubprocessContext;

    constructor(context: StartSubprocessContext) {
        this.context = context;
    }

    async run(): Promise<void> {
        //
        if (Subprocess.isRunning()) {
            this.context.mainWindow.webContents.send(
                PROCESS_LOG,
                passMessage("Process already running"),
            );
            return;
        }

        //
        let mainPath = this.context.fileManager.getPathToMain();

        if (!mainPath) return;

        //
        this.context.subprocess = Subprocess.instance({
            entry: path.normalize(mainPath),
            onData: (data: any) => {
                this.context.mainWindow.webContents.send(
                    PROCESS_LOG,
                    data.toString(),
                );
            },
            onError: (data: any) => {
                this.context.mainWindow.webContents.send(
                    PROCESS_LOG,
                    `ERROR: ${data.toString()}`,
                );
            },
            onExit: (code: number, signal: NodeJS.Signals) => {
                if (!this.context.mainWindow.isDestroyed()) {
                    this.context.mainWindow.webContents.send(
                        PROCESS_LOG,
                        passMessage(
                            `Process exited with code: ${code} and signal:${signal}`,
                        ),
                    );
                }
            },
        });

        //
        this.context.mainWindow.webContents.send(
            PROCESS_LOG,
            passMessage(
                `starting and external process with entry: ${this.context.subprocess.entry}`,
            ),
        );

        return;
    }
}
