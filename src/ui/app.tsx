import { useEffect, useState } from "react";
import { Status } from "../constants/status";
import { MemoryValue } from "../modules/debugger";
import { MemoryUsageUIComponent } from "./components/memoryUsage";

export default function Main() {
	const [logs, setLogs] = useState([]);
	const [wsuuid, setWsUuid] = useState("");
	const [wsStatus, setWsstatus] = useState(Status.NOT_ACTIVE);

	const [memoryUsage, setMemoryUsage] = useState<MemoryValue | null>(null);
	
	useEffect(() => {
		try {
	window.electronAPI.onProcessLog((msg) => {
		setLogs((prev) => [...prev, msg.trim()])
			});

	window.electronAPI.setWsStatus((status) => {
		setWsstatus(status);
		})
	window.electronAPI.setMemoryUsage((data) => {
		setMemoryUsage(data?.result?.result?.value);

		})
		} catch (e) {
	console.error(e);
		}
		}, []
	);

	const handleStart = () => {
		window.electronAPI.startProcess();
	};
	
	const handleKill = () => {
		window.electronAPI.terminateProcess();
	};

	const onChange = (e: React.ChangeEvent<HTMLInputElement>
	) => {
		setWsUuid(e.target.value);
	};
	const connectToDebuggingServer = () => {
		window.electronAPI.connectWebSocket(wsuuid);
	};

	const resumeExecution = () => {
		window.electronAPI.resumeExecution();
	};
	return (
		<div>
			<h1>Nquisitor</h1>
			<h2>Connection: {wsStatus}</h2>
			<button onClick={handleStart}>Start Process</button>
			<button onClick={handleKill}>Terminate Process</button>
			<label>
				Ws: <input value={wsuuid || ""} onChange={ onChange } name="wsConnection"/>
			</label>
			<button onClick={connectToDebuggingServer}>Connect to debugging server</button>
			<button onClick={resumeExecution} disabled={wsStatus != "connected"}>Resume</button>
		<pre style={{ background: '#111', color: '#0f0', padding: '1em', marginTop: '1em', height: 300, overflowY: 'scroll' }}>
        {logs.join('\n')}
      </pre>
			{memoryUsage && <MemoryUsageUIComponent isConnected={wsStatus === "connected"} rss={memoryUsage.rss} heapTotal={memoryUsage.heapTotal} heapUsed={memoryUsage.heapUsed} external={memoryUsage.external}/>}
		</div>
	);

}
