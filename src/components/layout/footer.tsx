import { convertNumerals } from '@/lib/common/convert-numerals';
import Link from 'next/link';

const year = new Date().getFullYear();
export function Footer() {
  return (
    <footer className="border-border/40 w-full max-w-2xl" dir="rtl">
      <div className="">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Main content section */}
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-right">
            <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              <p className="font-medium">مشروع غير ربحي مفتوح المصدر</p>
              <p className="text-xs opacity-80">
                جميع الحقوق محفوظة لمؤلفي الكتب
              </p>
            </div>
          </div>

          {/* Links section */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="https://github.com/alwalxed/tree"
                className="text-muted-foreground hover:text-foreground group flex items-center gap-2 transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>جتهب</span>
                <svg
                  className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>

              <Link
                href="https://alwalxed.com"
                className="text-muted-foreground hover:text-foreground group flex items-center gap-2 transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>المطور</span>
                <svg
                  className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>

            {/* Year and additional info */}
            <div className="text-muted-foreground/60 text-center text-xs md:text-right">
              <p>
                © {convertNumerals({ value: year, direction: 'en-to-ar' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
