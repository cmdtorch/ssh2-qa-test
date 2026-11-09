import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

// Hosts other than localhost that open the dev server (E2E runs reach it by the Docker host address).
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  agentRules: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*/` },
      { source: "/media/:path*", destination: `${backendUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
