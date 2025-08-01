export type DebuggingParams = {
    expression?: string;
    returnByValue?: boolean;
};

export class DebuggingMessage {
    id: number;
    method: string;
    params?: DebuggingParams;

    constructor(id: number, method: string, params?: DebuggingParams) {
        this.id = id;
        this.method = method;
        if (params) this.params = { ...params };
    }
}

export type MemoryValue = {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
};

export type DebuggingResponse = {
    id: number;
    result?: {
        result: {
            type: "object";
            value: MemoryValue;
        };
    };
};

export const MEMORY_USAGE_ID = 1;

export const RUNTIME = {
    evaluate: "Runtime.evaluate",
    runIfWaitingForDebugger: "Runtime.runIfWaitingForDebugger",
};
