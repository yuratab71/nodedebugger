import { ErrorMsg, Event, Result } from "../global";
import { Debugger, DebuggerEvents } from "./debugger.types";
import { Runtime } from "./runtime.types";

type ResultCombined = Debugger.SetBreakpointByUrlResult &
    Debugger.EnableResult &
    Debugger.GetScriptSourceResult &
    Runtime.EvaluateResult;

type EventCombined = DebuggerEvents.Paused &
    DebuggerEvents.Resumed &
    DebuggerEvents.ScriptParsed;

export type InspectorMessage = Result<ResultCombined> &
    Event<EventCombined> &
    ErrorMsg;
