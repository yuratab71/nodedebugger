import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";

type SubprocessInitParams = {
    src: string;
    onData: (data: any) => void;
    onError: (data: any) => void;
    onExit: (code: number, signal: NodeJS.Signals) => void;
};

export default class Subprocess {
    private child: ChildProcessWithoutNullStreams | null;
    private arguments = [
        "--inspect-brk",
        "--max-old-space-size=1024",
        "--trace-gc",
    ];
    public root: string;

    static #instance: Subprocess | null;
    static instance(params: SubprocessInitParams) {
        if (!Subprocess.#instance) {
            Subprocess.#instance = new Subprocess(params);
        }

        return Subprocess.#instance;
    }
    private constructor({
        src,
        onData,
        onExit,
        onError,
    }: SubprocessInitParams) {
        this.root = src;
        this.child = spawn("node", [
            ...this.arguments,
            path.normalize(this.root),
        ]);

        this.child.stdout.on("data", onData);
        this.child.stderr.on("data", onError);
        this.child.on("exit", onExit);
    }

    static isRunning(): boolean {
        return (
            !Subprocess.#instance?.child?.killed &&
            Subprocess.#instance?.child?.exitCode === null
        );
    }

    static kill(): void {
        if (Subprocess.#instance?.child?.kill()) {
            Subprocess.#instance = null;
            console.log("Subprocess killed successfully");
        } else {
            console.log("Failed to kill subprocess");
        }
    }
}
