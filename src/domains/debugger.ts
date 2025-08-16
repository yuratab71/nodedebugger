import { WS } from "../modules/wsdbserver";

export class DebuggerDomain {
    private readonly ws: WS;
    private ENABLE: string = "Debugger.enable";
    private GET_SCRIPT_SOURCE = "Debugger.getScriptSource";

    constructor(socket: WS) {
        this.ws = socket;
    }

    private getMsg(id: number, method: string) {
        return JSON.stringify({
            id,
            method,
        });
    }

    enable(id: number): void {
        this.ws.send(this.getMsg(id, this.ENABLE));
    }

    getScriptSource(id: number): void {
        this.ws.send(this.getMsg(id, this.GET_SCRIPT_SOURCE));
    }
}
