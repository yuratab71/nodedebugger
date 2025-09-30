import { Debugger, DebuggerMethods } from "../types/debugger.types";
import { Result, Parameters } from "../global";
import { Logger } from "../modules/logger";
import { WS } from "../modules/wsdbserver";

export class DebuggerDomain {
    private readonly ws: WS;
    private readonly logger: Logger;

    private breakpoints: Debugger.Breakpoint[] = [];
    private debuggerId: string | null = null;

    constructor(socket: WS) {
        this.ws = socket;
        this.logger = new Logger("DEBUGGER DOMAIN");
    }

    private buildMessage<P>(input: Parameters<P>): string {
        return JSON.stringify(input);
    }

    setDebuggerId(dId: string): void {
        this.debuggerId = dId;
        this.logger.log("get id: " + this.debuggerId);
    }

    async enable(id: number): Promise<void> {
        await this.ws.sendAndReceive(
            id,
            this.buildMessage<Parameters<Debugger.EnableParams>>({
                id,
                method: DebuggerMethods.ENABLE,
            }),
        );
    }

    async getScriptSource(id: number, scriptId: string): Promise<void> {
        this.logger.log("send get script source");

        this.ws.send(
            this.buildMessage<Debugger.GetScriptSourceParams>({
                id,
                method: DebuggerMethods.GET_SCRIPT_SOURCE,
                params: {
                    scriptId,
                },
            }),
        );
    }

    async pause(id: number): Promise<void> {
        this.logger.log("send pause");
        this.ws.send(
            this.buildMessage<Parameters<{}>>({
                id: id,
                method: DebuggerMethods.PAUSE,
            }),
        );
    }

    async resume(id: number): Promise<void> {
        this.logger.log("send resume");
        const result = await this.ws.sendAndReceive(
            id,
            this.buildMessage<Parameters<Debugger.ResumeParams>>({
                id,
                method: DebuggerMethods.RESUME,
            }),
        );

        if (result != null) {
            this.logger.group(result);
        } else {
            this.logger.log("get null result on RESUME event");
        }
    }

    async setBreakpointByUrl(
        id: number,
        loc: Debugger.LocationWithUrl,
    ): Promise<Result<Debugger.SetBreakPonitByUrlReturn> | null> {
        this.logger.log(`received location: ${loc.lineNumber}`);
        return await this.ws.sendAndReceive<
            Result<Debugger.SetBreakPonitByUrlReturn>
        >(
            id,
            this.buildMessage<Debugger.SetBreakpointByUrlParams>({
                id: id,
                method: DebuggerMethods.SET_BREAKPOINT_BY_URL,
                params: {
                    url: "file:///" + loc.url,
                    lineNumber: loc.lineNumber,
                },
            }),
        );
    }

    registerBreakpoint(id: string): void {
        const brkp = {
            id,
        };

        this.breakpoints.push(brkp);
        return;
    }
}
