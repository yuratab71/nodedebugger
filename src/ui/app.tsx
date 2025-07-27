import { useEffect, useState } from "react";

export default function Main() {
	const [logs, setLogs] = useState([]);
	const [wsuuid, setWsUuid] = useState("");
	const [wsStatus, setWsstatus] = useState("unknown");

	
	useEffect(() => {
	window.electronAPI.onProcessLog((msg) => {
		setLogs((prev) => [...prev, msg.trim()])
			});

	window.electronAPI.setWsStatus((status) => {
		setWsstatus(status);
		})
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
		<pre style={{ background: '#111', color: '#0f0', padding: '1em', marginTop: '1em', height: 300, overflowY: 'scroll' }}>
        {logs.join('\n')}
      </pre>
		</div>
	);

}
