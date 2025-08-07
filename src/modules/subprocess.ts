import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import path from "path";

type SubprocessInitParams = {
    src: string;
    onData: (data: any) => void;
    onError: (data: any) => void;
    onExit: (code: number, signal: NodeJS.Signals) => void;
};

export default class Subprocess {
    private instance: ChildProcessWithoutNullStreams | null;
    private arguments = [
        "--inspect-brk",
        "--max-old-space-size=1024",
        "--trace-gc",
    ];
    public root: string;

    constructor({ src, onData, onExit, onError }: SubprocessInitParams) {
        this.root = src;
        this.instance = spawn("node", [
            ...this.arguments,
            path.normalize(this.root),
        ]);

        this.instance.stdout.on("data", onData);
        this.instance.stderr.on("data", onError);
        this.instance.on("exit", onExit);
    }

    public isRunning(): boolean {
        return !this.instance?.killed && this.instance?.exitCode === null;
    }

    public kill() {
        if (this.instance != null) this.instance.kill();
        this.instance = null;
    }
}
