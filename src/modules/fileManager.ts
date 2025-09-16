import fs from "node:fs";
import { readFileSync } from "node:fs";
import path from "path";
import { SourceMapConsumer } from "source-map-js";
import { PackageJson, TsConfigJson } from "type-fest";
import { Logger } from "./logger";
import { SourceMap } from "../types/sourceMap";

export type Entry = {
    path: string;
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
const POSIX_SEPARATOR = "/";

/**
 * Backslash for windows paths
 * @constant
 * @default "\"
 **/
const WIN32_SEPARATOR = "\\";

/**
 * All V8 url starts with this line
 * a bit of a hack, will be replaced in future
 * @type {string}
 * @constant
 * @default "file:///"
 **/
// const SCRIPT_URL_BASE = "file:///";

export type FileManagerInitParams = {
    src: string;
    onFileStructureResolveCallback: (root: string, files: Entry[]) => void;
};

export class FileManager {
    // directory of subprocess, where code is located
    rootDir: string;
    srcFileStructure: Entry[];
    parsedFiles: Entry[];
    // main file which is executable, i.g. "main.js"
    main: string | null;
    subprocessPackageJson: PackageJson;
    subprocessTsConfig: TsConfigJson;

    private logger: Logger;

    static #instance: FileManager | null;

    static instance(params: FileManagerInitParams): FileManager {
        if (!FileManager.#instance) {
            FileManager.#instance = new FileManager(params);
        }

        return FileManager.#instance;
    }

    static removeInstance(): void {
        FileManager.#instance = null;
    }

    private resolveDirectoryFiles(dir: string) {
        const entries = fs.readdirSync(dir);
        const result: Entry[] = [];
        entries.forEach((entry: string) => {
            const stats = fs.statSync(path.join(dir, entry));
            const location = path.join(dir, entry);
            result.push({
                name: entry,
                path: location,
                isDir: stats.isDirectory(),
                extension: path.extname(entry),
                sourceMap: null,
            });
        });
        this.logger.log("directory files resolved");
        return result;
    }

    private constructor({
        src,
        onFileStructureResolveCallback,
    }: FileManagerInitParams) {
        this.logger = new Logger("FILE MANAGER");
        this.rootDir = src;
        this.parsedFiles = [];
        this.subprocessPackageJson = JSON.parse(
            fs.readFileSync(path.join(this.rootDir, "package.json"), "utf-8"),
        );
        this.subprocessTsConfig = JSON.parse(
            fs.readFileSync(path.join(this.rootDir, "tsconfig.json"), "utf-8"),
        );
        this.main = path.join(this.rootDir, this.resolveMain());
        this.srcFileStructure = this.resolveDirectoryFiles(src);

        onFileStructureResolveCallback(this.rootDir, this.srcFileStructure);
    }

    getPathToMain(): string | null {
        return this.main;
    }

    private resolveMain(): string {
        // TODO add another conditions
        let result = "";
        if (this.subprocessTsConfig?.compilerOptions?.outDir) {
            result += this.subprocessTsConfig?.compilerOptions?.outDir;
        }
        if (this.subprocessPackageJson?.main != undefined) {
            result += path.join(this.subprocessPackageJson?.main);
            return result;
        }

        //TODO add another checks
        return path.join(result, "main.js");
    }

    readFile(src: fs.PathLike) {
        const isFile = fs.lstatSync(src).isFile();
        if (isFile) return readFileSync(src, { encoding: "utf8" });

        return "Not a file, maybe a folder\n";
    }

    registerParsedFile(url: string, sourceMapUrl: string): void {
        const fp = path.parse(url.slice(8));
        const sm = this.ecstrackInlineSourceMap(sourceMapUrl);

        const file: Entry = {
            path: fp.dir + "/" + fp.name + fp.ext,
            name: fp.name,
            isDir: false,
            extension: fp.ext,
            sourceMapUrl: sourceMapUrl,
            sourceMap: sm,
            sources: sm?.sources.map((el) => {
                return this.normalizeForPOSIXpath(path.resolve(fp.dir, el));
            }),
        };
        this.logger.group(file);
        this.parsedFiles.push(file);
        this.logger.log(`Parsed: ${this.parsedFiles.length}`);
    }

    getDirectoryContent(dir: string) {
        const entries = fs.readdirSync(dir);
        const result: Entry[] = [];
        entries.forEach((entry: string) => {
            const stats = fs.statSync(path.join(dir, entry));
            const location = path.join(dir, entry);
            result.push({
                name: entry,
                path: location,
                isDir: stats.isDirectory(),
                extension: path.extname(entry),
                sourceMap: null,
            });
        });

        return result;
    }

    evaluateSourceMap(origin: string): SourceMapConsumer | null {
        // INFO: two entries, if schecking js file and ts file
        // INFO: use POSIX slash style, as "/", cause V8 inspector uses POSIX style
        //
        //
        // TODO: refactor this mess
        // TODO: add checks for .ts origin files
        let normalizedPath;
        if (process.platform === "win32") {
            normalizedPath = this.normalizeForPOSIXpath(origin);
        } else {
            normalizedPath = origin;
        }

        this.logger.log("originla: " + origin);
        this.logger.log("normalized: " + normalizedPath);

        let isFileParsed = false;

        for (let i = 0; i < this.parsedFiles.length; i++) {
            if (this.parsedFiles[i]?.path === normalizedPath) {
                this.logger.log(
                    `${normalizedPath} is .js file and HAS BEEN parsed by V8`,
                );
                this.logger.log(`here is the source map`);
                this.logger.group(this.parsedFiles[i]?.sourceMap);
                return null;
            }
        }
        if (!isFileParsed && path.parse(normalizedPath).ext === ".ts") {
            this.logger.log(
                `${normalizedPath}: is a .ts file and HAS NOT been parsed directly`,
            );

            for (let i = 0; i < this.parsedFiles.length; i++) {
                if (this.parsedFiles[i]?.sources?.includes(normalizedPath)) {
                    this.logger.log(
                        `${normalizedPath} is the origin for: ${this.parsedFiles[i]?.name}`,
                    );
                    isFileParsed = true;
                    const smu = this.parsedFiles[i]?.sourceMap;
                    if (!!smu) {
                        return new SourceMapConsumer(smu);
                    }
                }
            }
        }
        if (!isFileParsed)
            this.logger.log(`${normalizedPath} HAS NOT parsed by V8`);

        return null;
    }

    getOriginUrl(url: string): string | null {
        for (let i = 0; i < this.parsedFiles.length; i++) {
            this.logger.group(this.parsedFiles[i]?.sources);
            if (this.parsedFiles[i]?.sources?.includes(url)) {
                this.logger.log(
                    "detect the source file for given url, creating source map",
                );

                this.logger.group(this.parsedFiles[i]?.sourceMap);
            }
        }

        return null;
    }

    private ecstrackInlineSourceMap(inlineSM: string): SourceMap | null {
        this.logger.log("check source map");
        const regExp = /data:application\/json;base64,([^\s]+)/;

        const match = inlineSM.match(regExp);

        if (!match) return null;
        if (match[1]) {
            const json = atob(match[1]);
            const result: SourceMap = JSON.parse(json);
            return result;
        }

        return null;
    }

    private normalizeForPOSIXpath(p: string) {
        return p.split(WIN32_SEPARATOR).join(POSIX_SEPARATOR);
    }
}
