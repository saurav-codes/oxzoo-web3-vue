import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// GREETING_* is baked into the bundle at build time via import.meta.env.
export default defineConfig({
  plugins: [vue()],
  envPrefix: ["GREETING_", "VITE_"],
});
