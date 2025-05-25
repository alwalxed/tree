import { isDev } from "@/config/env";
import { SITE_URL } from "@/config/site";
import { cn } from "@/lib/styles/tailwind-utils";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { ibmPlexSansArabic } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Documentation",
    default: "Documentation",
  },
  description: "Documentation site built with Next.js",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html
        dir="rtl"
        lang="ar"
        className={cn(ibmPlexSansArabic.variable)}
        suppressHydrationWarning
      >
        <body
          className={cn(
            "overflow-x-hidden overflow-y-scroll",
            "font-ibmPlexSansArabic antialiased",
            {
              "debug-screens": isDev,
            },
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
