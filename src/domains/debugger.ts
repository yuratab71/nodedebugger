import { WS } from "../modules/wsdbserver";

export class DebuggerDomain {
    readonly ws: WS;
    readonly ENABLE: string = "Debugger.enable";

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
}
