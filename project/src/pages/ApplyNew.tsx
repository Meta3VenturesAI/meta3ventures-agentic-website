import React from 'react';
import { MultiStepApplication } from '../components/forms/MultiStepApplication';
import { SEO } from '../components/SEO';

const ApplyNewPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Apply for Funding - Meta3Ventures"
        description="Apply to join Meta3Ventures portfolio. We invest $100K-$5M in AI and Web3 startups at pre-seed to Series A stages."
      />
      <MultiStepApplication />
    </>
  );
};

export default ApplyNewPage;