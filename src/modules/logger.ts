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

    log(log: string) {
        console.log(
            this.green + `[${this.name}]: ` + this.resetColor + `${log}`,
        );
    }

    warn(warn: string) {
        console.log(
            this.yellow + `[${this.name}]: ` + this.resetColor + `${warn}`,
        );
    }

    error(error: string) {
        console.log(
            this.red + `[${this.name}]: ` + this.resetColor + `${error}`,
        );
    }
}
