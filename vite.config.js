import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoBase = "/Lilyn/";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "serve" ? "/" : repoBase,
}));
