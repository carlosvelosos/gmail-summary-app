import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' https://accounts.google.com 'unsafe-inline' 'unsafe-eval'; frame-src https://accounts.google.com; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
