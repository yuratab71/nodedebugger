import { Status } from "../constants/status";
import { RawData, WebSocket } from "ws";
import { DebuggingResponse } from "../types/debugger";

type WsInitParams = {
    url: string;
    onStatusUpdateCallback: (status: Status) => void;
    onMessageCallback: (msg: DebuggingResponse) => void;
};

export class WS {
    private readonly webSocket: WebSocket;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 50;
    status = Status.NOT_ACTIVE;
    private pendingRequests: Map<string | undefined, DebuggingResponse>;

    static #instance: WS;
    static #connstr: string;
    static instance(params: WsInitParams) {
        if (!WS.#instance) {
            WS.#instance = new WS(params);
        }

        return WS.#instance;
    }

    static setConnstr(connStr: string) {
        console.log(`received string: ${connStr}`);
        WS.#connstr = connStr;
    }

    private constructor({
        onStatusUpdateCallback,
        onMessageCallback,
    }: WsInitParams) {
        this.pendingRequests = new Map();
        this.webSocket = new WebSocket(WS.#connstr);

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

        this.webSocket.on("message", (data: RawData) => {
            try {
                const resp = JSON.parse(data.toString()) as DebuggingResponse;
                this.pendingRequests.set(resp.id?.toString(), resp);
                onMessageCallback(resp);
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
        // TODO: add possibility to send messages and receive response and notify the caller of its success or failure
    }

    async sendAndReceive(
        id: number,
        message: string,
    ): Promise<DebuggingResponse | null> {
        this.send(message);

        let isResolved = false;
        return new Promise<DebuggingResponse | null>((resolve, _) => {
            for (let i = 0; i < this.MAX_RETRIES; i++) {
                if (isResolved) return;
                setTimeout(() => {
                    const resp = this.pendingRequests.get(id.toString());
                    if (resp) {
                        resolve(resp);
                        isResolved = true;
                    }
                }, this.RETRY_DELAY);
            }
        });
    }
}
