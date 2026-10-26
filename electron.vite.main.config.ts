import { defineConfig } from "electron-vite";
import base from "./electron.vite.config";
export default defineConfig({ main: (base as any).main });
