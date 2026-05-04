import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', '@anthropic-ai/sdk'],
  outputFileTracingIncludes: {
    "/": ["./kb/**"],
    "/api/kb": ["./kb/**"],
    "/api/generate": ["./kb/**"],
  },
};

export default nextConfig;
