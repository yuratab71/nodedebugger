export type BreakpointsState = {
    ids: string[];
};

const initialState: BreakpointsState = {
    ids: [],
};

export const ADD_BREAKPOINT = "ADD_BREAKPOINT";
export const DELETE_BREAKPOINTS = "DELETE_BREAKPOINTS";

export interface AddBreakpointAction {
    type: typeof ADD_BREAKPOINT;
    data: string;
}

export interface DeleteBreakpoints {
    type: typeof DELETE_BREAKPOINTS;
}

export function breakpointsReducer(
    state: BreakpointsState = initialState,
    action: AddBreakpointAction | DeleteBreakpoints,
): BreakpointsState {
    switch (action.type) {
        case ADD_BREAKPOINT:
            return { ...state, ids: [...state.ids, action.data] };
        case DELETE_BREAKPOINTS:
            return { ...state, ids: [] };
        default:
            return state;
    }
}
