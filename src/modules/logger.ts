export const passMessage = (message: string): string => {
    return `[NQUISITOR ${new Date().toTimeString().split(" ")[0]}]: ${message}`;
};

export enum InstanceNames {
    MAIN = "MAIN_PROCESS", // refers to logs from main file
    FILE_MANAGER = "FILE_MANAGER",
    WEB_SOCKET = "WEB_SOCKET",
    SUBPROCESS = "SUBPROCESS",
}

export class Logger {
    log(instanceName: InstanceNames, log: string) {
        console.log(`[${instanceName}]: ${log}`);
    }
}
