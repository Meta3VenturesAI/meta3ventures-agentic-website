import React from 'react';
import { SEO } from '../components/SEO';
import MultiStepApplication from '../components/forms/MultiStepApplication';

const ApplyPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Apply for Funding - Meta3Ventures"
        description="Apply to Meta3Ventures accelerator program. Get funding, mentorship, and resources to scale your AI/Web3 startup."
      />
      
      <MultiStepApplication />
    </>
  );
};

export default ApplyPage;