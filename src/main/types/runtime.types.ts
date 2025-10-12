export namespace Runtime {
    export type EnableParams = never;
    export type RunIfWaitingForDebuggerParams = never;

    export type EvaluateParams = {
        expression: string;
        objectGroup?: string;
        includeCommandLineAPI?: boolean;
        silent?: boolean;
        contextId?: ExecutionContextId;
        returnByValue?: boolean;
        generatePreview?: boolean;
        userGesture?: boolean;
        awaitPromise?: boolean;
        thrownOnSideEffectt?: boolean;
        timeout?: TimeDelta;
        disableBreaks?: boolean;
        replMode?: boolean;
        allowUnsafeEvalBlockedByCSP?: boolean;
        uniqueContextId?: string;
        serializationOptions?: SerializationOptions;
    };

    export type EvaluateResult = {
        result: RemoteObject;
        exceptionDetails?: ExceptionDetails;
    };

    export type EvaluateMemoryUsageResult = Runtime.MemoryStats;
    /**
     * js expression that passed to runtime to evaluate, is processed by JSON.stringify before sending
     * */
    export type JavascriptExpression =
        | string
        | {
              [key: string]: string | number;
          };

    /**
     * Primitive value which cannot be JSON-stringified. Includes values -0, NaN, Infinity, -Infinity, and bigint literals.
     * @type - string
     * */
    export type UnserializableValue = string;

    /**
     * Unique object identifier
     * @type - string
     * */
    export type RemoteObjectId = string;

    /**
     * Unique script identifier
     * @type - string
     * */
    export type ScriptId = string;

    /**
     *If debuggerId is set stack trace comes from another debugger and can be resolved there. This allows to track cross-debugger calls. See Runtime.StackTrace and Debugger.paused for usages.
     */
    export type UniqueDebuggerId = string;

    export type TimeDelta = number;
    /**
     * Allowed object types
     * */
    export type ObjectType =
        | "undefined"
        | "null"
        | "string"
        | "number"
        | "boolean"
        | "bigint"
        | "regexp"
        | "date"
        | "symbol"
        | "array"
        | "object"
        | "function"
        | "map"
        | "set"
        | "weakmap"
        | "weakset"
        | "error"
        | "proxy"
        | "promise"
        | "typedarray"
        | "arraybuffer"
        | "node"
        | "window"
        | "generator";

    export type PrimitiveType =
        | "object"
        | "function"
        | "undefined"
        | "string"
        | "number"
        | "boolean"
        | "symbol"
        | "bigint";

    export type Subtype =
        | "array"
        | "null"
        | "node"
        | "regexp"
        | "date"
        | "map"
        | "set"
        | "weakmap"
        | "weakset"
        | "iterator"
        | "generator"
        | "error"
        | "proxy"
        | "promise"
        | "typedarray"
        | "arraybuffer"
        | "dataview"
        | "webassemblymemory"
        | "wasmvalue"
        | "trustedtype";

    /**
     * Id of an execution context
     * */
    export type ExecutionContextId = string;
    /**
     *  Represents function call argument. Either remote object id objectId, primitive value, unserializable primitive value or neither of (for undefined) them should be specified.
     * */
    export type CallArgument = {
        value?: unknown;
        unserializableValue?: UnserializableValue;
        objectId?: RemoteObjectId;
    };

    /**
     * Stack entry for runtime errors and assertions
     * */
    export type CallFrame = {
        functionName: string;
        scriptId: ScriptId;
        url: string;
        lineNumber: number;
        columnNumber: number;
    };

    /**
     * Represents deep serialized value
     * */
    export type DeepSerializedValue = {
        type: ObjectType;
        value?: unknown;
        objectId?: string;
        weakLocalObjectReference?: number;
    };

    export type StackTraceId = {
        id: string;
        debuggerId: UniqueDebuggerId;
    };

    export type StackTrace = {
        description: string;
        callFrames: CallFrame[];
        parent: StackTrace;
        parentId: StackTraceId;
    };

    export type RemoteObject = {
        type: PrimitiveType;
        subtype?: Subtype;
        className?: string;
        value?: unknown | MemoryStats; // will be extended for more types that returned by evaluation
        unserializableValue?: UnserializableValue;
        description?: string;
        deepSerializedValue?: DeepSerializedValue;
        objectId?: RemoteObjectId;
        preview?: unknown; // TODO: finish this types
        customPreview: unknown; // TODO: finish this types
    };

    /**
     * Detailed information about exception (or error) that was thrown during script compilation or execution.
     */
    export type ExceptionDetails = {
        exceptionId: number;
        text: string;
        lineNumber: number;
        columnNumber: number;
        scriptId?: ScriptId;
        url?: string;
        stackTrace?: StackTrace;
        exception?: RemoteObject;
        executionContextId?: ExecutionContextId;
        exceptionMetaData: unknown;
    };

    /**
     * Description of an isolated world
     * */
    export type ExecutionContextDescription = {
        id: ExecutionContextId;
        origin: string;
        name: string;
        uniqueId: string;
        auxData?: unknown;
    };

    /**
     * Object internal property descriptor. This property isn't normally visible in JavaScript code
     */
    export type InternalPropertyDescriptor = {
        name: string;
        value: RemoteObject;
    };

    export type PropertyDescriptor = {
        name: string;
        value?: RemoteObject;
        writable?: boolean;
        get?: RemoteObject;
        set?: RemoteObject;
        configurable: boolean;
        enumerable: boolean;
        wasThrown?: boolean;
        isOwn?: boolean;
        symbol?: RemoteObject;
    };

    export type SerializationOptions = {
        serialization: "deep" | "json" | "idOnly";
        maxDepth?: number;
        additionalParameters?: unknown;
    };

    export type MemoryStats = {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
}

export namespace RuntimeMethods {
    export const ENABLE = "Runtime.enable";
    export const EVALUATE = "Runtime.evaluate";
    export const RUN_IF_WAITING_FOR_DEBUGGER =
        "Runtime.runIfWaitingForDebugger";
    export const GLOBAL_LEXICAL_SCOPE_NAMES = "Runtime.globalLexicalScopeNames";
}
