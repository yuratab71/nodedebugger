import { useEffect, useState } from "react";
import { Entry } from "../modules/fileManager";
import { Status } from "../constants/status";
import { MemoryValue } from "../modules/debugger";
import { MemoryUsageUIComponent } from "./components/memoryUsage";
import { NavbarUIComponent } from "./components/navbar";
import { CodeVisualizerUIComponent } from "./components/codeVisualizer";
import styled from "styled-components";

const AppWrapper = styled.div`
    overflow: hidden;
`;

export default function Main() {
    const [logs, setLogs] = useState<string[]>([]);
    const [wsStatus, setWsstatus] = useState(Status.NOT_ACTIVE);

    const [memoryUsage, setMemoryUsage] = useState<MemoryValue | null>(null);
    const [fileStructure, setFileStructure] = useState<Entry[]>([]);
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
            window.electronAPI.getFileStructure((files: Entry[]) => {
                setFileStructure(files);
            });
        } catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <AppWrapper>
            <div>
                <NavbarUIComponent status={wsStatus} />
                <div>
                    <CodeVisualizerUIComponent files={fileStructure} />
                </div>
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
        </AppWrapper>
    );
}
