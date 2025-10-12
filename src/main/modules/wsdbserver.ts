import type { RawData } from "ws";
import { WebSocket } from "ws";
import { Status } from "../constants/status";
import type { InspectorMessage } from "../types/message.types";
import { Logger } from "./logger";

type WsInitParams = {
    url?: string;
    onStatusUpdateCallback: (status: Status) => void;
    onMessageCallback: (msg: InspectorMessage) => void;
};

export class WS {
    static #instance: WS;
    static #connstr: string;

    public url: string;
    public status = Status.NOT_ACTIVE;

    private readonly webSocket: WebSocket;
    private readonly MAX_RETRIES = 3; // TODO: move this to .env file
    private readonly RETRY_DELAY = 50;
    private readonly logger: Logger;
    private readonly pendingRequests: Map<string | undefined, unknown>;

    private constructor(params: WsInitParams) {
        this.logger = new Logger("WS");
        this.pendingRequests = new Map();

        this.logger.log(`connstr: ${WS.#connstr}`);
        this.url = WS.#connstr;

        this.logger.log(`url: ${this.url}`);
        this.webSocket = new WebSocket(this.url);

        this.webSocket.on("error", () => {
            this.status = Status.ERROR;
            params.onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("open", () => {
            this.status = Status.CONNECTED;
            params.onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("close", () => {
            this.status = Status.DISCONNECTED;
            params.onStatusUpdateCallback(this.status);
        });

        this.webSocket.on("message", (data: RawData) => {
            try {
                const resp = JSON.parse(data.toString()) as InspectorMessage;
                this.pendingRequests.set(resp.id.toString(), resp);
                params.onMessageCallback(resp);
            } catch (e) {
                this.logger.error(e as string);
            }
        });
    }

    public static instance(params?: WsInitParams): WS {
        if (params != undefined) {
            WS.#instance = new WS(params);
        }

        return WS.#instance;
    }

    public static setConnstr(connStr: string): void {
        WS.#connstr = connStr;
    }

    public static reset(params: WsInitParams): WS {
        WS.#instance = new WS(params);

        return WS.#instance;
    }

    public static isConnected(url?: string): boolean {
        const instance = WS.instance();

        if (instance.url != url) return false;

        if (instance.url) {
            return (
                WS.#instance.webSocket.readyState === WebSocket.OPEN &&
                instance.url === WS.#connstr
            );
        }

        return false;
    }

    public send(message: string): void {
        this.webSocket.send(message);
    }
    /**
     * Send message and returns the response
     * @param {number} id - must be passed to function to know which id look in responses
     * @param {string} message - whole message that is send to inspector, must contain id in it!
     */
    public async sendAndReceive<T>(
        id: number,
        message: string,
    ): Promise<T | null> {
        this.send(message);

        let isResolved = false;
        return await new Promise<T | null>((resolve, _) => {
            for (let i = 0; i < this.MAX_RETRIES; i++) {
                if (isResolved) return;
                setTimeout(() => {
                    const resp: T = this.pendingRequests.get(
                        id.toString(),
                    ) as T;
                    if (resp != undefined) {
                        resolve(resp);
                        this.pendingRequests.delete(id.toString());
                        isResolved = true;
                    }
                }, this.RETRY_DELAY);
            }
        });
    }
}
