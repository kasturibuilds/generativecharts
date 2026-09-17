import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.CHARTKIT_STATIC_EXPORT === "1" ? { output: "export" as const, distDir: "out", trailingSlash: true } : {}),
  transpilePackages: ["generative-charts"],
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
