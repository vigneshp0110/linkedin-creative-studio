import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./kb/**"],
    "/api/kb": ["./kb/**"],
    "/api/generate": ["./kb/**"],
  },
};

export default nextConfig;
