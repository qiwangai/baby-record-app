import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "宝宝记录",
  description: "适合月嫂和家长使用的宝宝喂养、睡眠、消费与成长记录工具",
  manifest: "/baby-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "宝宝记录",
  },
  icons: {
    icon: "/baby-icon.svg",
    apple: "/baby-icon.svg",
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
