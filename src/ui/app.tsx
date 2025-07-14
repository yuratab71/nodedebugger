import { useEffect, useState } from "react";




export default function Main() {

	const [logs, setLogs] = useState([]);

	useEffect(() => {
	window.electronAPI.onProcessLog((msg) => {
		setLogs((prev) => [...prev, msg.trim()])
			});
		}, []
	);

	const handleStart = () => {
		window.electronAPI.startProcess();
		setLogs((prev) => [...prev, "Started external process..."]);
	};
	return (
		<div>
			<h1>Nquisitor</h1>
			<button onClick={handleStart}>Start Process</button>
		<pre style={{ background: '#111', color: '#0f0', padding: '1em', marginTop: '1em', height: 300, overflowY: 'scroll' }}>
        {logs.join('\n')}
      </pre>
		</div>
	);

}
