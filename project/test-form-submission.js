// Test form submission automation script
// Run this in browser console to test the form submission

async function testFormSubmission() {
  console.log('🧪 Starting automated form submission test...');
  
  // Step 1: Company Information
  const companyNameInput = document.querySelector('input[name="companyName"]');
  const industrySelect = document.querySelector('select[name="industry"]');
  const companyStageSelect = document.querySelector('select[name="companyStage"]');
  const websiteInput = document.querySelector('input[name="website"]');
  
  if (companyNameInput) companyNameInput.value = 'Test Company Ltd';
  if (industrySelect) industrySelect.value = 'technology';
  if (companyStageSelect) companyStageSelect.value = 'seed';
  if (websiteInput) websiteInput.value = 'https://testcompany.com';
  
  // Trigger change events
  [companyNameInput, industrySelect, companyStageSelect, websiteInput].forEach(el => {
    if (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  // Click Next button for Step 1
  let nextButton = document.querySelector('button[type="button"]:contains("Next")') || 
                   document.querySelector('button:contains("Next")');
  if (nextButton) nextButton.click();
  
  setTimeout(() => {
    // Step 2: Contact Information
    console.log('📝 Filling Step 2: Contact Information');
    const contactNameInput = document.querySelector('input[name="contactName"]');
    const contactEmailInput = document.querySelector('input[name="contactEmail"]');
    const contactRoleInput = document.querySelector('input[name="contactRole"]');
    const contactPhoneInput = document.querySelector('input[name="contactPhone"]');
    
    if (contactNameInput) contactNameInput.value = 'John Doe';
    if (contactEmailInput) contactEmailInput.value = 'john@testcompany.com';
    if (contactRoleInput) contactRoleInput.value = 'CEO';
    if (contactPhoneInput) contactPhoneInput.value = '+1234567890';
    
    [contactNameInput, contactEmailInput, contactRoleInput, contactPhoneInput].forEach(el => {
      if (el) {
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Click Next for Step 2
    nextButton = document.querySelector('button[type="button"]:contains("Next")') || 
                 document.querySelector('button:contains("Next")');
    if (nextButton) nextButton.click();
    
    setTimeout(() => {
      // Step 3: Business Details
      console.log('💼 Filling Step 3: Business Details');
      const companyDescTextarea = document.querySelector('textarea[name="companyDescription"]');
      const productDescTextarea = document.querySelector('textarea[name="productDescription"]');
      const targetMarketTextarea = document.querySelector('textarea[name="targetMarket"]');
      const competitiveAdvTextarea = document.querySelector('textarea[name="competitiveAdvantage"]');
      
      if (companyDescTextarea) companyDescTextarea.value = 'A test company for demo purposes';
      if (productDescTextarea) productDescTextarea.value = 'Innovative software solutions';
      if (targetMarketTextarea) targetMarketTextarea.value = 'Small to medium businesses';
      if (competitiveAdvTextarea) competitiveAdvTextarea.value = 'Advanced AI technology';
      
      [companyDescTextarea, productDescTextarea, targetMarketTextarea, competitiveAdvTextarea].forEach(el => {
        if (el) {
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      // Click Next for Step 3
      nextButton = document.querySelector('button[type="button"]:contains("Next")') || 
                   document.querySelector('button:contains("Next")');
      if (nextButton) nextButton.click();
      
      setTimeout(() => {
        // Step 4: Final Step - Submit
        console.log('🚀 Step 4: Final submission step');
        const fundingSoughtSelect = document.querySelector('select[name="fundingSought"]');
        const teamDescTextarea = document.querySelector('textarea[name="teamDescription"]');
        
        if (fundingSoughtSelect) fundingSoughtSelect.value = '$500K - $2M';
        if (teamDescTextarea) teamDescTextarea.value = 'Experienced team with 10+ years in tech';
        
        [fundingSoughtSelect, teamDescTextarea].forEach(el => {
          if (el) {
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        
        setTimeout(() => {
          // Submit the form
          console.log('🎯 Submitting form...');
          const submitButton = document.querySelector('button[type="submit"]') || 
                              document.querySelector('button:contains("Submit Application")');
          if (submitButton) {
            console.log('✅ Found submit button, clicking...');
            submitButton.click();
          } else {
            console.error('❌ Submit button not found!');
          }
        }, 1000);
        
      }, 1000);
    }, 1000);
  }, 1000);
}

// Run the test
testFormSubmission();