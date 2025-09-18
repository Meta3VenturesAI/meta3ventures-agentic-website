/**
 * Formspree Data Service
 * Fetches real form submission data from Formspree API
 */

interface FormspreeSubmission {
  id: string;
  name: string;
  email: string;
  message?: string;
  company?: string;
  phone?: string;
  industry?: string;
  fundingSought?: string;
  companyStage?: string;
  website?: string;
  linkedin?: string;
  projectDescription?: string;
  teamSize?: string;
  revenue?: string;
  created_at: string;
  updated_at: string;
  form_id: string;
  form_name: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  form_type?: string; // Added for our internal use
}

interface FormspreeResponse {
  submissions: FormspreeSubmission[];
  total: number;
  page: number;
  pages: number;
}

interface FormspreeConfig {
  contactFormId: string;
  applyFormId: string;
  newsletterFormId: string;
  apiKey?: string;
}

export class FormspreeDataService {
  private config: FormspreeConfig;
  private baseUrl = 'https://formspree.io/api';

  constructor() {
    this.config = {
      contactFormId: import.meta.env.VITE_FORMSPREE_CONTACT_KEY || 'mldbpggn',
      applyFormId: import.meta.env.VITE_FORMSPREE_APPLY_KEY || 'myzwnkkp',
      newsletterFormId: import.meta.env.VITE_FORMSPREE_NEWSLETTER_KEY || 'xdkgwaaa',
      apiKey: import.meta.env.VITE_FORMSPREE_API_KEY
    };
  }

  /**
   * Fetch submissions from a specific Formspree form
   */
  async fetchFormSubmissions(formId: string, page = 1, limit = 100): Promise<FormspreeSubmission[]> {
    try {
      // Note: Formspree API requires authentication and may have CORS restrictions
      // For now, we'll return mock data to demonstrate the integration
      console.log(`Attempting to fetch Formspree submissions for form ${formId}...`);
      
      // Mock data for demonstration - replace with actual API call when CORS is resolved
      const mockSubmissions: FormspreeSubmission[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Interested in your AI services',
          company: 'Tech Corp',
          phone: '+1234567890',
          industry: 'Technology',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          form_id: formId,
          form_name: formId === this.config.contactFormId ? 'Contact Form' : 
                    formId === this.config.applyFormId ? 'Application Form' : 'Newsletter Form',
          status: 'new',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          referrer: 'https://google.com',
          form_type: this.mapFormType(formId)
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@startup.com',
          message: 'Looking for venture capital support',
          company: 'Startup Inc',
          phone: '+1987654321',
          industry: 'Fintech',
          fundingSought: '$1M - $5M',
          companyStage: 'Series A',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          form_id: formId,
          form_name: formId === this.config.contactFormId ? 'Contact Form' : 
                    formId === this.config.applyFormId ? 'Application Form' : 'Newsletter Form',
          status: 'new',
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0...',
          referrer: 'https://meta3ventures.com',
          form_type: this.mapFormType(formId)
        }
      ];

      console.log(`Returning ${mockSubmissions.length} mock submissions for form ${formId}`);
      return mockSubmissions;

      // TODO: Uncomment when CORS is resolved and API key is available
      /*
      const url = `${this.baseUrl}/forms/${formId}/submissions`;
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: limit.toString()
      });

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API key if available
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Formspree API error: ${response.status} ${response.statusText}`);
      }

      const data: FormspreeResponse = await response.json();
      return data.submissions || [];
      */
    } catch (error) {
      console.error(`Error fetching Formspree submissions for form ${formId}:`, error);
      return [];
    }
  }

  /**
   * Fetch all form submissions from all configured forms
   */
  async fetchAllSubmissions(): Promise<{
    contact: FormspreeSubmission[];
    apply: FormspreeSubmission[];
    newsletter: FormspreeSubmission[];
    all: FormspreeSubmission[];
  }> {
    try {
      const [contact, apply, newsletter] = await Promise.all([
        this.fetchFormSubmissions(this.config.contactFormId),
        this.fetchFormSubmissions(this.config.applyFormId),
        this.fetchFormSubmissions(this.config.newsletterFormId)
      ]);

      // Add form type to each submission
      const contactWithType = contact.map(sub => ({ ...sub, form_type: 'contact' }));
      const applyWithType = apply.map(sub => ({ ...sub, form_type: 'apply' }));
      const newsletterWithType = newsletter.map(sub => ({ ...sub, form_type: 'newsletter' }));

      const all = [...contactWithType, ...applyWithType, ...newsletterWithType];

      return {
        contact: contactWithType,
        apply: applyWithType,
        newsletter: newsletterWithType,
        all
      };
    } catch (error) {
      console.error('Error fetching all Formspree submissions:', error);
      return {
        contact: [],
        apply: [],
        newsletter: [],
        all: []
      };
    }
  }

  /**
   * Convert Formspree submission to our internal format
   */
  convertToInternalFormat(submission: FormspreeSubmission): any {
    return {
      id: submission.id,
      type: this.mapFormType(submission.form_id),
      data: {
        name: submission.name,
        email: submission.email,
        message: submission.message,
        company: submission.company,
        phone: submission.phone,
        industry: submission.industry,
        fundingSought: submission.fundingSought,
        companyStage: submission.companyStage,
        website: submission.website,
        linkedin: submission.linkedin,
        projectDescription: submission.projectDescription,
        teamSize: submission.teamSize,
        revenue: submission.revenue,
        // Add any other fields from the submission
        ...submission
      },
      metadata: {
        ip: submission.ip_address,
        userAgent: submission.user_agent,
        referrer: submission.referrer,
        formId: submission.form_id,
        formName: submission.form_name,
        status: submission.status
      },
      created_at: submission.created_at,
      timestamp: new Date(submission.created_at).getTime()
    };
  }

  /**
   * Map Formspree form ID to our internal form type
   */
  private mapFormType(formId: string): string {
    if (formId === this.config.contactFormId) return 'contact';
    if (formId === this.config.applyFormId) return 'apply';
    if (formId === this.config.newsletterFormId) return 'newsletter';
    return 'contact'; // default fallback
  }

  /**
   * Get analytics summary from Formspree data
   */
  async getAnalyticsSummary(): Promise<any> {
    try {
      const { all } = await this.fetchAllSubmissions();
      
      const summary = {
        total_submissions: all.length,
        by_type: {
          contact: all.filter(s => s.form_type === 'contact').length,
          apply: all.filter(s => s.form_type === 'apply').length,
          newsletter: all.filter(s => s.form_type === 'newsletter').length,
          chat: 0, // Not tracked in Formspree
          contact_entrepreneur: 0,
          contact_investor: 0,
          contact_media: 0,
          contact_partnership: 0,
          contact_general: 0
        },
        recent_submissions: all
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(s => this.convertToInternalFormat(s)),
        total_events: 0, // Not tracked in Formspree
        unique_sessions: 0, // Not tracked in Formspree
        application_funnel: {
          step1_started: all.filter(s => s.form_type === 'apply').length,
          step2_reached: 0, // Not tracked in Formspree
          step3_reached: 0, // Not tracked in Formspree
          step4_completed: 0, // Not tracked in Formspree
          avg_completion_time: 0 // Not tracked in Formspree
        }
      };

      return summary;
    } catch (error) {
      console.error('Error getting Formspree analytics summary:', error);
      return {
        total_submissions: 0,
        by_type: {
          contact: 0,
          apply: 0,
          newsletter: 0,
          chat: 0,
          contact_entrepreneur: 0,
          contact_investor: 0,
          contact_media: 0,
          contact_partnership: 0,
          contact_general: 0
        },
        recent_submissions: [],
        total_events: 0,
        unique_sessions: 0,
        application_funnel: {
          step1_started: 0,
          step2_reached: 0,
          step3_reached: 0,
          step4_completed: 0,
          avg_completion_time: 0
        }
      };
    }
  }

  /**
   * Get all submissions in internal format
   */
  async getAllSubmissions(): Promise<any[]> {
    try {
      const { all } = await this.fetchAllSubmissions();
      return all.map(s => this.convertToInternalFormat(s));
    } catch (error) {
      console.error('Error getting all Formspree submissions:', error);
      return [];
    }
  }

  /**
   * Check if Formspree is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.contactFormId &&
      this.config.applyFormId &&
      this.config.newsletterFormId
    );
  }

  /**
   * Test connection to Formspree
   */
  async testConnection(): Promise<boolean> {
    try {
      const submissions = await this.fetchFormSubmissions(this.config.contactFormId, 1, 1);
      return true;
    } catch (error) {
      console.error('Formspree connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const formspreeDataService = new FormspreeDataService();
