import { Runtime } from "./runtime.types";

export namespace Debugger {
    export type Breakpoint = {
        id: string;
    };

    export type LocationWithUrl = Omit<Location, "scriptId"> & {
        url: string;
    };

    export type EnableParams = {
        maxScriptsCacheSize?: number;
    };

    export type EnableResult = {
        debuggerId: Runtime.UniqueDebuggerId;
    };

    export type GetScriptSourceParams = {
        scriptId: Runtime.ScriptId;
    };
    export type GetScriptSourceResult = {
        scriptSource: string;
        bytecode?: string;
    };

    export type SetBreakpointByUrlParams = {
        lineNumber: number;
        url?: string;
        urlRegex?: string;
        scriptHash?: string;
        columnNumber?: number;
        condition?: string;
    };
    export type SetBreakpointByUrlResult = {
        breakpointId: BreakpointId;
        locations: Location[];
    };

    export type ResumeParams = {
        terminateOnResume?: boolean;
    };

    // event return types
    export type SetBreakPonitByUrlReturn = {
        breakpointId: BreakpointId;
        locations: Location[];
    };
    // -----------------
    //
    //
    //
    //
    //
    //
    // basic Debugger domain types from official DevTools docs
    export type BreakpointId = string;
    export type CallFrameId = string;
    export type Location = {
        scriptId: Runtime.ScriptId;
        lineNumber: number;
        columnNumber?: number;
    };

    export type BreakLocation = Location & {
        type?: "debuggerStatement" | "call" | "return";
    };

    export type Scope = {
        type:
            | "global"
            | "local"
            | "with"
            | "closure"
            | "catch"
            | "block"
            | "script"
            | "eval"
            | "module"
            | "wasm-expression-stack";
        object: Runtime.RemoteObject;
        name?: string;
        startLocation?: Location;
        endLocation?: Location;
    };

    export type CallFrame = {
        callFrameId: CallFrameId;
        functionName: string;
        functionLocation?: Location;
        location: Location;
        url: string;
        scopeChain: any[];
        this: Runtime.RemoteObject;
        returnValue?: Runtime.RemoteObject;
        canBeRestarted?: boolean;
    };

    export type DebugSymbols = {
        type: "SourceMap" | "EmbeddedDWARF" | "ExternalDWARF";
        externalUrl?: string;
    };

    export type ResolvedBreakpoint = {
        breakpointId: BreakpointId;
        location: Location;
    };

    export type ScriptLanguage = "JavaScript" | "WebAssembly";

    export type SearchMatch = {
        lineNumber: number;
        lineContent: string;
    };

    export type LocationRange = {
        scriptId: Runtime.ScriptId;
        start: ScriptPosition;
        end: ScriptPosition;
    };

    export type ScriptPosition = {
        lineNumber: number;
        columnNumber: number;
    };
    // ---------------------
}

export namespace DebuggerMethods {
    export const ENABLE = "Debugger.enable";
    export const PAUSE = "Debugger.pause";
    export const RESUME = "Debugger.resume";
    export const GET_SCRIPT_SOURCE = "Debugger.getScriptSource";
    export const SET_BREAKPOINT_BY_URL = "Debugger.setBreakpointByUrl";
}
