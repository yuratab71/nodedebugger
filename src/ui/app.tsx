import { useEffect, useState } from "react";
import { Status } from "../constants/status";
import { MemoryValue } from "../modules/debugger";
import { Button } from "./components/common/button";
import { FilePickerUIComponent } from "./components/common/filePicker";
import { MemoryUsageUIComponent } from "./components/memoryUsage";
import { NavbarUIComponent } from "./components/navbar";

export default function Main() {
    const [logs, setLogs] = useState<string[]>([]);
    const [wsStatus, setWsstatus] = useState(Status.NOT_ACTIVE);

    const [memoryUsage, setMemoryUsage] = useState<MemoryValue | null>(null);

    useEffect(() => {
        try {
            window.electronAPI.onProcessLog((msg) => {
                setLogs((prev) => [...prev, msg.trim()]);
            });

            window.electronAPI.setWsStatus((status) => {
                setWsstatus(status);
            });
            window.electronAPI.setMemoryUsage((data) => {
                setMemoryUsage(data?.result?.result?.value);
            });
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleStart = () => {
        window.electronAPI.startProcess();
    };

    const handleKill = () => {
        window.electronAPI.terminateProcess();
    };

   const connectToDebuggingServer = () => {
        window.electronAPI.connectWebSocket();
    };

    const resumeExecution = () => {
        window.electronAPI.resumeExecution();
    };
    return (
        <div className="app_container">
            <div>
                <NavbarUIComponent status={wsStatus}/>
                <FilePickerUIComponent />
                <Button text={"Start Subprocess"} onClick={handleStart}/>
                <Button text={"Terminate Subprocess"} onClick={handleKill}/>
               <Button text={"Connect debugger"} onClick={connectToDebuggingServer}/>
                <Button text={"Resume"}
                    onClick={resumeExecution}
                    disabled={wsStatus != "connected"}/>
                <pre
                    style={{
                        background: "#111",
                        color: "#0f0",
                        padding: "1em",
                        marginTop: "1em",
                        height: 300,
                        overflowY: "scroll",
                    }}>
                    {logs.join("\n")}
                </pre>
            </div>
           {memoryUsage && (
                <MemoryUsageUIComponent
                    isConnected={wsStatus === "connected"}
                    rss={memoryUsage.rss}
                    heapTotal={memoryUsage.heapTotal}
                    heapUsed={memoryUsage.heapUsed}
                    external={memoryUsage.external}
                />
            )}
        </div>
    );
}
