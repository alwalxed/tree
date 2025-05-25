import { DevDebuggers } from "@/components/debug";
import { Sidebar } from "@/components/layout/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { isDev } from "@/config/env";
import { SITE_URL } from "@/config/site";
import { buildContentSummaryTree } from "@/lib/content/core/tree-builder";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const summaryTree = await buildContentSummaryTree();
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
            "overflow-y-scroll overflow-x-hidden",
            "font-ibmPlexSansArabic antialiased",
            {
              "debug-screens": isDev,
            }
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <DevDebuggers summaryTree={summaryTree} />
            <SidebarProvider>
              <Sidebar summaryTree={summaryTree} />
              <SidebarInset className="px-4 py-6 md:px-8">
                <header className="mb-4 flex items-center">
                  <SidebarTrigger />
                </header>
                <main className="pb-16">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
