import { supabase } from '../lib/supabase';

export type FormType = 'contact' | 'apply' | 'newsletter' | 'chat' | 
  'contact_entrepreneur' | 'contact_investor' | 'contact_media' | 
  'contact_partnership' | 'contact_general';

interface FormSubmission {
  id?: string;
  type: FormType;
  data: Record<string, any>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
  };
  created_at?: string;
}

interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  created_at?: string;
}

export class DataStorageService {
  // Store form submissions both locally and in Supabase
  async storeFormSubmission(submission: FormSubmission): Promise<void> {
    try {
      // Store in localStorage as backup
      this.storeLocally('form_submissions', submission);
      
      // Store in Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('form_submissions')
          .insert({
            ...submission,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Supabase storage error:', error);
          // Fall back to local storage only
        }
      }
      
      // Send to analytics
      this.trackFormSubmission(submission);
      
      // Export to CSV if needed
      this.exportToCSV(submission);
      
    } catch (error) {
      console.error('Error storing form submission:', error);
      // Ensure data is at least stored locally
      this.storeLocally('form_submissions_backup', submission);
    }
  }
  
  // Store data locally with structure
  private storeLocally(key: string, data: unknown): void {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const dataToStore = typeof data === 'object' && data !== null ? data as Record<string, any> : {};
    stored.push({
      ...dataToStore,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });
    
    // Keep only last 1000 entries to prevent storage overflow
    if (stored.length > 1000) {
      stored.splice(0, stored.length - 1000);
    }
    
    localStorage.setItem(key, JSON.stringify(stored));
  }
  
  // Track form submission for analytics
  private trackFormSubmission(submission: FormSubmission): void {
    // Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submission', {
        event_category: 'engagement',
        event_label: submission.type,
        value: 1
      });
    }
    
    // Custom analytics
    const event: AnalyticsEvent = {
      event_type: `form_${submission.type}`,
      event_data: {
        form_type: submission.type,
        fields_count: Object.keys(submission.data).length
      },
      session_id: this.getSessionId(),
      created_at: new Date().toISOString()
    };
    
    this.storeAnalyticsEvent(event);
  }
  
  // Store analytics events
  // Public method to track custom events
  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      event_type: event.event_type || 'custom_event',
      event_data: event.event_data || {},
      session_id: event.session_id || this.getSessionId(),
      user_id: event.user_id,
      created_at: event.created_at || new Date().toISOString()
    };
    
    await this.storeAnalyticsEvent(fullEvent);
  }
  
  async storeAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store locally
      this.storeLocally('analytics_events', event);
      
      // Store in Supabase if available
      if (supabase) {
        await supabase.from('analytics_events').insert(event);
      }
    } catch (error) {
      console.error('Error storing analytics event:', error);
    }
  }
  
  // Export data to CSV format (stored locally)
  private exportToCSV(data: unknown): void {
    const csvData = JSON.parse(localStorage.getItem('csv_export_queue') || '[]');
    csvData.push({
      ...(typeof data === 'object' && data !== null ? data : {}),
      exported_at: new Date().toISOString()
    });
    localStorage.setItem('csv_export_queue', JSON.stringify(csvData));
  }
  
  // Get all stored form submissions
  async getAllSubmissions(type?: string): Promise<FormSubmission[]> {
    try {
      // Try to get from Supabase first
      if (supabase) {
        const query = supabase.from('form_submissions').select('*');
        
        if (type) {
          query.eq('type', type);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (!error && data) {
          return data;
        }
      }
      
      // Fall back to localStorage
      const stored = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      return type ? stored.filter((s: FormSubmission) => s.type === type) : stored;
      
    } catch (error) {
      console.error('Error retrieving submissions:', error);
      return [];
    }
  }
  
  // Get submissions by specific form type
  async getSubmissionsByType(type: FormType): Promise<any[]> {
    const stored = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    return stored.filter((s: any) => s.type === type);
  }
  
  // Get analytics summary
  async getAnalyticsSummary(): Promise<any> {
    const submissions = await this.getAllSubmissions();
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    
    return {
      total_submissions: submissions.length,
      by_type: {
        contact: submissions.filter(s => s.type === 'contact').length,
        apply: submissions.filter(s => s.type === 'apply').length,
        newsletter: submissions.filter(s => s.type === 'newsletter').length,
        chat: submissions.filter(s => s.type === 'chat').length
      },
      recent_submissions: submissions.slice(0, 10),
      total_events: events.length,
      unique_sessions: new Set(events.map((e: AnalyticsEvent) => e.session_id)).size
    };
  }
  
  // Download data as CSV
  downloadCSV(type?: string): void {
    const data = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    const filtered = type ? data.filter((d: FormSubmission) => d.type === type) : data;
    
    if (filtered.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    // Convert to CSV format
    const headers = ['Date', 'Type', 'Name', 'Email', 'Company', 'Message', 'Additional Data'];
    const rows = filtered.map((item: any) => [
      item.timestamp || item.created_at,
      item.type,
      item.data?.name || item.data?.founderName || '',
      item.data?.email || '',
      item.data?.company || item.data?.companyName || '',
      item.data?.message || item.data?.pitch || '',
      JSON.stringify(item.data || {})
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `meta3_${type || 'all'}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Clear old data (data retention policy)
  async clearOldData(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Clear from localStorage
    const keys = ['form_submissions', 'analytics_events', 'csv_export_queue'];
    
    keys.forEach(key => {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = data.filter((item: any) => {
        const itemDate = new Date(item.timestamp || item.created_at);
        return itemDate > cutoffDate;
      });
      localStorage.setItem(key, JSON.stringify(filtered));
    });
    
    // Clear from Supabase if available
    if (supabase) {
      await supabase
        .from('form_submissions')
        .delete()
        .lt('created_at', cutoffDate.toISOString());
    }
  }
  
  // Helper functions
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
  
  // Get structured data for reporting
  async getStructuredData(): Promise<any> {
    const submissions = await this.getAllSubmissions();
    
    return {
      contacts: submissions
        .filter(s => s.type === 'contact')
        .map(s => ({
          name: s.data.name,
          email: s.data.email,
          message: s.data.message,
          date: s.created_at
        })),
      
      applications: submissions
        .filter(s => s.type === 'apply')
        .map(s => ({
          company: s.data.companyName,
          founder: s.data.founderName,
          email: s.data.email,
          website: s.data.website,
          pitch: s.data.pitch,
          stage: s.data.stage,
          date: s.created_at
        })),
      
      newsletter: submissions
        .filter(s => s.type === 'newsletter')
        .map(s => ({
          email: s.data.email,
          name: s.data.name,
          preferences: s.data.preferences,
          date: s.created_at
        })),
      
      chat_conversations: submissions
        .filter(s => s.type === 'chat')
        .map(s => ({
          messages: s.data.messages,
          context: s.data.context,
          duration: s.data.duration,
          date: s.created_at
        }))
    };
  }
}

// Export singleton instance
export const dataStorage = new DataStorageService();

// Create Supabase tables if they don't exist
export const createDataTables = `
-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id UUID,
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_form_submissions_type ON form_submissions(type);
CREATE INDEX idx_form_submissions_created ON form_submissions(created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
`;