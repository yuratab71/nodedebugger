import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";

type SubprocessInitParams = {
	entry: string;
	onData: (data: unknown) => void;
	onError: (data: unknown) => void;
	onExit: (code: number, signal: NodeJS.Signals) => void;
};

export default class Subprocess {
	private child: ChildProcessWithoutNullStreams | null;
	private arguments = [
		"--inspect-brk",
		"--max-old-space-size=1024",
		"--trace-gc",
	];
	private envs = {
		PORT: "3030",
	};

	public entry: string;

	static #instance: Subprocess | null;
	public static instance(params: SubprocessInitParams): Subprocess {
		if (!Subprocess.#instance) {
			Subprocess.#instance = new Subprocess(params);
		}

		return Subprocess.#instance;
	}

	private constructor({
		entry,
		onData,
		onExit,
		onError,
	}: SubprocessInitParams) {
		this.entry = entry;
		this.child = spawn("node", [...this.arguments, this.entry], {
			env: this.envs,
		});

		this.child.stdout.on("data", onData);
		this.child.stderr.on("data", onError);
		this.child.on("exit", onExit);
	}

	public static isRunning(): boolean {
		return (
			!Subprocess.#instance?.child?.killed
			&& Subprocess.#instance?.child?.exitCode === null
		);
	}

	public static kill(): boolean {
		if (Subprocess.#instance?.child?.kill("SIGKILL")) {
			Subprocess.#instance = null;
			return true;
		}

		return false;
	}
}
