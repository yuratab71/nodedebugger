import { combineReducers, createStore } from "redux";
import { memoryStatsReducer } from "./memoryStats.reducer";
import { webSocketStatusReducer } from "./webSocketConnection.reducer";

const globalReducer = combineReducers({
    webSocketStatus: webSocketStatusReducer,
    memoryStats: memoryStatsReducer,
});

export type GlobalState = ReturnType<typeof globalReducer>;

const store = createStore(globalReducer);

export default store;
