import fs from "node:fs";
import path from "path";
import { PackageJson, TsConfigJson } from "type-fest";

export class FileManager {
    // directory of subprocess, where code is located
    dir: string;

    // main file which is executable, i.g. "main.js"
    main: string;
    subprocessPackageJson: PackageJson;
    subprocessTsConfig: TsConfigJson;

    static #instance: FileManager;

    static instance(src: string): FileManager {
        if (!FileManager.#instance) {
            FileManager.#instance = new FileManager(src);
        }

        return FileManager.#instance;
    }

    private constructor(src: string) {
        this.dir = src;

        this.main = "test";

        this.subprocessPackageJson = JSON.parse(
            fs.readFileSync(path.join(this.dir, "package.json"), "utf-8"),
        );
        this.subprocessTsConfig = JSON.parse(
            fs.readFileSync(path.join(this.dir, "tsconfig.json"), "utf-8"),
        );

        console.log(this.subprocessPackageJson);
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
