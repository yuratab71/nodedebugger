export const passMessage = (message: string): string => {
    return `[NQUISITOR ${new Date().toTimeString().split(" ")[0]}]: ${message}`;
};
