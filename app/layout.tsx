import type { Metadata } from "next";
import { IBM_Plex_Sans, Manrope } from "next/font/google";

import AppThemeProvider from "@/components/app-theme-provider";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${manrope.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppThemeProvider>
          <div className="flex min-h-full flex-col">{children}</div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
