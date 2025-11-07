import { setTimeout } from "timers/promises";
import { InspectorMessageIds } from "../constants/inspectorMessageIds";
import { wsStatus } from "../constants/wsStatus";
import { DebuggerDomain } from "../domains/debugger";
import { RuntimeDomain } from "../domains/runtime";
import { WS } from "../modules/wsdbserver";
import { IStrategy } from "../types/strategy.types";

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
			if (this.context.ws.status === wsStatus.CONNECTED) {
				await this.context.debuggerDomain.enable(
					InspectorMessageIds.DEBUGGER.ENABLE,
				);
				await this.context.runtimeDomain.runIfWaitingForDebugger(
					InspectorMessageIds.RUNTIME.RUN_IF_WAITING_FOR_DEBUGGER,
				);
				return;
			}

			await setTimeout(500);
		}

		throw new Error(
			"after 5 retries unable to send ENABLE debugger message to it",
		);
	}
}
