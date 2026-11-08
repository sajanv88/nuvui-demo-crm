import "@nuvui/react/styles.css";
import "@nuvui/table/styles.css";
import "@nuvui/charts/styles.css";
import "./globals.css";
import "web/components/shell/shell.css";
import "web/components/dashboard/dashboard.css";
import "web/components/contacts/contacts.css";

import { Toaster } from "@nuvui/react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "web/components/shell/theme-script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// On Vercel, absolute URLs in metadata (Open Graph and the like) use the
// production domain; locally they fall back to localhost.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NuvUI CRM",
    template: "%s · NuvUI CRM",
  },
  description:
    "A contacts dashboard built with Next.js and nuvui: figures, charts and a searchable list.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="system"
      // Lets Next turn smooth scrolling off while it changes routes.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // The theme toggle sets data-theme from the reader's saved choice.
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
