import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            external: ["electron", "ws", "bufferutil", "utf-8-validate"],
        },
        watch: {},
    },
    optimizeDeps: { exclude: ["ws", "bufferutil", "utf-8-validate"] },
});
