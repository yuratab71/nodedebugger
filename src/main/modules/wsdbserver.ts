import { RawData, WebSocket } from "ws";
import { Status } from "../constants/status";
import { InspectorMessage } from "../types/message.types";
import { Logger } from "./logger";

type WsInitParams = {
	url?: string;
	onStatusUpdateCallback: (status: Status) => void;
	onMessageCallback: (msg: InspectorMessage) => void;
};

export class WS {
	private readonly webSocket: WebSocket;
	private readonly MAX_RETRIES = 3; // TODO: move this to .env file
	private readonly RETRY_DELAY = 50;
	private readonly logger: Logger;
	public url: string;
	public status = Status.NOT_ACTIVE;
	private readonly pendingRequests: Map<string | undefined, InspectorMessage>;

	static #instance: WS;
	static #connstr: string;
	public static instance(params?: WsInitParams): WS {
		if (
			(!WS.#instance && !!params)
			|| (!!params && params?.url != WS.#connstr)
		) {
			WS.#instance = new WS(params);
		}

		return WS.#instance;
	}

	public static setConnstr(connStr: string): void {
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
				const resp = JSON.parse(data.toString()) as InspectorMessage;
				this.pendingRequests.set(resp.id?.toString(), resp);
				onMessageCallback(resp);
			} catch (e) {
				this.logger.error(e);
			}
		});
	}

	public static reset(params: WsInitParams): WS {
		WS.#instance = new WS(params);

		return WS.#instance;
	}

	public static isConnected(url?: string): boolean {
		const instance = WS.instance();

		if (url && instance?.url != url) return false;

		if (instance?.url) {
			return (
				WS.#instance?.webSocket?.readyState === WebSocket.OPEN
				&& instance.url === WS.#connstr
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
	public sendAndReceive<T>(id: number, message: string): Promise<T | null> {
		this.send(message);

		return new Promise<T | null>((resolve, _) => {
			for (let i = 0; i < this.MAX_RETRIES; i++) {
				setTimeout(() => {
					const resp = this.pendingRequests.get(id.toString());
					if (resp) {
						resolve(resp);
						this.pendingRequests.delete(id.toString());
					}
				}, this.RETRY_DELAY);
			}
		});
	}
}
