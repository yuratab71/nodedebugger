import { Status } from "../constants/status";
import { RawData, WebSocket } from "ws";
import { DebuggingResponse } from "./debugger";

type WsInitParams = {
    url: string;
    onStatusUpdateCallback: (status: Status) => void;
    onMessageCallback: (msg: DebuggingResponse) => void;
};

export class WS {
    private readonly webSocket: WebSocket;
    url: string;
    status = Status.NOT_ACTIVE;

    static #instance: WS;
    static instance(params: WsInitParams) {
        if (!WS.#instance) {
            WS.#instance = new WS(params);
        }

        return WS.#instance;
    }

    private constructor({
        url,
        onStatusUpdateCallback,
        onMessageCallback,
    }: WsInitParams) {
        this.url = url;
        this.webSocket = new WebSocket(this.url);

        this.webSocket.on("error", () => {
            console.error;
            onStatusUpdateCallback(Status.ERROR);
        });

        this.webSocket.on("open", () => {
            onStatusUpdateCallback(Status.CONNECTED);
        });

        this.webSocket.on("close", () => {
            onStatusUpdateCallback(Status.DISCONNECTED);
        });

        this.webSocket.on("message", function message(data: RawData) {
            try {
                onMessageCallback(
                    JSON.parse(data.toString()) as DebuggingResponse,
                );
            } catch (e) {
                console.debug(e);
            }
        });
    }

    static reset(params: WsInitParams) {
        WS.#instance = new WS(params);

        return WS.#instance;
    }
    static isConnected(): boolean {
        return WS.#instance?.webSocket?.readyState === WebSocket.OPEN;
    }

    send(message: string): void {
        this.webSocket.send(message);
    }
}
