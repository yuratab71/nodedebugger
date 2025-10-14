import { Debugger } from "@/main/types/debugger.types";

export type CallFramesState = {
	callFrames: Debugger.CallFrame[];
};

const initialState: CallFramesState = {
	callFrames: [],
};

export const UPDATE_CALL_FRAMES = "UPDATE_CALL_FRAMES";

export interface UpdateCallFramesAction {
	type: typeof UPDATE_CALL_FRAMES;
	data: Debugger.CallFrame[];
}

export function updateCallFrameReducer(
	state: CallFramesState = initialState,
	action: UpdateCallFramesAction,
): CallFramesState {
	switch (action.type) {
		case UPDATE_CALL_FRAMES:
			return { callFrames: action.data };
		default:
			return state;
	}
}
