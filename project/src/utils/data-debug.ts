// Data storage debugging utilities

export class DataDebugger {
  // Check if data is being stored in localStorage
  static checkLocalStorage() {
    console.log('=== LocalStorage Data Check ===');
    
    const keys = [
      'form_submissions',
      'form_submissions_backup',
      'analytics_events',
      'csv_export_queue',
      'chat_conversations'
    ];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${key}: ${parsed.length} items`);
          if (parsed.length > 0) {
            console.log(`   Latest entry:`, parsed[parsed.length - 1]);
          }
        } catch (e) {
          console.log(`❌ ${key}: Invalid JSON`);
        }
      } else {
        console.log(`⚠️ ${key}: No data`);
      }
    });
    
    console.log('================================');
  }
  
  // Test form submission storage
  static async testFormSubmission(type: 'contact' | 'apply' | 'newsletter' = 'contact') {
    console.log(`Testing ${type} form submission...`);
    
    const testData = {
      contact: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      },
      apply: {
        companyName: 'Test Company',
        founderName: 'Test Founder',
        email: 'founder@test.com',
        website: 'https://test.com',
        pitch: 'Test pitch'
      },
      newsletter: {
        email: 'newsletter@test.com'
      }
    };
    
    try {
      const { dataStorage } = await import('../services/data-storage.service');
      
      await dataStorage.storeFormSubmission({
        type,
        data: testData[type],
        metadata: {
          userAgent: 'Test Agent',
          referrer: 'Test Referrer',
          sessionId: 'test-session-' + Date.now()
        }
      });
      
      console.log('✅ Test submission stored successfully');
      this.checkLocalStorage();
    } catch (error) {
      console.error('❌ Test submission failed:', error);
    }
  }
  
  // Get summary of all stored data
  static async getDataSummary() {
    const { dataStorage } = await import('../services/data-storage.service');
    const summary = await dataStorage.getAnalyticsSummary();
    
    console.log('=== Data Storage Summary ===');
    console.log('Total Submissions:', summary.total_submissions);
    console.log('By Type:', summary.by_type);
    console.log('Unique Sessions:', summary.unique_sessions);
    console.log('Recent Submissions:', summary.recent_submissions.length);
    
    return summary;
  }
  
  // Clear test data only
  static clearTestData() {
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
  }
  
  // Export data for inspection
  static exportData() {
    const data: any = {};
    
    ['form_submissions', 'analytics_events', 'chat_conversations'].forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          data[key] = JSON.parse(stored);
        } catch (e) {
          data[key] = null;
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta3-data-export-${Date.now()}.json`;
    a.click();
    
    console.log('Data exported to file');
  }
  
  // Monitor form submissions in real-time
  static startMonitoring() {
    console.log('🔍 Starting data monitoring...');
    
    // Override localStorage.setItem to log changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      if (key.includes('form_submissions') || key.includes('analytics')) {
        console.log(`📝 Data stored in ${key}`);
        try {
          const data = JSON.parse(value);
          if (Array.isArray(data) && data.length > 0) {
            console.log('   Latest item:', data[data.length - 1]);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
      return originalSetItem.apply(localStorage, [key, value]);
    };
    
    console.log('Monitoring active. Submit a form to see data being stored.');
  }
  
  // Test Supabase connection
  static async testSupabaseConnection() {
    console.log('Testing Supabase connection...');
    
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Try to select from form_submissions
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase error:', error.message);
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('⚠️ Tables not created. Run migration: 003_form_submissions_tables.sql');
        }
      } else {
        console.log('✅ Supabase connected successfully');
        console.log('   Found', data?.length || 0, 'submissions in database');
      }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
    }
  }
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).DataDebugger = DataDebugger;
  console.log('💡 DataDebugger available. Try these commands:');
  console.log('   DataDebugger.checkLocalStorage()');
  console.log('   DataDebugger.testFormSubmission("contact")');
  console.log('   DataDebugger.getDataSummary()');
  console.log('   DataDebugger.startMonitoring()');
  console.log('   DataDebugger.testSupabaseConnection()');
}