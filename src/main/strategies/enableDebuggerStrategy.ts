import type { RuntimeDomain } from "../domains/runtime";
import type { DebuggerDomain } from "../domains/debugger";
import type { IStrategy } from "../types/strategy.types";
import { Ids } from "../constants/debuggerMessageIds";
import type { WS } from "../modules/wsdbserver";
import { Status } from "../constants/status";

type EnableDebuggerContext = {
    debuggerDomain: DebuggerDomain;
    runtimeDomain: RuntimeDomain;
    ws: WS;
};

export class EnableDebuggerTask implements IStrategy<EnableDebuggerContext> {
    public context: EnableDebuggerContext;

    public constructor(context: EnableDebuggerContext) {
        this.context = context;
    }

    public async run(): Promise<void> {
        for (let i = 0; i < 10; i++) {
            if (this.context.ws.status === Status.CONNECTED) {
                await this.context.debuggerDomain.enable(Ids.DEBUGGER.ENABLE);
                await this.context.runtimeDomain.runIfWaitingForDebugger(
                    Ids.RUNTIME.RUN_IF_WAITING_FOR_DEBUGGER,
                );
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        throw new Error(
            "after 5 retries unable to send ENABLE debugger message to it",
        );
    }
}
