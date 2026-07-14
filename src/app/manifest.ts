import type { MetadataRoute } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "宝宝记录",
    short_name: "宝宝记录",
    description: "宝宝喂养、睡眠、消费与成长记录工具",
    start_url: `${basePath}/baby`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff7f5",
    theme_color: "#fff7f5",
    categories: ["health", "lifestyle", "productivity"],
    icons: [
      {
        src: `${basePath}/baby-icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "记录喂养",
        short_name: "喂养",
        url: `${basePath}/baby?tab=feed`,
        icons: [{ src: `${basePath}/baby-icon.svg`, sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "记录睡眠",
        short_name: "睡眠",
        url: `${basePath}/baby?tab=sleep`,
        icons: [{ src: `${basePath}/baby-icon.svg`, sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
