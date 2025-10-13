import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
    build: {
        watch: {},
    },
    resolve: {
        alias: {
            "@main": path.resolve(__dirname, "src/main"),
            "@": path.resolve(__dirname, "src"),
        },
    },
});
