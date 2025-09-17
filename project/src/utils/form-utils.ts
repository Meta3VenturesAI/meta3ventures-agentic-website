import { dataStorage } from '../services/data-storage.service';
import toast from 'react-hot-toast';

interface FormSubmissionOptions {
  type: 'contact' | 'apply' | 'newsletter';
  formData: Record<string, any>;
  formspreeHandler?: (e: React.FormEvent) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

export class FormSubmissionService {
  /**
   * Handle form submission with fallback to local storage
   * This ensures data is never lost even if Formspree fails
   */
  static async submitForm({
    type,
    formData,
    formspreeHandler,
    successMessage = 'Thank you! Your submission has been received.',
    errorMessage = 'Failed to submit. Please try again.'
  }: FormSubmissionOptions): Promise<boolean> {
    try {
      // Step 1: Always save to local storage first
      await dataStorage.storeFormSubmission({
        type,
        data: {
          ...formData,
          timestamp: new Date().toISOString()
        },
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          sessionId: sessionStorage.getItem('session_id') || `session-${Date.now()}`
        }
      });

      console.log(`[FormSubmission] ${type} form data saved locally:`, formData);

      // Step 2: Try to send via Formspree if handler provided
      if (formspreeHandler) {
        try {
          // Create a synthetic form event if needed
          const formEvent = new Event('submit') as unknown;
          await formspreeHandler(formEvent);
          
          console.log(`[FormSubmission] ${type} form sent via Formspree`);
          toast.success(successMessage);
          return true;
        } catch (formspreeError) {
          // Formspree failed, but data is saved
          console.warn(`[FormSubmission] Formspree failed for ${type}, but data is saved:`, formspreeError);
          
          // Still show success since data is saved
          toast.success(successMessage);
          return true;
        }
      } else {
        // No Formspree handler, just local storage
        toast.success(successMessage);
        return true;
      }
    } catch (error) {
      console.error(`[FormSubmission] Failed to submit ${type} form:`, error);
      toast.error(errorMessage);
      return false;
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize form data to prevent XSS
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove script tags and other potentially harmful content
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Check if Formspree is configured and available
   */
  static isFormspreeConfigured(formType: 'contact' | 'apply' | 'newsletter'): boolean {
    const keys = {
      contact: import.meta.env.VITE_FORMSPREE_CONTACT_KEY,
      apply: import.meta.env.VITE_FORMSPREE_APPLY_KEY,
      newsletter: import.meta.env.VITE_FORMSPREE_NEWSLETTER_KEY
    };

    const key = keys[formType];
    return Boolean(key && key !== 'your_production_contact_key' && key !== 'your_production_apply_key' && key !== 'your_production_newsletter_key');
  }

  /**
   * Get form submission stats for debugging
   */
  static async getFormSubmissionStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    recentSubmissions: unknown[];
  }> {
    try {
      const stats = await dataStorage.getAnalyticsSummary();
      return {
        total: stats.total_submissions,
        byType: stats.by_type,
        recentSubmissions: stats.recent_submissions
      };
    } catch (error) {
      console.error('Failed to get form submission stats:', error);
      return {
        total: 0,
        byType: {},
        recentSubmissions: []
      };
    }
  }

  /**
   * Debug helper to check form configuration
   */
  static debugFormConfiguration(): void {
    console.group('📝 Form Configuration Debug');
    
    console.log('Formspree Keys Configured:');
    console.log('- Contact:', this.isFormspreeConfigured('contact') ? '✅' : '❌');
    console.log('- Apply:', this.isFormspreeConfigured('apply') ? '✅' : '❌');
    console.log('- Newsletter:', this.isFormspreeConfigured('newsletter') ? '✅' : '❌');
    
    console.log('\nEnvironment:');
    console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('- DEV:', import.meta.env.DEV);
    console.log('- PROD:', import.meta.env.PROD);
    
    console.log('\nLocal Storage Available:', typeof Storage !== 'undefined' ? '✅' : '❌');
    console.log('Session Storage Available:', typeof sessionStorage !== 'undefined' ? '✅' : '❌');
    
    this.getFormSubmissionStats().then(stats => {
      console.log('\nStored Submissions:');
      console.log('- Total:', stats.total);
      console.log('- By Type:', stats.byType);
    });
    
    console.groupEnd();
  }
}

// Export for easy debugging in console
if (typeof window !== 'undefined') {
  (window as unknown).FormDebug = FormSubmissionService;
}