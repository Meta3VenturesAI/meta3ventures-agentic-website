import React from 'react';
import { SEO } from '../components/SEO';
import { Contact as ContactSection } from '../components/sections/Contact';

const ContactPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Contact - Meta3Ventures"
        description="Get in touch with Meta3Ventures to discuss how we can help transform your business through innovative technology solutions."
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <ContactSection />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;