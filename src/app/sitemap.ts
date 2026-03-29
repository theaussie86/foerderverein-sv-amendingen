import type { MetadataRoute } from "next";

const BASE_URL = "https://foerderverein-sv-amendingen.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/ueber-uns",
    "/vorstand",
    "/projekte",
    "/satzung",
    "/sponsoren",
    "/spenden",
    "/mitglied-werden",
    "/kontakt",
    "/impressum",
    "/datenschutz",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/spenden" ? 0.9 : 0.7,
  }));
}
