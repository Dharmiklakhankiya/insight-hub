import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import AppThemeProvider from "@/components/app-theme-provider";

import "./globals.css";

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
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="emotion-insertion-point" content="" />
        {/* Material Symbols Outlined icon font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-body">
        <AppThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
