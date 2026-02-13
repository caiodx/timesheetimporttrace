import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const isWebBuild = process.env.VITE_BUILD_TARGET === "web";

export default defineConfig({
  root: "./src/renderer",
  base: isWebBuild ? "/" : "./",
  plugins: [react()],
  build: {
    outDir: isWebBuild ? "../../dist/web" : "../../dist/renderer",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});

