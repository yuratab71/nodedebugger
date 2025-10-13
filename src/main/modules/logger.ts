// biome-ignore-all lint: console.log used in custom logger;

export const passMessage = (message: string): string => {
	return `[NQUISITOR ${new Date().toTimeString().split(" ")[0]}]: ${message}`;
};

export class Logger {
	private readonly name: string;
	private readonly red = "\x1b[31m";
	private readonly green = "\x1b[32m";
	private readonly yellow = "\x1b[33m";
	private readonly resetColor = "\x1b[0m";
	public constructor(name: string) {
		this.name = name;
	}

	public log(log?: unknown): void {
		console.log(
			this.green + `[${this.name}]: ` + this.resetColor + `${log}`,
		);
	}

	public warn(warn: unknown): void {
		console.log(
			this.yellow + `[${this.name}]: ` + this.resetColor + `${warn}`,
		);
	}

	public error(error: unknown): void {
		console.log(
			this.red + `[${this.name}]: ` + this.resetColor + `${error}`,
		);
	}

	public group(obj: unknown, name: string = "Object: "): void {
		console.log(`// ${name}: ${this.name}`);
		console.log(JSON.stringify(obj, null, 4));
		console.log("\/\/");
	}
}
