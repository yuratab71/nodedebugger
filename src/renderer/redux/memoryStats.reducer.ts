import { Runtime } from "@/main/types/runtime.types";

export type MemoryStatsState = Runtime.MemoryStats;

const initialState: MemoryStatsState = {
	rss: 0,
	heapTotal: 0,
	heapUsed: 0,
	external: 0,
};

export const UPDATE_MEMORY_STATS = "UPDATE_MEMORY_STATS";

export interface UpdateMemoryStatsAction {
	type: typeof UPDATE_MEMORY_STATS;
	stats: MemoryStatsState;
}

export function memoryStatsReducer(
	state: MemoryStatsState = initialState,
	action: UpdateMemoryStatsAction,
): MemoryStatsState {
	switch (action.type) {
		case UPDATE_MEMORY_STATS:
			return { ...state, ...action.stats };
		default:
			return state;
	}
}
