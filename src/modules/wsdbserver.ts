import { Status } from "../constants/status";
import { RawData, WebSocket } from "ws";
import { DebuggingResponse } from "./debugger";

export const initWs = (
    url: string,
    setStatus: (status: Status) => void,
    processMessage: (message: DebuggingResponse) => void,
) => {
    const ws = new WebSocket(url);

    ws.on("error", () => {
        console.error;
        setStatus(Status.ERROR);
    });

    ws.on("open", () => {
        setStatus(Status.CONNECTED);
    });

    ws.on("close", () => {
        setStatus(Status.DISCONNECTED);
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
