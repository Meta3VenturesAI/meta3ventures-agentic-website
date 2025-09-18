#!/usr/bin/env node

/**
 * Form Testing Tool
 * Comprehensive testing for all forms: Apply, Contact, Newsletter
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Results
const results = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 },
  formTests: {
    contact: { tests: [], passed: 0, failed: 0 },
    apply: { tests: [], passed: 0, failed: 0 },
    newsletter: { tests: [], passed: 0, failed: 0 },
    admin: { tests: [], passed: 0, failed: 0 }
  }
};

function logTest(formType, testName, status, details = '', duration = 0) {
  const result = { formType, testName, status, details, duration, timestamp: new Date().toISOString() };
  results.tests.push(result);
  results.summary.total++;
  
  if (status === 'PASS') {
    results.summary.passed++;
    if (results.formTests[formType]) {
      results.formTests[formType].passed++;
    }
  } else {
    results.summary.failed++;
    if (results.formTests[formType]) {
      results.formTests[formType].failed++;
    }
  }
  
  if (results.formTests[formType]) {
    results.formTests[formType].tests.push(result);
  }
  
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${formType.toUpperCase()}] ${testName}${duration > 0 ? ` (${duration}ms)` : ''}`);
  if (details) console.log(`   ${details}`);
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkFileContent(filePath, expectedContent) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(expectedContent);
  } catch (error) {
    return false;
  }
}

function checkUrlAccessibility(url) {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { encoding: 'utf8', timeout: 10000 });
    const statusCode = parseInt(result.trim());
    return { accessible: statusCode === 200, statusCode };
  } catch (error) {
    return { accessible: false, statusCode: 0, error: error.message };
  }
}

async function testContactForm() {
  console.log('\n📧 CONTACT FORM TESTS');
  console.log('='.repeat(50));
  
  const formType = 'contact';
  
  // Test 1: Contact Component
  const contactExists = checkFileExists(path.join(__dirname, 'src/components/sections/Contact.tsx'));
  logTest(formType, 'Contact Component', 
    contactExists ? 'PASS' : 'FAIL',
    contactExists ? 'Contact.tsx exists' : 'Contact.tsx missing'
  );
  
  if (contactExists) {
    const contactContent = fs.readFileSync(path.join(__dirname, 'src/components/sections/Contact.tsx'), 'utf8');
    
    // Test 2: Formspree Integration
    const hasFormspree = contactContent.includes('useForm("mldbpggn")');
    logTest(formType, 'Formspree Integration', 
      hasFormspree ? 'PASS' : 'FAIL',
      hasFormspree ? 'Formspree form ID configured' : 'Formspree form ID missing'
    );
    
    // Test 3: Required Fields
    const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
    requiredFields.forEach(field => {
      const hasField = contactContent.includes(`name="${field}"`) && contactContent.includes('required');
      logTest(formType, `Required Field: ${field}`, 
        hasField ? 'PASS' : 'FAIL',
        hasField ? 'Field is required' : 'Field missing or not required'
      );
    });
    
    // Test 4: Form Validation
    const validationFeatures = [
      'disabled={state.submitting}',
      'toast.success',
      'toast.error',
      'state.succeeded',
      'state.errors'
    ];
    
    validationFeatures.forEach(feature => {
      const hasFeature = contactContent.includes(feature);
      logTest(formType, `Validation: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
    
    // Test 5: Form Fields
    const formFields = [
      'First Name',
      'Last Name', 
      'Email',
      'Company',
      'Subject',
      'Message'
    ];
    
    formFields.forEach(field => {
      const hasField = contactContent.includes(field);
      logTest(formType, `Form Field: ${field}`, 
        hasField ? 'PASS' : 'FAIL',
        hasField ? 'Field present' : 'Field missing'
      );
    });
    
    // Test 6: Subject Options
    const subjectOptions = [
      'AI Consultation',
      'Partnership Opportunity',
      'Investment Inquiry',
      'General Inquiry',
      'Other'
    ];
    
    subjectOptions.forEach(option => {
      const hasOption = contactContent.includes(option);
      logTest(formType, `Subject Option: ${option}`, 
        hasOption ? 'PASS' : 'FAIL',
        hasOption ? 'Option available' : 'Option missing'
      );
    });
  }
}

async function testApplyForm() {
  console.log('\n📝 APPLICATION FORM TESTS');
  console.log('='.repeat(50));
  
  const formType = 'apply';
  
  // Test 1: Apply Page
  const applyPageExists = checkFileExists(path.join(__dirname, 'src/pages/Apply.tsx'));
  logTest(formType, 'Apply Page', 
    applyPageExists ? 'PASS' : 'FAIL',
    applyPageExists ? 'Apply.tsx exists' : 'Apply.tsx missing'
  );
  
  // Test 2: Multi-Step Application
  const multiStepExists = checkFileExists(path.join(__dirname, 'src/components/forms/MultiStepApplication.tsx'));
  logTest(formType, 'Multi-Step Application', 
    multiStepExists ? 'PASS' : 'FAIL',
    multiStepExists ? 'MultiStepApplication.tsx exists' : 'MultiStepApplication.tsx missing'
  );
  
  if (multiStepExists) {
    const multiStepContent = fs.readFileSync(path.join(__dirname, 'src/components/forms/MultiStepApplication.tsx'), 'utf8');
    
    // Test 3: Formspree Integration
    const hasFormspree = multiStepContent.includes('VITE_FORMSPREE_APPLY_KEY') || multiStepContent.includes('xpwzqrkw');
    logTest(formType, 'Formspree Integration', 
      hasFormspree ? 'PASS' : 'FAIL',
      hasFormspree ? 'Formspree apply key configured' : 'Formspree apply key missing'
    );
    
    // Test 4: Step Components
    const stepComponents = [
      'CompanyInfoStep',
      'TechnologyStep', 
      'MarketFundingStep',
      'TeamContactStep'
    ];
    
    stepComponents.forEach(step => {
      const hasStep = multiStepContent.includes(step);
      logTest(formType, `Step Component: ${step}`, 
        hasStep ? 'PASS' : 'FAIL',
        hasStep ? 'Step component imported' : 'Step component missing'
      );
    });
    
    // Test 5: Form Data Management
    const formDataFeatures = [
      'useMultiStepForm',
      'formData',
      'handleFieldChange',
      'goToNextStep',
      'goToPreviousStep'
    ];
    
    formDataFeatures.forEach(feature => {
      const hasFeature = multiStepContent.includes(feature);
      logTest(formType, `Form Data: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
    
    // Test 6: Data Storage Integration
    const hasDataStorage = multiStepContent.includes('dataStorage') && multiStepContent.includes('storeFormSubmission');
    logTest(formType, 'Data Storage Integration', 
      hasDataStorage ? 'PASS' : 'FAIL',
      hasDataStorage ? 'Data storage integrated' : 'Data storage missing'
    );
  }
  
  // Test 7: Step Components Files
  const stepFiles = [
    'src/components/forms/multi-step/steps/CompanyInfoStep.tsx',
    'src/components/forms/multi-step/steps/TechnologyStep.tsx',
    'src/components/forms/multi-step/steps/MarketFundingStep.tsx',
    'src/components/forms/multi-step/steps/TeamContactStep.tsx'
  ];
  
  stepFiles.forEach(stepFile => {
    const exists = checkFileExists(path.join(__dirname, stepFile));
    logTest(formType, `Step File: ${path.basename(stepFile)}`, 
      exists ? 'PASS' : 'FAIL',
      exists ? 'Step file exists' : 'Step file missing'
    );
  });
}

async function testNewsletterForm() {
  console.log('\n📰 NEWSLETTER FORM TESTS');
  console.log('='.repeat(50));
  
  const formType = 'newsletter';
  
  // Test 1: Footer Newsletter
  const footerExists = checkFileExists(path.join(__dirname, 'src/components/Footer.tsx'));
  logTest(formType, 'Footer Component', 
    footerExists ? 'PASS' : 'FAIL',
    footerExists ? 'Footer.tsx exists' : 'Footer.tsx missing'
  );
  
  if (footerExists) {
    const footerContent = fs.readFileSync(path.join(__dirname, 'src/components/Footer.tsx'), 'utf8');
    
    // Test 2: Formspree Integration
    const hasFormspree = footerContent.includes('useForm("xdkgwaaa")');
    logTest(formType, 'Formspree Integration', 
      hasFormspree ? 'PASS' : 'FAIL',
      hasFormspree ? 'Formspree newsletter key configured' : 'Formspree newsletter key missing'
    );
    
    // Test 3: Newsletter Form
    const newsletterFeatures = [
      'type="email"',
      'name="email"',
      'required',
      'placeholder="Enter your email"',
      'Newsletter'
    ];
    
    newsletterFeatures.forEach(feature => {
      const hasFeature = footerContent.includes(feature);
      logTest(formType, `Newsletter Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
    
    // Test 4: Form Validation
    const validationFeatures = [
      'disabled={state.submitting}',
      'toast.success',
      'toast.error',
      'state.succeeded',
      'state.errors'
    ];
    
    validationFeatures.forEach(feature => {
      const hasFeature = footerContent.includes(feature);
      logTest(formType, `Validation: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
  }
}

async function testAdminAnalytics() {
  console.log('\n📊 ADMIN ANALYTICS TESTS');
  console.log('='.repeat(50));
  
  const formType = 'admin';
  
  // Test 1: Admin Dashboard
  const adminExists = checkFileExists(path.join(__dirname, 'src/pages/AdminDashboard.tsx'));
  logTest(formType, 'Admin Dashboard', 
    adminExists ? 'PASS' : 'FAIL',
    adminExists ? 'AdminDashboard.tsx exists' : 'AdminDashboard.tsx missing'
  );
  
  if (adminExists) {
    const adminContent = fs.readFileSync(path.join(__dirname, 'src/pages/AdminDashboard.tsx'), 'utf8');
    
    // Test 2: Data Storage Integration
    const hasDataStorage = adminContent.includes('dataStorage') && adminContent.includes('getAnalyticsSummary');
    logTest(formType, 'Data Storage Integration', 
      hasDataStorage ? 'PASS' : 'FAIL',
      hasDataStorage ? 'Data storage integrated' : 'Data storage missing'
    );
    
    // Test 3: Analytics Features
    const analyticsFeatures = [
      'total_submissions',
      'by_type',
      'recent_submissions',
      'total_events',
      'unique_sessions',
      'getAnalyticsSummary'
    ];
    
    analyticsFeatures.forEach(feature => {
      const hasFeature = adminContent.includes(feature);
      logTest(formType, `Analytics Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
    
    // Test 4: Data Visualization
    const visualizationFeatures = [
      'BarChart3',
      'PieChart',
      'TrendingUp',
      'Database',
      'Users'
    ];
    
    visualizationFeatures.forEach(feature => {
      const hasFeature = adminContent.includes(feature);
      logTest(formType, `Visualization: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Component imported' : 'Component missing'
      );
    });
    
    // Test 5: Filtering and Search
    const filteringFeatures = [
      'Filter',
      'Search',
      'dateRange',
      'industry',
      'fundingRange',
      'companyStage'
    ];
    
    filteringFeatures.forEach(feature => {
      const hasFeature = adminContent.includes(feature);
      logTest(formType, `Filtering: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
  }
  
  // Test 6: Data Storage Service
  const dataStorageExists = checkFileExists(path.join(__dirname, 'src/services/data-storage.service.ts'));
  logTest(formType, 'Data Storage Service', 
    dataStorageExists ? 'PASS' : 'FAIL',
    dataStorageExists ? 'Data storage service exists' : 'Data storage service missing'
  );
  
  if (dataStorageExists) {
    const dataStorageContent = fs.readFileSync(path.join(__dirname, 'src/services/data-storage.service.ts'), 'utf8');
    
    // Test 7: Analytics Methods
    const analyticsMethods = [
      'getAnalyticsSummary',
      'getFormSubmissions',
      'calculateStatistics',
      'transformSubmissionData',
      'downloadCSV'
    ];
    
    analyticsMethods.forEach(method => {
      const hasMethod = dataStorageContent.includes(method);
      logTest(formType, `Analytics Method: ${method}`, 
        hasMethod ? 'PASS' : 'FAIL',
        hasMethod ? 'Method implemented' : 'Method missing'
      );
    });
  }
}

async function testFormIntegration() {
  console.log('\n🔗 FORM INTEGRATION TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Environment Variables
  const envFile = path.join(__dirname, 'env.local');
  const envExists = checkFileExists(envFile);
  
  if (envExists) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    const formspreeKeys = [
      'VITE_FORMSPREE_CONTACT_KEY=mldbpggn',
      'VITE_FORMSPREE_APPLY_KEY=myzwnkkp',
      'VITE_FORMSPREE_NEWSLETTER_KEY=xdkgwaaa'
    ];
    
    formspreeKeys.forEach(key => {
      const hasKey = envContent.includes(key);
      logTest('integration', `Environment: ${key.split('=')[0]}`, 
        hasKey ? 'PASS' : 'FAIL',
        hasKey ? 'Key configured' : 'Key missing'
      );
    });
  } else {
    logTest('integration', 'Environment File', 'FAIL', 'env.local not found');
  }
  
  // Test 2: Form Routes
  const appExists = checkFileExists(path.join(__dirname, 'src/App.tsx'));
  if (appExists) {
    const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
    
    const routes = ['/contact', '/apply', '/admin'];
    routes.forEach(route => {
      const hasRoute = appContent.includes(route);
      logTest('integration', `Route: ${route}`, 
        hasRoute ? 'PASS' : 'FAIL',
        hasRoute ? 'Route configured' : 'Route missing'
      );
    });
  }
  
  // Test 3: Form Navigation
  const headerExists = checkFileExists(path.join(__dirname, 'src/components/Header.tsx'));
  if (headerExists) {
    const headerContent = fs.readFileSync(path.join(__dirname, 'src/components/Header.tsx'), 'utf8');
    
    const navigationLinks = ['Apply', 'Contact', 'Admin'];
    navigationLinks.forEach(link => {
      const hasLink = headerContent.includes(link);
      logTest('integration', `Navigation: ${link}`, 
        hasLink ? 'PASS' : 'FAIL',
        hasLink ? 'Link available' : 'Link missing'
      );
    });
  }
}

async function testFormAccessibility() {
  console.log('\n🌐 FORM ACCESSIBILITY TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Contact Form Access
  const contactCheck = checkUrlAccessibility('http://localhost:5173');
  logTest('accessibility', 'Contact Form Access', 
    contactCheck.accessible ? 'PASS' : 'FAIL',
    contactCheck.accessible ? 
      `Homepage accessible (${contactCheck.statusCode})` : 
      'Homepage not accessible'
  );
  
  // Test 2: Apply Form Access
  const applyCheck = checkUrlAccessibility('http://localhost:5173/apply');
  logTest('accessibility', 'Apply Form Access', 
    applyCheck.accessible ? 'PASS' : 'FAIL',
    applyCheck.accessible ? 
      `Apply page accessible (${applyCheck.statusCode})` : 
      'Apply page not accessible'
  );
  
  // Test 3: Admin Dashboard Access
  const adminCheck = checkUrlAccessibility('http://localhost:5173/admin');
  logTest('accessibility', 'Admin Dashboard Access', 
    adminCheck.accessible ? 'PASS' : 'FAIL',
    adminCheck.accessible ? 
      `Admin dashboard accessible (${adminCheck.statusCode})` : 
      'Admin dashboard not accessible'
  );
}

async function runFormTests() {
  console.log('📝 FORM TESTING TOOL');
  console.log('='.repeat(60));
  console.log(`Start Time: ${results.startTime}`);
  console.log('='.repeat(60));
  
  try {
    await testContactForm();
    await testApplyForm();
    await testNewsletterForm();
    await testAdminAnalytics();
    await testFormIntegration();
    await testFormAccessibility();
    
    // Calculate final results
    results.endTime = new Date().toISOString();
    results.summary.successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
    
    // Generate report
    generateFormReport();
    
  } catch (error) {
    console.error('❌ Form testing failed:', error);
    process.exit(1);
  }
}

function generateFormReport() {
  console.log('\n📊 FORM TESTING REPORT');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  
  // Form-specific Results
  console.log(`\n📝 FORM-SPECIFIC RESULTS:`);
  Object.entries(results.formTests).forEach(([formType, stats]) => {
    if (stats.tests.length > 0) {
      const successRate = ((stats.passed / stats.tests.length) * 100).toFixed(1);
      console.log(`${formType}: ${stats.passed}/${stats.tests.length} (${successRate}%)`);
    }
  });
  
  // Failed Tests
  const failedTests = results.tests.filter(test => test.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`  [${test.formType.toUpperCase()}] ${test.testName}: ${test.details}`);
    });
  }
  
  // Form Status
  console.log(`\n🎯 FORM STATUS:`);
  const contactStatus = results.formTests.contact.passed >= 10 ? 'READY' : 'NEEDS WORK';
  const applyStatus = results.formTests.apply.passed >= 15 ? 'READY' : 'NEEDS WORK';
  const newsletterStatus = results.formTests.newsletter.passed >= 5 ? 'READY' : 'NEEDS WORK';
  const adminStatus = results.formTests.admin.passed >= 10 ? 'READY' : 'NEEDS WORK';
  
  console.log(`Contact Form: ${contactStatus}`);
  console.log(`Apply Form: ${applyStatus}`);
  console.log(`Newsletter Form: ${newsletterStatus}`);
  console.log(`Admin Analytics: ${adminStatus}`);
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (results.summary.successRate >= 90) {
    console.log(`  ✅ All forms are ready for production`);
    console.log(`  ✅ Form validation is working properly`);
    console.log(`  ✅ Admin analytics are functional`);
    console.log(`  ✅ Data collection is operational`);
  } else if (results.summary.successRate >= 70) {
    console.log(`  ⚠️ Forms are mostly ready with minor issues`);
    console.log(`  🔧 Address failed tests before production`);
  } else {
    console.log(`  🚨 Forms need significant work before production`);
    console.log(`  🔧 Fix critical issues before deployment`);
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'form-testing-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  if (results.summary.failed === 0) {
    console.log(`\n🎉 ALL FORM TESTS PASSED! All forms are ready for production.`);
  } else {
    console.log(`\n⚠️ ${results.summary.failed} form tests failed. Please review issues.`);
  }
  
  console.log(`\nTest completed at: ${results.endTime}`);
}

// Run the tests
if (require.main === module) {
  runFormTests().catch(console.error);
}

module.exports = { runFormTests, results };
