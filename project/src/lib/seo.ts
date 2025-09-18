// SEO optimization utilities

export const seoUtils = {
  // Generate structured data for different page types
  generateStructuredData: (type: string, data: unknown) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
      ...(data as any)
    };

    return JSON.stringify(baseSchema);
  },

  // Generate Open Graph meta tags
  generateOGTags: (title: string, description: string, image?: string, url?: string) => {
    return {
      'og:title': title,
      'og:description': description,
      'og:image': image || 'https://meta3ventures.com/og-image.jpg',
      'og:url': url || 'https://meta3ventures.com',
      'og:type': 'website',
      'og:site_name': 'Meta3Ventures'
    };
  },

  // Generate Twitter Card meta tags
  generateTwitterTags: (title: string, description: string, image?: string) => {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image || 'https://meta3ventures.com/og-image.jpg',
      'twitter:site': '@meta3ventures'
    };
  },

  // Validate and optimize meta descriptions
  optimizeMetaDescription: (description: string): string => {
    const maxLength = 160;
    if (description.length > maxLength) {
      return description.substring(0, maxLength - 3) + '...';
    }
    return description;
  },

  // Generate canonical URLs
  generateCanonicalUrl: (path: string): string => {
    const baseUrl = 'https://meta3ventures.com';
    return `${baseUrl}${path}`;
  }
};

// Sitemap generation utility
export const generateSitemap = () => {
  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/services', changefreq: 'monthly', priority: '0.8' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' },
    { url: '/portfolio', changefreq: 'weekly', priority: '0.8' },
    { url: '/partners', changefreq: 'monthly', priority: '0.8' },
    { url: '/blog', changefreq: 'daily', priority: '0.9' },
    { url: '/apply', changefreq: 'monthly', priority: '1.0' },
    { url: '/contact', changefreq: 'monthly', priority: '0.8' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://meta3ventures.com${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};