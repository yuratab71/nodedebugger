import type { Event, InspectorErrorResp, Result } from "../global";
import type { Debugger, DebuggerEvents } from "./debugger.types";
import type { Runtime } from "./runtime.types";

type ResultCombined = Debugger.SetBreakpointByUrlResult &
    Debugger.EnableResult &
    Debugger.GetScriptSourceResult &
    Runtime.EvaluateResult;

type EventCombined = DebuggerEvents.Paused &
    DebuggerEvents.Resumed &
    DebuggerEvents.ScriptParsed;

export type InspectorMessage = Result<ResultCombined> &
    Event<EventCombined> &
    InspectorErrorResp;
