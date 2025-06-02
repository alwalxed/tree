import { SITE_URL } from '@/config/site';

type StructuredDataProps = {
  type: 'book' | 'article' | 'website';
  title: string;
  description: string;
  author?: string;
  bookTitle?: string;
  subject?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  language?: string;
};

export function StructuredData({
  type,
  title,
  description,
  author,
  bookTitle,
  subject,
  url,
  datePublished,
  dateModified,
  language = 'ar',
}: StructuredDataProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let schema: Record<string, any>;

  switch (type) {
    case 'book':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: title,
        description,
        inLanguage: language,
        url,
        publisher: {
          '@type': 'Organization',
          name: 'شجرة',
          url: SITE_URL,
        },
        ...(author && {
          author: {
            '@type': 'Person',
            name: author,
          },
        }),
        ...(subject && { genre: subject }),
      };
      break;

    case 'article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        inLanguage: language,
        url,
        publisher: {
          '@type': 'Organization',
          name: 'شجرة',
          url: SITE_URL,
        },
        ...(author && {
          author: {
            '@type': 'Person',
            name: author,
          },
        }),
        ...(datePublished && { datePublished }),
        ...(dateModified && { dateModified }),
        ...(bookTitle && {
          isPartOf: {
            '@type': 'Book',
            name: bookTitle,
          },
        }),
      };
      break;

    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: title,
        description,
        inLanguage: language,
        url,
        publisher: {
          '@type': 'Organization',
          name: 'شجرة',
          url: SITE_URL,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    default:
      throw new Error(`Unsupported structured data type: ${type}`);
  }

  return schema ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ) : null;
}
