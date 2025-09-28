import { defineConfig } from "vite";
import path from "path";

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
