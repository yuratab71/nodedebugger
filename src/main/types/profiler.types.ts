import { Runtime } from "./runtime.types";

export namespace Profiler {
	export type CoverageRange = {
		startOffset: number;
		endOffset: number;
		count: number;
	};

	export type FunctionCoverage = {
		functionName: string;
		ranges: CoverageRange[];
		isBlockCoverage: boolean;
	};

	export type PositionTickInfo = {
		line: number;
		ticks: number;
	};

	export type ProfileNode = {
		id: number;
		callFrame: Runtime.CallFrame;
		hitCount?: number;
		children?: number[];
		deoptReason?: string;
		positionTicks?: PositionTickInfo[];
	};

	export type Profile = {
		nodes: ProfileNode[];
		startTime: number;
		endTimes: number;
		samples?: number[];
		timeDeltas?: number[];
	};

	export type ScriptCoverage = {
		scriptId: Runtime.ScriptId;
		url: string;
		functions: FunctionCoverage[];
	};
}
