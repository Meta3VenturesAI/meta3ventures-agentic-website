// Production readiness audit and validation
interface AuditResult {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
}

interface ProductionAudit {
  overall: 'ready' | 'needs-attention' | 'not-ready';
  score: number;
  results: AuditResult[];
  recommendations: string[];
}

class ProductionAuditor {
  private results: AuditResult[] = [];

  public async runFullAudit(): Promise<ProductionAudit> {
    this.results = [];

    // Environment validation
    this.auditEnvironment();
    
    // Performance checks
    this.auditPerformance();
    
    // Security validation
    this.auditSecurity();
    
    // SEO checks
    this.auditSEO();
    
    // Accessibility validation
    this.auditAccessibility();
    
    // PWA compliance
    this.auditPWA();
    
    // Image optimization
    this.auditImages();
    
    // Form functionality
    this.auditForms();

    return this.generateReport();
  }

  private auditEnvironment(): void {
    // Check required environment variables
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_FORMSPREE_CONTACT_KEY',
      'VITE_FORMSPREE_APPLY_KEY',
      'VITE_FORMSPREE_NEWSLETTER_KEY'
    ];

    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length === 0) {
      this.results.push({
        category: 'Environment',
        status: 'pass',
        message: 'All required environment variables are configured'
      });
    } else {
      this.results.push({
        category: 'Environment',
        status: 'fail',
        message: `Missing environment variables: ${missing.join(', ')}`,
        details: 'These variables are required for full functionality'
      });
    }

    // Validate URLs
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        new URL(import.meta.env.VITE_SUPABASE_URL);
        this.results.push({
          category: 'Environment',
          status: 'pass',
          message: 'Supabase URL is valid'
        });
      }
    } catch {
      this.results.push({
        category: 'Environment',
        status: 'fail',
        message: 'Invalid Supabase URL format'
      });
    }
  }

  private auditPerformance(): void {
    // Check if performance API is available
    if ('performance' in window) {
      this.results.push({
        category: 'Performance',
        status: 'pass',
        message: 'Performance monitoring is available'
      });
    } else {
      this.results.push({
        category: 'Performance',
        status: 'warning',
        message: 'Performance API not available in this browser'
      });
    }

    // Check for service worker
    if ('serviceWorker' in navigator) {
      this.results.push({
        category: 'Performance',
        status: 'pass',
        message: 'Service Worker support available'
      });
    } else {
      this.results.push({
        category: 'Performance',
        status: 'warning',
        message: 'Service Worker not supported'
      });
    }

    // Check for lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      this.results.push({
        category: 'Performance',
        status: 'pass',
        message: 'Native lazy loading supported'
      });
    } else {
      this.results.push({
        category: 'Performance',
        status: 'warning',
        message: 'Native lazy loading not supported, using polyfill'
      });
    }
  }

  private auditSecurity(): void {
    // Check HTTPS
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      this.results.push({
        category: 'Security',
        status: 'pass',
        message: 'Site is served over HTTPS'
      });
    } else {
      this.results.push({
        category: 'Security',
        status: 'fail',
        message: 'Site must be served over HTTPS in production'
      });
    }

    // Check for CSP
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    if (metaTags.length > 0) {
      this.results.push({
        category: 'Security',
        status: 'pass',
        message: 'Content Security Policy is configured'
      });
    } else {
      this.results.push({
        category: 'Security',
        status: 'warning',
        message: 'Content Security Policy should be configured via headers'
      });
    }
  }

  private auditSEO(): void {
    // Check meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = metaDescription?.getAttribute('content');
    if (metaDescription && content && content.length > 0) {
      this.results.push({
        category: 'SEO',
        status: 'pass',
        message: 'Meta description is present'
      });
    } else {
      this.results.push({
        category: 'SEO',
        status: 'fail',
        message: 'Meta description is missing'
      });
    }

    // Check title
    if (document.title && document.title.length > 0) {
      this.results.push({
        category: 'SEO',
        status: 'pass',
        message: 'Page title is present'
      });
    } else {
      this.results.push({
        category: 'SEO',
        status: 'fail',
        message: 'Page title is missing'
      });
    }

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      this.results.push({
        category: 'SEO',
        status: 'pass',
        message: 'Canonical URL is set'
      });
    } else {
      this.results.push({
        category: 'SEO',
        status: 'warning',
        message: 'Canonical URL should be set'
      });
    }

    // Check Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle && ogDescription && ogImage) {
      this.results.push({
        category: 'SEO',
        status: 'pass',
        message: 'Open Graph tags are configured'
      });
    } else {
      this.results.push({
        category: 'SEO',
        status: 'warning',
        message: 'Some Open Graph tags are missing'
      });
    }
  }

  private auditAccessibility(): void {
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    if (imagesWithoutAlt.length === 0) {
      this.results.push({
        category: 'Accessibility',
        status: 'pass',
        message: 'All images have alt text'
      });
    } else {
      this.results.push({
        category: 'Accessibility',
        status: 'warning',
        message: `${imagesWithoutAlt.length} images missing alt text`
      });
    }

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      this.results.push({
        category: 'Accessibility',
        status: 'pass',
        message: 'Heading structure is present'
      });
    } else {
      this.results.push({
        category: 'Accessibility',
        status: 'warning',
        message: 'No heading structure found'
      });
    }

    // Check for skip links
    const skipLink = document.querySelector('a[href="#main"], a[href="#content"]');
    if (skipLink) {
      this.results.push({
        category: 'Accessibility',
        status: 'pass',
        message: 'Skip navigation link is present'
      });
    } else {
      this.results.push({
        category: 'Accessibility',
        status: 'warning',
        message: 'Skip navigation link should be added'
      });
    }
  }

  private auditPWA(): void {
    // Check for manifest
    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) {
      this.results.push({
        category: 'PWA',
        status: 'pass',
        message: 'Web app manifest is present'
      });
    } else {
      this.results.push({
        category: 'PWA',
        status: 'fail',
        message: 'Web app manifest is missing'
      });
    }

    // Check for service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          this.results.push({
            category: 'PWA',
            status: 'pass',
            message: 'Service worker is registered'
          });
        } else {
          this.results.push({
            category: 'PWA',
            status: 'warning',
            message: 'Service worker is not registered'
          });
        }
      });
    }

    // Check for theme color
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      this.results.push({
        category: 'PWA',
        status: 'pass',
        message: 'Theme color is set'
      });
    } else {
      this.results.push({
        category: 'PWA',
        status: 'warning',
        message: 'Theme color should be set'
      });
    }
  }

  private auditImages(): void {
    const images = document.querySelectorAll('img');
    let optimizedCount = 0;
    const totalCount = images.length;

    images.forEach(img => {
      const src = img.src;
      if (src.includes('auto=compress') || src.includes('q_auto') || src.includes('w_')) {
        optimizedCount++;
      }
    });

    if (totalCount === 0) {
      this.results.push({
        category: 'Images',
        status: 'pass',
        message: 'No images to optimize'
      });
    } else if (optimizedCount / totalCount > 0.8) {
      this.results.push({
        category: 'Images',
        status: 'pass',
        message: `${optimizedCount}/${totalCount} images are optimized`
      });
    } else {
      this.results.push({
        category: 'Images',
        status: 'warning',
        message: `Only ${optimizedCount}/${totalCount} images are optimized`,
        details: 'Consider using optimized image URLs with compression parameters'
      });
    }
  }

  private auditForms(): void {
    const forms = document.querySelectorAll('form');
    
    if (forms.length === 0) {
      this.results.push({
        category: 'Forms',
        status: 'warning',
        message: 'No forms found on current page'
      });
      return;
    }

    let validForms = 0;
    forms.forEach(form => {
      const action = form.action;
      const method = form.method;
      
      if (action && (action.includes('formspree.io') || method === 'post')) {
        validForms++;
      }
    });

    if (validForms === forms.length) {
      this.results.push({
        category: 'Forms',
        status: 'pass',
        message: `All ${forms.length} forms are properly configured`
      });
    } else {
      this.results.push({
        category: 'Forms',
        status: 'warning',
        message: `${validForms}/${forms.length} forms are properly configured`
      });
    }
  }

  private generateReport(): ProductionAudit {
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    
    const totalChecks = this.results.length;
    const score = Math.round((passCount / totalChecks) * 100);
    
    let overall: 'ready' | 'needs-attention' | 'not-ready';
    if (failCount === 0 && warningCount <= 2) {
      overall = 'ready';
    } else if (failCount <= 2) {
      overall = 'needs-attention';
    } else {
      overall = 'not-ready';
    }

    const recommendations: string[] = [];
    
    if (failCount > 0) {
      recommendations.push('Fix all critical issues before deploying to production');
    }
    
    if (warningCount > 3) {
      recommendations.push('Address warnings to improve user experience and SEO');
    }
    
    if (score < 80) {
      recommendations.push('Consider additional optimizations to reach production standards');
    }

    recommendations.push('Test all forms and functionality before going live');
    recommendations.push('Monitor performance and user experience after deployment');
    recommendations.push('Set up analytics and error tracking for production monitoring');

    return {
      overall,
      score,
      results: this.results,
      recommendations
    };
  }
}

export const productionAuditor = new ProductionAuditor();
export default productionAuditor;

// Quick audit function for development
export const runQuickAudit = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    const audit = await productionAuditor.runFullAudit();
    console.group('🔍 Production Readiness Audit');
    console.log(`Overall Status: ${audit.overall.toUpperCase()}`);
    console.log(`Score: ${audit.score}/100`);
    
    audit.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} [${result.category}] ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    });
    
    if (audit.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      audit.recommendations.forEach(rec => console.log(`• ${rec}`));
    }
    
    console.groupEnd();
  }
};