import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            external: ["electron", "ws", "bufferutil", "utf-8-validate"],
        },
        watch: {},
    },
    optimizeDeps: { exclude: ["ws", "bufferutil", "utf-8-validate"] },
    /* resolve: {
        alias: [
            {
                find: "@",
                replacement: path.resolve(__dirname, "./src"),
            },
        ],
    }, */
});
