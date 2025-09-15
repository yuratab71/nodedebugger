import { WS } from "../modules/wsdbserver";
import { IStrategy } from "../types/strategy";
import {
    DEFAULT_SETTINGS_PATH,
    FETCH_DEBUGGER_SETTINGS_DELAY,
    FETCH_DEBUGGER_SETTINGS_MAX_RETRY,
} from "../constants/debugger";
import { JsonDebuggerInfo } from "../types/debugger";

type GetConnectionStringContext = {
    ws: WS;
};

export class GetConnectionStringTask
    implements IStrategy<GetConnectionStringContext>
{
    context: GetConnectionStringContext;
    jsonDebuggerInfo: JsonDebuggerInfo[] = [];

    constructor(context: GetConnectionStringContext) {
        this.context = context;
    }

    async run(): Promise<void> {
        let isResolved = false;
        for (let i = 0; i < FETCH_DEBUGGER_SETTINGS_MAX_RETRY; i++) {
            await fetch(DEFAULT_SETTINGS_PATH)
                .then(async (resp: Response) => {
                    if (resp.ok) {
                        const data: JsonDebuggerInfo[] = await resp.json();
                        console.log(data);
                        if (data[0]?.webSocketDebuggerUrl) {
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
