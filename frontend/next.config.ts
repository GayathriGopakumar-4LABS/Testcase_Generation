import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the multi-stage Docker build (copies only what's needed to run)
  output: "standalone",

  async rewrites() {
    // INTERNAL_API_URL is set to the Docker-network service name when running in
    // a container (e.g. http://backend:8000).  Falls back to localhost for local dev.
    const internalApi =
      process.env.INTERNAL_API_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${internalApi}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
