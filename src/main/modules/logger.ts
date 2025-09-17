export const passMessage = (message: string): string => {
    return `[NQUISITOR ${new Date().toTimeString().split(" ")[0]}]: ${message}`;
};

export class Logger {
    private name: string;
    private red = "\x1b[31m";
    private green = "\x1b[32m";
    private yellow = "\x1b[33m";
    private resetColor = "\x1b[0m";
    constructor(name: string) {
        this.name = name;
    }

    log(log?: any | undefined) {
        console.log(
            this.green + `[${this.name}]: ` + this.resetColor + `${log}`,
        );
    }

    warn(warn: any) {
        console.log(
            this.yellow + `[${this.name}]: ` + this.resetColor + `${warn}`,
        );
    }

    error(error: any) {
        console.log(
            this.red + `[${this.name}]: ` + this.resetColor + `${error}`,
        );
    }

    group(obj: any): void {
        console.log(`// object from: ${this.name}`);
        console.log(obj);
        console.log("\/\/");
    }
}
