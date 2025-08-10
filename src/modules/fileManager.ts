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
    fileStructure: Entry[];

    // main file which is executable, i.g. "main.js"
    main: string;
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
        this.fileStructure = this.resolveDirectoryFiles(src);
        console.log(this.fileStructure);
        this.main = path.join(src, "dist/main.js");
        this.subprocessPackageJson = JSON.parse(
            fs.readFileSync(path.join(this.dir, "package.json"), "utf-8"),
        );
        this.subprocessTsConfig = JSON.parse(
            fs.readFileSync(path.join(this.dir, "tsconfig.json"), "utf-8"),
        );
    }

    getPathToMain(): string {
        return this.main;
    }

    resolveMain(): string | undefined {
        // TODO add another conditions
        if (this.subprocessPackageJson?.main != undefined) {
            this.main = this.subprocessPackageJson?.main;
            console.log(`FileManager: ${this.main}`);
            return this.main;
        }

        if (this.subprocessTsConfig?.compilerOptions?.outDir) {
            console.log("FileManager: outdir");
            this.main = path.join(
                this.dir,
                this.subprocessTsConfig?.compilerOptions?.outDir,
                "main.js",
            );

            return this.main;
        }

        //TODO add another checks
        return undefined;
    }
}
