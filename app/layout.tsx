import type { Metadata } from "next";
import { Inter, Manrope, Geist } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const metadataBase = process.env.APP_URL
  ? new URL(process.env.APP_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  title: "Insight Hub",
  description: "Legal case management and analytics platform",
  metadataBase,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        manrope.variable,
        inter.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full font-body">
        <div className="flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
