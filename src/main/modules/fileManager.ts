import fs, { readFileSync } from "node:fs";
import path from "path";
import { SourceMapConsumer } from "source-map-js";
import { PackageJson, TsConfigJson } from "type-fest";
import { Debugger, DebuggerEvents } from "../types/debugger.types";
import {
    Entry,
    POSIX_SEPARATOR,
    WIN32_SEPARATOR,
} from "../types/fileManager.types";
import { SourceMap } from "../types/sourceMap.types";
import { Logger } from "./logger";

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
    private readonly logger: Logger;
    private readonly rootDir: string;

    private readonly srcFileStructure: Entry[];
    private readonly parsedFiles: Entry[];
    private readonly subprocessPackageJson: PackageJson;
    private readonly subprocessTsConfig: TsConfigJson;

    public main: string | null;

    static #instance: FileManager | null;

    public static instance(params: FileManagerInitParams): FileManager {
        if (!FileManager.#instance) {
            FileManager.#instance = new FileManager(params);
        }

        return FileManager.#instance;
    }

    public static removeInstance(): void {
        FileManager.#instance = null;
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

    private resolveDirectoryFiles(dir: string): Entry[] {
        const entries = fs.readdirSync(dir);
        const result: Entry[] = [];
        entries.forEach((entry: string) => {
            const stats = fs.statSync(path.join(dir, entry));
            const location = path.join(dir, entry);
            result.push({
                name: entry,
                inspectorUrl: "",
                scriptId: "",
                path: location,
                isDir: stats.isDirectory(),
                extension: path.extname(entry),
                sources: [],
                sourceMap: null,
            });
        });
        this.logger.log("directory files resolved");
        return result;
    }

    public getPathToMain(): string | null {
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

    public readFile(src: fs.PathLike): string {
        const isFile = fs.lstatSync(src).isFile();
        if (isFile) {
            const fileContent = readFileSync(src, { encoding: "utf8" });
            if (fileContent) return fileContent;
            return "Some error occured during file read";
        }

        return "Not a file, maybe a folder\n";
    }

    public registerParsedFile(
        scriptParsed: DebuggerEvents.ScriptParsed,
    ): Entry {
        this.logger.log(
            "registering a parsed file by url: " + scriptParsed.url,
        );
        const fp = path.parse(scriptParsed.url.slice(8));
        let sm: SourceMap | null = null;
        if (scriptParsed?.sourceMapURL) {
            sm = this.ecstrackInlineSourceMap(scriptParsed?.sourceMapURL);
            if (!sm)
                this.logger.log(
                    "cannot extract source map, looks like its .js file",
                );
        }

        const file: Entry = {
            path: fp.dir + "/" + fp.name + fp.ext,
            inspectorUrl: scriptParsed.url,
            scriptId: scriptParsed.scriptId,
            name: fp.name,
            isDir: false,
            extension: fp.ext,
            sourceMapUrl: scriptParsed?.sourceMapURL ?? "none",
            sourceMap: sm,
            sources: sm?.sources
                ? sm?.sources.map((el) => {
                      return this.normalizeForPOSIXpath(
                          path.resolve(fp.dir, el),
                      );
                  })
                : [],
        };
        this.parsedFiles.push(file);
        this.logger.group(file, "registered file");
        return file;
    }

    public getDirectoryContent(dir: string): Entry[] {
        const entries = fs.readdirSync(dir);
        const result: Entry[] = [];
        entries.forEach((entry: string) => {
            const stats = fs.statSync(path.join(dir, entry));
            const location = path.join(dir, entry);
            result.push({
                name: entry,
                path: location,
                inspectorUrl: "",
                scriptId: "",
                isDir: stats.isDirectory(),
                extension: path.extname(entry),
                sources: [],
                sourceMap: null,
            });
        });

        return result;
    }

    public evaluateSourceMap(origin: string): SourceMapConsumer | null {
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
                    if (smu != undefined) {
                        return new SourceMapConsumer(smu);
                    }
                }
            }
        }
        if (!isFileParsed)
            this.logger.log(`${normalizedPath} HAS NOT parsed by V8`);

        return null;
    }

    public getOriginLocation(
        loc: Debugger.LocationWithUrl,
    ): Debugger.LocationWithUrl | null {
        let normalizedPath;
        if (process.platform === "win32") {
            normalizedPath = this.normalizeForPOSIXpath(loc.url);
        } else {
            normalizedPath = loc.url;
        }
        for (let i = 0; i < this.parsedFiles.length; i++) {
            if (this.parsedFiles[i]?.sources?.includes(normalizedPath)) {
                const entry = this.parsedFiles[i];
                if (entry && entry.sourceMap != null) {
                    const smconsumer = new SourceMapConsumer(entry.sourceMap);

                    const pos = smconsumer.originalPositionFor({
                        line: loc.lineNumber,
                        column: 0,
                    });

                    return {
                        url: entry.path,
                        lineNumber: pos.line,
                        columnNumber: pos.column,
                    };
                } else {
                    return null;
                }
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

    private normalizeForPOSIXpath(p: string): string {
        return p.split(WIN32_SEPARATOR).join(POSIX_SEPARATOR);
    }
}
