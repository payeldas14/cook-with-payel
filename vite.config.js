import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages project sites, set in CI or locally, e.g. VITE_BASE=/cook-with-payel/
const base = (process.env.VITE_BASE || "/").replace(/\/?$/, "/");

export default defineConfig({
  plugins: [react()],
  base
});
