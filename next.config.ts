import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Schlankes Docker-Image: nur die getracten Dateien landen in .next/standalone.
  output: "standalone",
};

export default nextConfig;
