import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "宝宝记录",
  description: "宝宝喂养、睡眠、消费与成长记录工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
