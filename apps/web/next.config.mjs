import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone", // ✅ Enables standalone mode
  experimental: {
    outputFileTracingRoot: join(__dirname, "../.."), 
    // ✅ Trace dependencies from monorepo root for standalone
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

export default nextConfig;
