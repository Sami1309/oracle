import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Turbopack to treat this folder as the workspace root to avoid
  // climbing to /Users/sam where another package-lock.json lives.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
