import { combineReducers, createStore } from "redux";
import { breakpointsReducer } from "./breakpoints.reducer";
import { updateCallFrameReducer } from "./callFrames.reducer";
import { memoryStatsReducer } from "./memoryStats.reducer";
import { parsedFileReducer } from "./parsedFiles.reducer";
import { webSocketStatusReducer } from "./webSocketConnection.reducer";

// biome-ignore lint: redux
const globalReducer = combineReducers({
	webSocketStatus: webSocketStatusReducer,
	memoryStats: memoryStatsReducer,
	parsedFiles: parsedFileReducer,
	breakpoints: breakpointsReducer,
	callFrames: updateCallFrameReducer,
});

export type GlobalState = ReturnType<typeof globalReducer>;

// biome-ignore lint: redux
const store = createStore(globalReducer);

export default store;
