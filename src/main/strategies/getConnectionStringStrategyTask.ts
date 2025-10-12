import {
    DEFAULT_SETTINGS_PATH,
    FETCH_DEBUGGER_SETTINGS_DELAY,
    FETCH_DEBUGGER_SETTINGS_MAX_RETRY,
} from "../constants/debugger";
import { WS } from "../modules/wsdbserver";
import { Debugger } from "../types/debugger.types";
import { IStrategy } from "../types/strategy.types";

type GetConnectionStringContext = {
    ws: WS;
};

export class GetConnectionStringTask
    implements IStrategy<GetConnectionStringContext>
{
    public readonly context: GetConnectionStringContext;

    public constructor(context: GetConnectionStringContext) {
        this.context = context;
    }

    public async run(): Promise<void> {
        let isResolved = false;
        for (let i = 0; i < FETCH_DEBUGGER_SETTINGS_MAX_RETRY; i++) {
            await fetch(DEFAULT_SETTINGS_PATH)
                .then(async (resp: Response) => {
                    if (resp.ok) {
                        const data: Debugger.JsonInfo[] = await resp.json();
                        if (data[0]?.webSocketDebuggerUrl != undefined) {
                            WS.setConnstr(data[0].webSocketDebuggerUrl);
                            isResolved = true;
                        }
                    }
                })
                .catch((reason) => {
                    console.error(reason);
                });
            if (isResolved) return;
            await new Promise((resolve) =>
                setTimeout(resolve, FETCH_DEBUGGER_SETTINGS_DELAY),
            );
        }

        throw new Error("unable to fetch debugger settings");
    }
}
