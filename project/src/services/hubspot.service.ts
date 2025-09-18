/**
 * HubSpot CRM Integration Service
 * Handles contact creation and deal tracking
 */

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  phone?: string;
  website?: string;
  lifecyclestage?: 'lead' | 'marketingqualifiedlead' | 'salesqualifiedlead' | 'opportunity' | 'customer';
  [key: string]: unknown;
}

interface HubSpotDeal {
  dealname: string;
  amount?: number;
  pipeline?: string;
  dealstage?: string;
  closedate?: string;
  [key: string]: unknown;
}

class HubSpotService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.hubapi.com';
  private isConfigured = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_HUBSPOT_API_KEY;
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.warn('HubSpot API key not configured. Using fallback mode.');
    }
  }

  /**
   * Create or update a contact in HubSpot
   */
  async createContact(contact: HubSpotContact): Promise<any> {
    if (!this.isConfigured) {
      console.log('HubSpot not configured. Storing contact locally:', contact);
      return this.storeLocally('contact', contact);
    }

    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: contact
        }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Contact created in HubSpot:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      return this.storeLocally('contact', contact);
    }
  }

  /**
   * Create a deal in HubSpot
   */
  async createDeal(deal: HubSpotDeal): Promise<any> {
    if (!this.isConfigured) {
      console.log('HubSpot not configured. Storing deal locally:', deal);
      return this.storeLocally('deal', deal);
    }

    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: deal
        }),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Deal created in HubSpot:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      return this.storeLocally('deal', deal);
    }
  }

  /**
   * Submit application form data to HubSpot
   */
  async submitApplication(formData: any): Promise<void> {
    // Create contact
    const contact: HubSpotContact = {
      email: formData.contactEmail,
      firstname: formData.contactName?.split(' ')[0],
      lastname: formData.contactName?.split(' ').slice(1).join(' '),
      company: formData.companyName,
      phone: formData.contactPhone,
      website: formData.website,
      lifecyclestage: 'lead',
      industry: formData.industry,
      company_stage: formData.companyStage,
      technology_focus: formData.technologyFocus,
      linkedin_profile: formData.linkedinProfile,
      role: formData.contactRole,
    };

    const contactResult = await this.createContact(contact);

    // Create deal if contact was created successfully
    if (contactResult && formData.fundingSought) {
      const fundingAmount = this.parseFundingAmount(formData.fundingSought);
      
      const deal: HubSpotDeal = {
        dealname: `${formData.companyName} - Funding Application`,
        amount: fundingAmount,
        pipeline: 'default',
        dealstage: 'appointmentscheduled',
        closedate: this.getCloseDateEstimate(),
        company_description: formData.companyDescription,
        product_description: formData.productDescription,
        competitive_advantage: formData.competitiveAdvantage,
        target_market: formData.targetMarket,
        team_description: formData.teamDescription,
      };

      await this.createDeal(deal);
    }
  }

  /**
   * Submit contact form to HubSpot
   */
  async submitContactForm(formData: unknown): Promise<void> {
    const data = formData as any;
    const contact: HubSpotContact = {
      email: data.email,
      firstname: data.name?.split(' ')[0],
      lastname: data.name?.split(' ').slice(1).join(' '),
      company: data.company,
      phone: data.phone,
      lifecyclestage: 'lead',
      message: data.message,
      contact_type: data.type || 'general',
    };

    await this.createContact(contact);
  }

  /**
   * Submit newsletter subscription to HubSpot
   */
  async submitNewsletter(email: string, interests?: string[]): Promise<void> {
    const contact: HubSpotContact = {
      email,
      lifecyclestage: 'lead',
      newsletter_subscriber: true,
      interests: interests?.join(', '),
    };

    await this.createContact(contact);
  }

  /**
   * Parse funding amount from string
   */
  private parseFundingAmount(funding: string): number {
    const amounts: { [key: string]: number } = {
      'seed': 500000,
      'series-a': 5000000,
      'series-b': 15000000,
      'series-c': 50000000,
      '< $500K': 250000,
      '$500K - $2M': 1250000,
      '$2M - $5M': 3500000,
      '$5M - $10M': 7500000,
      '> $10M': 15000000,
    };

    return amounts[funding.toLowerCase()] || 1000000;
  }

  /**
   * Get estimated close date (3 months from now)
   */
  private getCloseDateEstimate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  }

  /**
   * Fallback: Store data locally when HubSpot is not configured
   */
  private storeLocally(type: string, data: unknown): unknown {
    const key = `hubspot-${type}-${Date.now()}`;
    const stored = {
      id: key,
      type,
      data,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    // Store in localStorage
    const existing = localStorage.getItem('hubspot-queue') || '[]';
    const queue = JSON.parse(existing);
    queue.push(stored);
    localStorage.setItem('hubspot-queue', JSON.stringify(queue));

    console.log(`Stored ${type} locally for later sync:`, key);
    return stored;
  }

  /**
   * Sync locally stored data to HubSpot when API key becomes available
   */
  async syncPendingData(): Promise<void> {
    if (!this.isConfigured) return;

    const existing = localStorage.getItem('hubspot-queue') || '[]';
    const queue = JSON.parse(existing);
    const pending = queue.filter((item: any) => !item.synced);

    for (const item of pending) {
      try {
        if (item.type === 'contact') {
          await this.createContact(item.data);
        } else if (item.type === 'deal') {
          await this.createDeal(item.data);
        }
        item.synced = true;
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
      }
    }

    localStorage.setItem('hubspot-queue', JSON.stringify(queue));
    console.log(`Synced ${pending.length} items to HubSpot`);
  }

  /**
   * Check if HubSpot is properly configured
   */
  isProperlyConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const hubspotService = new HubSpotService();