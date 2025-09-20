import { BrowserWindow } from "electron";
import { ON_PROCESS_LOG_UPDATE } from "../constants/commands";
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
                ON_PROCESS_LOG_UPDATE,
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
                    ON_PROCESS_LOG_UPDATE,
                    data.toString(),
                );
            },
            onError: (data: any) => {
                this.context.mainWindow.webContents.send(
                    ON_PROCESS_LOG_UPDATE,
                    `ERROR: ${data.toString()}`,
                );
            },
            onExit: (code: number, signal: NodeJS.Signals) => {
                if (!this.context.mainWindow.isDestroyed()) {
                    this.context.mainWindow.webContents.send(
                        ON_PROCESS_LOG_UPDATE,
                        passMessage(
                            `Process exited with code: ${code} and signal:${signal}`,
                        ),
                    );
                }
            },
        });

        //
        this.context.mainWindow.webContents.send(
            ON_PROCESS_LOG_UPDATE,
            passMessage(
                `starting and external process with entry: ${this.context.subprocess.entry}`,
            ),
        );

        return;
    }
}
