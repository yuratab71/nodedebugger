import { Status } from "../constants/status";
import { RawData, WebSocket } from "ws";
import { DebuggingResponse } from "../types/debugger";
import { Logger } from "./logger";
import { Result } from "@main/global";

type WsInitParams = {
    url?: string;
    onStatusUpdateCallback: (status: Status) => void;
    onMessageCallback: (msg: DebuggingResponse) => void;
};

export class WS {
    private readonly webSocket: WebSocket;
    private readonly MAX_RETRIES = 3; // TODO: move this to .env file
    private readonly RETRY_DELAY = 50;
    private logger: Logger;
    url: string;
    status = Status.NOT_ACTIVE;
    private pendingRequests: Map<string | undefined, any>;

    static #instance: WS;
    static #connstr: string;
    static instance(params?: WsInitParams) {
        if (
            (!WS.#instance && !!params) ||
            (!!params && params?.url != WS.#connstr)
        ) {
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
        this.logger = new Logger("WS");
        this.pendingRequests = new Map();

        this.logger.log(`connstr: ${WS.#connstr}`);
        this.url = WS.#connstr;

        this.logger.log(`url: ${this.url}`);
        this.webSocket = new WebSocket(this.url);

        this.webSocket.on("error", () => {
            this.status = Status.ERROR;
            onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("open", () => {
            this.status = Status.CONNECTED;
            onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("close", () => {
            this.status = Status.DISCONNECTED;
            onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("message", (data: RawData) => {
            try {
                const resp = JSON.parse(data.toString()) as Result<any>;
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

    static isConnected(url?: string): boolean {
        const instance = WS.instance();

        if (url && instance?.url != url) return false;

        if (instance?.url) {
            return (
                WS.#instance?.webSocket?.readyState === WebSocket.OPEN &&
                instance.url === WS.#connstr
            );
        }

        return false;
    }

    send(message: string): void {
        this.webSocket.send(message);
    }
    /**
     * Send message and returns the response
     * @param {number} id - must be passed to function to know which id look in responses
     * @param {string} message - whole message that is send to inspector, must contain id in it!
     */
    async sendAndReceive<T>(id: number, message: string): Promise<T | null> {
        this.send(message);

        let isResolved = false;
        return new Promise<T | null>((resolve, _) => {
            for (let i = 0; i < this.MAX_RETRIES; i++) {
                if (isResolved) return;
                setTimeout(() => {
                    const resp = this.pendingRequests.get(id.toString());
                    if (resp) {
                        resolve(resp);
                        this.pendingRequests.delete(id.toString());
                        isResolved = true;
                    }
                }, this.RETRY_DELAY);
            }
        });
    }
}
