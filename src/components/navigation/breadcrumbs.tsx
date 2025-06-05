import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { deslugify } from 'reversible-arabic-slugifier';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="مسار التنقل"
      className={`text-muted-foreground flex items-center space-x-1 text-sm ${className}`}
      dir="rtl"
    >
      <ol className="flex items-center space-x-1 space-x-reverse">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronLeft className="text-muted-foreground/60 mx-2 h-4 w-4" />
            )}
            {item.isCurrentPage ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function generateBreadcrumbsFromPath(
  urlPath: string,
  currentPageTitle?: string
): BreadcrumbItem[] {
  const segments = urlPath.split('/').filter(Boolean);

  if (segments[0] === 'learn') {
    segments.shift();
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'الرئيسية',
      href: '/',
    },
  ];

  if (segments.length >= 3) {
    const [subject, author, book, ...pageSegments] = segments.map(deslugify);

    breadcrumbs.push({
      label: subject.replace(/_/g, ' '),
    });

    breadcrumbs.push({
      label: author.replace(/_/g, ' '),
    });

    const bookHref = `/learn/${segments.slice(0, 3).join('/')}`;
    breadcrumbs.push({
      label: book.replace(/_/g, ' '),
      href: pageSegments.length === 0 ? undefined : bookHref,
      isCurrentPage: pageSegments.length === 0,
    });

    if (pageSegments.length > 0) {
      breadcrumbs.push({
        label:
          currentPageTitle ||
          pageSegments[pageSegments.length - 1].replace(/_/g, ' '),
        isCurrentPage: true,
      });
    }
  }

  return breadcrumbs;
}
