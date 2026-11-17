import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Schlankes Docker-Image: nur die getracten Dateien landen in .next/standalone.
  output: "standalone",
  experimental: {
    // Bilder von Förderprojekten dürfen 5 MB groß sein, dazu kommen die übrigen Formularfelder.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
