import { wsStatus } from "../../main/constants/wsStatus";

export type WebSocketStatusState = {
	status: wsStatus;
};

const initialState: WebSocketStatusState = {
	status: wsStatus.NOT_ACTIVE,
};

export const UPDATE_WS_CONNECTION = "UPDATE_WS_CONNECTION";

export interface UpdateWebSocketStatusAction {
	type: typeof UPDATE_WS_CONNECTION;
	status: wsStatus;
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
