import { SourceMap } from "./sourceMap.types";

export type Entry = {
    path: string; // actual path from os
    inspectorUrl: string; // url that used in V8 inspector
    scriptId: string; // scriptId that used in V8 inspector
    name: string;
    isDir: boolean;
    extension: string;
    sourceMapUrl?: string;
    sourceMap: SourceMap | null;
    sources?: string[] | undefined;
};

/**
 * Slash for unix-like systems paths
 * @constant
 * @default "/"
 **/
export const POSIX_SEPARATOR = "/";

/**
 * Backslash for windows paths
 * @constant
 * @default "\"
 **/
export const WIN32_SEPARATOR = "\\";
