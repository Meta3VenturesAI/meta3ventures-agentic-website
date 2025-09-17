// Google Analytics and monitoring service

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private measurementId: string | null = null;
  private debug = false;

  private constructor() {
    this.debug = import.meta.env.DEV;
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (this.initialized) return;

    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') {
      if (this.debug) {
        console.log('[Analytics] Google Analytics not configured');
      }
      return;
    }

    try {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script1);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId, {
        page_path: window.location.pathname,
        debug_mode: this.debug
      });

      this.initialized = true;
      
      if (this.debug) {
        console.log('[Analytics] Google Analytics initialized with ID:', this.measurementId);
      }
    } catch (error) {
      console.error('[Analytics] Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path?: string, title?: string): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('Page view:', { path, title });
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      page_location: window.location.href
    });
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('Event:', event);
      return;
    }

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formType: string, success: boolean = true): void {
    this.trackEvent({
      action: 'form_submit',
      category: 'engagement',
      label: formType,
      value: success ? 1 : 0,
      custom_parameters: {
        form_type: formType,
        success: success
      }
    });
  }

  /**
   * Track AI advisor interaction
   */
  trackAIAdvisorInteraction(advisorType: string, action: string): void {
    this.trackEvent({
      action: 'ai_advisor_interaction',
      category: 'ai_features',
      label: advisorType,
      custom_parameters: {
        advisor_type: advisorType,
        interaction: action
      }
    });
  }

  /**
   * Track user timing (performance)
   */
  trackTiming(category: string, variable: string, value: number, label?: string): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('Timing:', { category, variable, value, label });
      return;
    }

    window.gtag('event', 'timing_complete', {
      event_category: category,
      name: variable,
      value: Math.round(value),
      event_label: label
    });
  }

  /**
   * Track exception
   */
  trackException(description: string, fatal: boolean = false): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('Exception:', { description, fatal });
      return;
    }

    window.gtag('event', 'exception', {
      description: description,
      fatal: fatal
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('User properties:', properties);
      return;
    }

    window.gtag('set', 'user_properties', properties);
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType: string, value?: number, currency?: string): void {
    this.trackEvent({
      action: 'conversion',
      category: 'conversions',
      label: conversionType,
      value: value,
      custom_parameters: {
        currency: currency || 'USD',
        conversion_type: conversionType
      }
    });
  }

  /**
   * Track social interaction
   */
  trackSocialInteraction(network: string, action: string, target?: string): void {
    this.trackEvent({
      action: 'social_interaction',
      category: 'social',
      label: network,
      custom_parameters: {
        social_network: network,
        social_action: action,
        social_target: target
      }
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(percentage: number): void {
    this.trackEvent({
      action: 'scroll',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultsCount?: number): void {
    if (!this.initialized || !window.gtag) {
      this.logDebug('Search:', { searchTerm, resultsCount });
      return;
    }

    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  /**
   * Track video interaction
   */
  trackVideoInteraction(action: 'play' | 'pause' | 'complete', videoTitle: string, currentTime?: number): void {
    this.trackEvent({
      action: `video_${action}`,
      category: 'video',
      label: videoTitle,
      value: currentTime,
      custom_parameters: {
        video_title: videoTitle,
        video_current_time: currentTime
      }
    });
  }

  /**
   * Track file download
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent({
      action: 'download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType
      }
    });
  }

  /**
   * Track outbound link click
   */
  trackOutboundLink(url: string): void {
    this.trackEvent({
      action: 'click',
      category: 'outbound',
      label: url,
      custom_parameters: {
        link_url: url,
        link_domain: new URL(url).hostname
      }
    });
  }

  /**
   * Debug logging
   */
  private logDebug(action: string, data: unknown): void {
    if (this.debug) {
      console.log(`[Analytics] ${action}`, data);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.initialized && Boolean(window.gtag);
  }
}

export const analytics = AnalyticsService.getInstance();

// Auto-initialize on import if in production
if (import.meta.env.PROD) {
  analytics.initialize();
}

// Export for use in components
export default analytics;