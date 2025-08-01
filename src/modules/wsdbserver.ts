import { RawData, WebSocket } from "ws";
import {
    DebuggingMessage,
    DebuggingResponse,
    MEMORY_USAGE_ID,
} from "./debuggigmessages";

export type ConnectionStatus =
    | "connected"
    | "disconnected"
    | "not active"
    | "error";

export const initWs = (
    url: string,
    setStatus: (status: ConnectionStatus) => void,
    processMessage: (message: DebuggingResponse) => void,
) => {
    const ws = new WebSocket(url);

    ws.on("error", () => {
        console.error;
        setStatus("error");
    });

    ws.on("open", () => {
        console.log("open");
        setStatus("connected");
    });

    ws.on("close", () => {
        setStatus("disconnected");
    });

    ws.on("message", function message(data: RawData) {
        try {
            processMessage(JSON.parse(data.toString()) as DebuggingResponse);
        } catch (e) {
            console.debug(e);
        }
    });

    return ws;
};
