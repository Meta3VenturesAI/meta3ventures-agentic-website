import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://meta3ventures.com/og-image.jpg',
  url = 'https://meta3ventures.com',
  type = 'website',
  schema,
  keywords = [],
  author = 'Meta3Ventures',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  locale = 'en_US',
  alternateLocales = []
}) => {
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Meta3Ventures",
    "url": "https://meta3ventures.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://meta3ventures.com/og-image.jpg",
      "width": 1200,
      "height": 630
    },
    "description": "Meta3Ventures empowers organizations with cutting-edge AI solutions, strategic consulting, and venture studio support.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Derech Menachem Begin 121",
      "addressLocality": "Tel Aviv-Yafo",
      "addressCountry": "Israel"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+972528444500",
      "contactType": "customer service",
      "email": "liron@meta3ventures.com",
      "availableLanguage": ["English", "Hebrew"]
    },
    "sameAs": [
      "https://twitter.com/meta3ventures",
      "https://linkedin.com/company/meta3ventures",
      "https://medium.com/@meta3ventures"
    ],
    "foundingDate": "2020",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "industry": "Venture Capital",
    "keywords": "AI, artificial intelligence, venture capital, blockchain, digital transformation, startup accelerator, tech innovation"
  };

  // Optimize title for SEO
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  
  // Optimize description for SEO
  const optimizedDescription = description.length > 160 ? `${description.substring(0, 157)}...` : description;

  // Generate keywords string
  const keywordsString = [
    ...keywords,
    'AI', 'artificial intelligence', 'venture capital', 'blockchain', 
    'digital transformation', 'startup accelerator', 'tech innovation',
    'Meta3Ventures', 'venture studio', 'strategic consulting'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      
      {/* Language and Locale */}
      <html lang={locale.split('_')[0]} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={optimizedTitle} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Meta3Ventures" />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@meta3ventures" />
      <meta name="twitter:creator" content="@meta3ventures" />
      <meta name="twitter:title" content={optimizedTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={optimizedTitle} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      
      {/* Performance and Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.pexels.com" />
      <link rel="preconnect" href="https://res.cloudinary.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://formspree.io" />
      <link rel="dns-prefetch" href="https://api.supabase.co" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
      
      {/* Additional structured data for breadcrumbs if applicable */}
      {url !== 'https://meta3ventures.com' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://meta3ventures.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": title,
                "item": url
              }
            ]
          })}
        </script>
      )}
      
      {/* Website structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Meta3Ventures",
          "url": "https://meta3ventures.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://meta3ventures.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;