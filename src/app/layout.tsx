import { Sidebar } from "@/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { isDev } from "@/constants/env";
import { SITE_URL } from "@/constants/site";
import { buildTree } from "@/lib/content/tree/build";
import { cn } from "@/lib/styles/tailwind";
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
  const tree = await buildTree();
  return (
    <>
      <html dir="rtl" lang="ar" suppressHydrationWarning>
        <body
          className={cn(
            ibmPlexSansArabic.className,
            "overflow-y-scroll",
            "overflow-x-hidden",
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
            <SidebarProvider>
              <Sidebar tree={tree} />
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
