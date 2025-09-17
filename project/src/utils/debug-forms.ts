// Debug utilities for form submissions
import { dataStorage } from '../services/data-storage.service';
import { FormSubmissionService } from './form-utils';

export class FormDebugger {
  /**
   * Test form submission directly
   */
  static async testFormSubmission(type: 'contact' | 'apply' | 'newsletter') {
    console.log(`\n🧪 Testing ${type} form submission...`);
    
    const testData = {
      contact: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message'
      },
      apply: {
        companyName: 'Test Company',
        founderName: 'Test Founder',
        email: 'founder@test.com',
        website: 'https://test.com',
        pitch: 'Test pitch description'
      },
      newsletter: {
        email: 'newsletter@test.com'
      }
    };

    try {
      // Test local storage
      console.log('1️⃣ Testing local storage...');
      await dataStorage.storeFormSubmission({
        type,
        data: testData[type],
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          sessionId: 'test-session-' + Date.now()
        }
      });
      console.log('✅ Local storage successful');

      // Check if data was stored
      const stored = localStorage.getItem('form_submissions');
      if (stored) {
        const data = JSON.parse(stored);
        console.log(`   Stored ${data.length} total submissions`);
      }

      // Test Formspree configuration
      console.log('2️⃣ Checking Formspree configuration...');
      const isConfigured = FormSubmissionService.isFormspreeConfigured(type);
      console.log(`   Formspree configured: ${isConfigured ? '✅' : '❌'}`);
      
      if (!isConfigured) {
        console.log('   ⚠️ Formspree is not properly configured for', type);
        console.log('   Forms will only save to local storage');
      }

      return true;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  }

  /**
   * Check all form configurations
   */
  static checkAllForms() {
    console.log('\n📋 Checking all form configurations...\n');

    // Check environment
    console.log('Environment Configuration:');
    console.log('-------------------------');
    console.log('NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('Mode:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.log('Prod:', import.meta.env.PROD);

    // Check Formspree keys
    console.log('\nFormspree Configuration:');
    console.log('------------------------');
    const contactKey = import.meta.env.VITE_FORMSPREE_CONTACT_KEY;
    const applyKey = import.meta.env.VITE_FORMSPREE_APPLY_KEY;
    const newsletterKey = import.meta.env.VITE_FORMSPREE_NEWSLETTER_KEY;

    console.log('Contact Key:', contactKey ? `${contactKey.substring(0, 4)}...` : '❌ Not set');
    console.log('Apply Key:', applyKey ? `${applyKey.substring(0, 4)}...` : '❌ Not set');
    console.log('Newsletter Key:', newsletterKey ? `${newsletterKey.substring(0, 4)}...` : '❌ Not set');

    // Check Supabase
    console.log('\nSupabase Configuration:');
    console.log('----------------------');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ Not set');
    console.log('Anon Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ Not set');

    // Check local storage
    console.log('\nLocal Storage Status:');
    console.log('--------------------');
    try {
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      const backups = JSON.parse(localStorage.getItem('form_submissions_backup') || '[]');
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      
      console.log('Form Submissions:', submissions.length);
      console.log('Backup Submissions:', backups.length);
      console.log('Analytics Events:', events.length);
      
      // Show breakdown by type
      if (submissions.length > 0) {
        const byType = submissions.reduce((acc: any, sub: any) => {
          acc[sub.type] = (acc[sub.type] || 0) + 1;
          return acc;
        }, {});
        console.log('Submissions by type:', byType);
      }
    } catch (error) {
      console.error('Error reading local storage:', error);
    }

    console.log('\n✨ Use FormDebugger.testFormSubmission("contact") to test a specific form');
  }

  /**
   * Clear all test data
   */
  static clearTestData() {
    console.log('🧹 Clearing test data...');
    
    const keys = ['form_submissions', 'form_submissions_backup', 'analytics_events'];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const filtered = parsed.filter((item: any) => 
            !item.data?.email?.includes('test@') &&
            !item.data?.email?.includes('example.com')
          );
          localStorage.setItem(key, JSON.stringify(filtered));
          console.log(`Cleaned ${key}: removed ${parsed.length - filtered.length} test items`);
        } catch (e) {
          console.error(`Error cleaning ${key}:`, e);
        }
      }
    });
    
    console.log('✅ Test data cleared');
  }

  /**
   * View recent submissions
   */
  static viewRecentSubmissions(limit: number = 5) {
    console.log(`\n📊 Recent Form Submissions (last ${limit}):\n`);
    
    try {
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      
      if (submissions.length === 0) {
        console.log('No submissions found');
        return;
      }
      
      const recent = submissions.slice(-limit).reverse();
      
      recent.forEach((sub: any, index: number) => {
        console.log(`${index + 1}. ${sub.type.toUpperCase()} Form`);
        console.log(`   Time: ${new Date(sub.timestamp).toLocaleString()}`);
        console.log(`   Email: ${sub.data.email || 'N/A'}`);
        if (sub.type === 'contact') {
          console.log(`   Subject: ${sub.data.subject || 'N/A'}`);
        } else if (sub.type === 'apply') {
          console.log(`   Company: ${sub.data.companyName || 'N/A'}`);
        }
        console.log('');
      });
    } catch (error) {
      console.error('Error viewing submissions:', error);
    }
  }

  /**
   * Simulate form submission with network issues
   */
  static async simulateNetworkFailure() {
    console.log('🔌 Simulating network failure for form submission...');
    
    // Temporarily disable network (mock)
    const originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new Error('Network failure simulated'));
    
    try {
      await this.testFormSubmission('contact');
      console.log('✅ Form should still save locally despite network failure');
    } finally {
      // Restore fetch
      window.fetch = originalFetch;
      console.log('🔌 Network restored');
    }
  }
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).FormDebugger = FormDebugger;
  
  // Run initial check
  console.log('🔧 FormDebugger loaded. Available commands:');
  console.log('   FormDebugger.checkAllForms()');
  console.log('   FormDebugger.testFormSubmission("contact")');
  console.log('   FormDebugger.viewRecentSubmissions()');
  console.log('   FormDebugger.clearTestData()');
  console.log('   FormDebugger.simulateNetworkFailure()');
}