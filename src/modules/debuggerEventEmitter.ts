// TODO: do we really need this abstraction?????

import { DebuggingResponse } from "../types/debugger";
import { Ids } from "../constants/debuggerMessageIds";
import { BrowserWindow } from "electron";
import { Logger } from "./logger";
import { SET_MEMORY_USAGE } from "../constants/commands";
import { DebuggerEvents } from "../domains/debugger";
export class MessageProcessor {
    logger: Logger;
    constructor() {
        this.logger = new Logger("MESSAGE PROCESSOR");
    }

    processWebSocketMessage(
        message: DebuggingResponse,
        mainWindow: BrowserWindow,
        urls: string[],
        scriptIds: string[],
    ) {
        if (message.id) {
            // direct reponses from debugger
            switch (message.id) {
                case Ids.RUNTIME.GET_MEMORY_USAGE:
                    mainWindow.webContents.send(SET_MEMORY_USAGE, message);
                    break;
                case Ids.DEBUGGER.ENABLE:
                    this.logger.log("debugger enable response: ");
                    this.logger.group(message);
                    break;
                case Ids.DEBUGGER.PAUSE:
                    this.logger.log("debugger pause resp: ");
                    this.logger.group(message);
                    break;
                case Ids.DEBUGGER.SET_BREAKPOINT:
                    this.logger.log("set breakpoint");
                    this.logger.group(message);
                    break;
                case Ids.DEBUGGER.SET_BREAKPOINT_BY_URL:
                    this.logger.log("set breakpoint by url response");
                    this.logger.group(message);
                    break;
                default:
                    return;
            }
        }

        if (message.method) {
            switch (message.method) {
                case DebuggerEvents.PAUSED:
                    this.logger.log("received pause method response");
                    if (message?.params?.callFrames?.length) {
                        console.group(message);

                        /*                    debuggerDomain.getScriptSource(
                        Ids.DEBUGGER.GET_SCRIPT_SOURCE,
                        931,
                    ); */
                    }
                    break;
                case DebuggerEvents.SCRIPT_PARSED:
                    if (!message.params?.url) break;
                    // CONTINUE somewhere here
                    if (message?.params?.url.includes("nest_app/\dist")) {
                        // logger.log(message.params.url);
                        this.logger.group(message);
                        urls.push(message.params.url);
                        if (message.params?.scriptId) {
                            scriptIds.push(message?.params?.scriptId);
                        }
                    }
                    break;
                default:
                    return;
            }
        }
    }
}
