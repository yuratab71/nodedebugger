import { WebSocket } from "ws";

export class DebuggerDomain {
    readonly ws: WebSocket;
    readonly ENABLE: string = "Debugger.enable";

    constructor(socket: WebSocket) {
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
