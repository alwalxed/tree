import { isDev } from '@/config/env';
import { SITE_URL } from '@/config/site';
import { getHomeOGImagePath } from '@/lib/common/og';
import { cn } from '@/lib/common/tailwind-utils';
import { ThemeProvider } from '@/providers/theme-provider';
import type { Metadata } from 'next';
import { ibmPlexSansArabic } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | شجرة',
    default: 'شجرة',
  },
  description: 'موقع مفتوح المصدر لتصفح الكتب مشجرة وملخصة',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'شجرة: لتصفح الكتب',
    description: 'موقع مفتوح المصدر لتصفح الكتب مشجرة وملخصة',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'شجرة',
    images: [
      {
        url: getHomeOGImagePath(),
        width: 1200,
        height: 630,
        alt: 'شجرة: لتصفح الكتب',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شجرة: لتصفح الكتب',
    description: 'موقع مفتوح المصدر لتصفح الكتب مشجرة وملخصة',
    images: [getHomeOGImagePath()],
  },
  other: {
    google: 'notranslate',
  },
};

export default async function RootLayout({
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
            'overflow-x-hidden overflow-y-scroll',
            'font-ibmPlexSansArabic antialiased',
            {
              'debug-screens': isDev,
            }
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
