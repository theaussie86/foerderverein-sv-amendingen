import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/unterschreiben/", "/admin"],
    },
    sitemap: "https://foerderverein-sv-amendingen.de/sitemap.xml",
  };
}
