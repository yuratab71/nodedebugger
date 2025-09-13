import { Ids } from "../constants/debuggerMessageIds";
import { Logger } from "../modules/logger";
import { WS } from "../modules/wsdbserver";

export const DebuggerEvents = {
    PAUSED: "Debugger.paused",
    SCRIPT_PARSED: "Debugger.scriptParsed",
};

type Message = {
    id: number;
    method: string;
    scriptId?: string;
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
    params?: {
        location?: Location;
    };
};

type Location = {
    scriptId: string;
    lineNumber: number;
    columnNumber: number;
};

export class DebuggerDomain {
    private readonly ws: WS;
    private logger: Logger;

    private ENABLE = "Debugger.enable";
    private PAUSE = "Debugger.pause";
    private RESUME = "Debugger.resume";
    private GET_SCRIPT_SOURCE = "Debugger.getScriptSource";
    private SET_BREAKPOINT = "Debugger.setBreakpoint";
    private SET_BREAKPOINT_BY_URL = "Debugger.setBreakpointByUrl";

    //id received from Debugger.enable event
    private debuggerId = "";

    constructor(socket: WS) {
        this.ws = socket;
        this.logger = new Logger("DEBUGGER DOMAIN");
    }

    private buildMessage({
        id,
        method,
        scriptId,
        url,
        lineNumber,
        columnNumber,
        params,
    }: Message) {
        return JSON.stringify({
            id,
            method,
            params: {
                scriptId,
                url,
                lineNumber,
                columnNumber,
                location: params?.location,
            },
        });
    }

    setDebuggerId(dId: string): void {
        this.debuggerId = dId;
        this.logger.log("get id: " + this.debuggerId);
    }

    enable(id: number): void {
        this.logger.log("send enable");
        this.ws.send(this.buildMessage({ id, method: this.ENABLE }));
    }

    getScriptSource(id: number, scriptId: string): void {
        this.logger.log("send get script source");
        this.ws.send(
            this.buildMessage({
                id,
                method: this.GET_SCRIPT_SOURCE,
                scriptId,
            }),
        );
    }

    pause(id: number): void {
        this.logger.log("send pause");
        this.ws.send(this.buildMessage({ id: id, method: this.PAUSE }));
    }

    async resume(id: number): Promise<void> {
        this.logger.log("send resume");
        const result = await this.ws.sendAndReceive(
            id,
            this.buildMessage({ id, method: this.RESUME }),
        );

        if (result != null) {
            this.logger.group(result);
        } else {
            this.logger.log("get null result on RESUME event");
        }
    }

    setBreakpointByUrl(id: number, url: string): void {
        this.logger.log(`url: ${url}`);
        this.ws.send(
            this.buildMessage({
                id: id,
                method: this.SET_BREAKPOINT_BY_URL,
                lineNumber: 0,
                columnNumber: 0,
            }),
        );
    }

    setBreakpoint(id: number, scriptId: string): void {
        this.logger.log(`scriptId: ${scriptId}`);

        const loc: Location = {
            scriptId,
            lineNumber: 0,
            columnNumber: 0,
        };
        this.ws.send(
            this.buildMessage({
                id,
                method: this.SET_BREAKPOINT,
                params: {
                    location: loc,
                },
            }),
        );
    }
}
