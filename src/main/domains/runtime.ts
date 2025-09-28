import { Ids } from "../constants/debuggerMessageIds";
import { WS } from "../modules/wsdbserver";
import { Logger } from "../modules/logger";
import { Runtime, RuntimeMethods } from "../types/runtime.types";
import { Parameters } from "../global";

export class RuntimeDomain {
    private ws: WS;
    private logger: Logger;

    constructor(socket: WS) {
        this.ws = socket;
        this.logger = new Logger("RUNTIME DOMAIN");
    }

    private buildMessage<P>(input: Parameters<P>): string {
        return JSON.stringify(input);
    }

    enable(id: number) {
        this.ws.send(
            this.buildMessage<Runtime.EnableParams>({
                id,
                method: RuntimeMethods.ENABLE,
            }),
        );

        this.logger.log("runtime enable has been sent");
    }

    async runIfWaitingForDebugger(id: number): Promise<{} | null> {
        this.logger.log("sending runIfWaitingForDebugger");

        return await this.ws.sendAndReceive<{}>(
            id,
            this.buildMessage<Runtime.RunIfWaitingForDebuggerParams>({
                id,
                method: RuntimeMethods.RUN_IF_WAITING_FOR_DEBUGGER,
            }),
        );
    }

    getMemoryUsage(id: number): void {
        this.ws.send(
            this.buildMessage<Runtime.EvaluateParams>({
                id,
                method: RuntimeMethods.EVALUATE,
                params: {
                    expression: "process.memoryUsage()",
                    returnByValue: true,
                },
            }),
        );
    }

    async evaluateExpression(
        expression: string,
    ): Promise<Runtime.EvaluateResult | null> {
        const message: Parameters<Runtime.EvaluateParams> = {
            id: Ids.RUNTIME.EVALUATE_EXPRESSION,
            method: RuntimeMethods.EVALUATE,
            params: {
                expression: expression,
            },
        };

        this.logger.log("Sending evaluate expression; Expression: ");
        this.logger.log(`"${expression}"`);

        return await this.ws.sendAndReceive<Runtime.EvaluateResult>(
            Ids.RUNTIME.EVALUATE_EXPRESSION,
            JSON.stringify(message),
        );
    }

    async globalLexicalScopeNames() {
        const message = {
            id: Ids.RUNTIME.GLOBAL_LEXICAL_SCOPE_NAMES,
            method: RuntimeMethods.GLOBAL_LEXICAL_SCOPE_NAMES,
        };

        return await this.ws.sendAndReceive(
            Ids.RUNTIME.GLOBAL_LEXICAL_SCOPE_NAMES,
            JSON.stringify(message),
        );
    }
}
