import { Status } from "@/main/constants/status";

export type WebSocketStatusState = {
    status: Status;
};

const initialState: WebSocketStatusState = {
    status: Status.NOT_ACTIVE,
};

export const UPDATE_WS_CONNECTION = "UPDATE_WS_CONNECTION";

export interface UpdateWebSocketStatusAction {
    type: typeof UPDATE_WS_CONNECTION;
    status: Status;
}

export function webSocketStatusReducer(
    state: WebSocketStatusState = initialState,
    action: UpdateWebSocketStatusAction,
): WebSocketStatusState {
    switch (action.type) {
        case UPDATE_WS_CONNECTION:
            return { ...state, status: action.status };
        default:
            return state;
    }
}
