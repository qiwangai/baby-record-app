import type { Metadata, Viewport } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "宝宝记录",
  description: "适合月嫂和家长使用的宝宝喂养、睡眠、消费与成长记录工具",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "宝宝记录",
  },
  icons: {
    icon: [
      { url: `${basePath}/baby-icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/baby-icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fff7f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function BabyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
