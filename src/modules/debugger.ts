// TODO remove this file, move types to another place

export type MemoryValue = {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
};

export type CallFrames = {
    callFrameId: string;
    functionName: string;
    functionLocation: any;
    location: any;
    url: string;
    scopeChain: any[];
    this: any;
    canBeRestarted: true;
};

export type DebuggingResponse = {
    id?: number;
    method?: string;
    result?: {
        result: {
            type: "object";
            value: MemoryValue;
        };
    };
    params?: {
        callFrames?: CallFrames[];
        scriptId?: string;
        reason: string;
        url?: string;
        hitBreakpoint: any[];
    };
};
