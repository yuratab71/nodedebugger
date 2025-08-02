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
