import { DocsSidebar } from "@/components/docs-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { isDev } from "@/constants/env";
import { SITE_URL } from "@/constants/site";
import { cn } from "@/lib/utils";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(ibmPlexSansArabic.variable, {
          "debug-screens": isDev,
        })}
      >
        <body className={`antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <DocsSidebar />
              <SidebarInset className="px-4 py-6 md:px-8">
                <header className="mb-4 flex items-center">
                  <SidebarTrigger className="mr-4" />
                  <h1 className="text-2xl font-bold">Documentation</h1>
                </header>
                <main>{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
