import { WS } from "../modules/wsdbserver";

type RuntimeParams = {
    expression?: string;
    returnByValue?: boolean;
};

export class RuntimeDomain {
    private ws: WS;
    private ENABLE: string = "Runtime.enable";
    private EVALUATE: string = "Runtime.evaluate";
    private RUN_IF_WAITING_FOR_DEBUGGER = "Runtime.runIfWaitingForDebugger";
    private DEBUGGER_RESUME = "Debugger.resume";

    constructor(socket: WS) {
        this.ws = socket;
    }

    private getMsg(id: number, method: string, params?: RuntimeParams): string {
        return JSON.stringify({
            id,
            method,
            params,
        });
    }

    enable(id: number) {
        this.ws.send(this.getMsg(id, this.ENABLE));
    }

    runIfWaitingForDebugger(id: number): void {
        this.ws.send(this.getMsg(id, this.RUN_IF_WAITING_FOR_DEBUGGER));
    }

    private evaluate(id: number, expression: string) {
        this.ws.send(
            this.getMsg(id, this.EVALUATE, { expression, returnByValue: true }),
        );
    }

    getMemoryUsage(id: number) {
        this.evaluate(id, "process.memoryUsage()");
    }
}
