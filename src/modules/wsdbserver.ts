import { Status } from "../constants/status";
import { RawData, WebSocket } from "ws";
import { DebuggingResponse } from "./debugger";

type WsInitParams = {
    url: string;
    onStatusChange: (status: Status) => void;
    onMessage: (message: DebuggingResponse) => void;
};

export class WS {
    private readonly ws: WebSocket;
    public status = Status.NOT_ACTIVE;

    constructor(params: WsInitParams) {
        this.ws = new WebSocket(params.url);
        this.ws.on("error", () => {
            this.status = Status.ERROR;
            params.onStatusChange(Status.ERROR);
        });

        this.ws.on("open", () => {
            this.status = Status.CONNECTED;
            params.onStatusChange(Status.CONNECTED);
        });

        this.ws.on("close", () => {
            params.onStatusChange(Status.DISCONNECTED);
            params.onStatusChange(Status.DISCONNECTED);
        });

        this.ws.on("message", function message(data: RawData) {
            try {
                params.onMessage(
                    JSON.parse(data.toString()) as DebuggingResponse,
                );
            } catch (e) {
                console.debug(e);
            }
        });
    }

    public getStatus(): Status {
        return this.status;
    }

    static isReady(instance: WS): boolean {
        return !(instance === null || instance === undefined);
    }

    public send(message: string) {
        this.ws.send(message);
    }
}
