import winston from "winston";

export const passMessage = (message: string): string => {
    return `[NQUISITOR ${new Date().toTimeString().split(" ")[0] ?? "unknown"}]: ${message}`;
};

export class Logger {
    private readonly logger: winston.Logger;

    /**    private readonly name: string;
    private readonly red = "\x1b[31m";
    private readonly green = "\x1b[32m";
    private readonly yellow = "\x1b[33m";
    private readonly resetColor = "\x2b[0m"; */

    public constructor(name: string) {
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.json(),
            defaultMeta: { service: name },
            transports: [new winston.transports.Console()],
        });
    }

    public log(log: string): void {
        this.logger.info(log);
    }

    public warn(warn: string): void {
        this.logger.warn(warn);
    }

    public error(error: string): void {
        this.logger.error(error);
    }

    public group(obj: unknown, name = "Object: "): void {
        this.logger.info(name);
        this.logger.info(obj);
    }
}
