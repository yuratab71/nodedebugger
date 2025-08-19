import fs from "node:fs";
import { readFileSync } from "original-fs";
import path from "path";
import { PackageJson, TsConfigJson } from "type-fest";
import { Logger } from "./logger";

export type Entry = {
    path: string;
    name: string;
    isDir: boolean;
    extension: string;
};

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

        return "Not a file, maybe a floder\n";
    }

    registerParsedFile(url: string): void {
        const fp = path.parse(url);
        const file: Entry = {
            path: fp.root + fp.name + fp.ext,
            name: fp.name,
            isDir: false,
            extension: fp.ext,
        };
        this.logger.log(url);
        this.logger.group(file);
        this.parsedFiles.push(file);
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
            });
        });

        return result;
    }
}
