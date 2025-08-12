import fs from "node:fs";
import path from "path";
import { PackageJson, TsConfigJson } from "type-fest";

type Entry = {
    path: string;
    name: string;
    isDir: boolean;
    extension: string;
};

export class FileManager {
    // directory of subprocess, where code is located
    dir: string;
    srcFileStructure: Entry[];

    // main file which is executable, i.g. "main.js"
    main: string | null;
    subprocessPackageJson: PackageJson;
    subprocessTsConfig: TsConfigJson;

    static #instance: FileManager | null;

    static instance(src: string): FileManager {
        if (!FileManager.#instance) {
            FileManager.#instance = new FileManager(src);
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
            result.push({
                name: entry,
                path: path.join(dir, entry),
                isDir: stats.isDirectory(),
                extension: path.extname(entry),
            });
        });

        return result;
    }
    private constructor(src: string) {
        this.dir = src;
        this.subprocessPackageJson = JSON.parse(
            fs.readFileSync(path.join(this.dir, "package.json"), "utf-8"),
        );
        this.subprocessTsConfig = JSON.parse(
            fs.readFileSync(path.join(this.dir, "tsconfig.json"), "utf-8"),
        );
        this.srcFileStructure = this.resolveDirectoryFiles(src);
        this.main = path.join(this.dir, this.resolveMain());
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
}
