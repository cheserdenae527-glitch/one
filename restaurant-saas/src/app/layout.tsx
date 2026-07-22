import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:["latin"],variable:"--font-sans"});

export const metadata: Metadata = {
  title: "饮食AI运营助手",
  description: "让不懂运营的餐饮老板，每天花5分钟就能把大众点评/小红书/抖音做好",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className={"antialiased"}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
