import { BrowserWindow } from "electron";
import path from "path";
import { ON_PROCESS_LOG_UPDATE } from "../constants/commands";
import { FileManager } from "../modules/fileManager";
import { passMessage } from "../modules/logger";
import Subprocess from "../modules/subprocess";
import { IStrategy } from "../types/strategy.types";

type StartSubprocessContext = {
	mainWindow: BrowserWindow;
	fileManager: FileManager;
	subprocess: Subprocess;
};

export class StartSubprocessTask implements IStrategy<StartSubprocessContext> {
	public context: StartSubprocessContext;

	public constructor(context: StartSubprocessContext) {
		this.context = context;
	}

	public run(): Promise<void> {
		return new Promise(() => {
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
				onData: (data: Buffer) => {
					this.context.mainWindow.webContents.send(
						ON_PROCESS_LOG_UPDATE,
						data.toString(),
					);
				},
				onError: (data: Buffer) => {
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
		});
	}
}
