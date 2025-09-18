import React from 'react';
import { SEO } from '../components/SEO';
import { Hero } from '../components/sections/Hero';
import { FocusPillars } from '../components/sections/FocusPillars';
import { ValueFlywheel } from '../components/sections/ValueFlywheel';
import Services from '../components/sections/Services';
import { About } from '../components/sections/About';
import { Contact } from '../components/sections/Contact';
// import PublicAgents from '../components/PublicAgents'; // Coming soon

const HomePage: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Meta3Ventures - AI Innovation & Digital Transformation",
    "description": "Meta3Ventures empowers organizations with cutting-edge AI solutions, strategic consulting, and venture studio support.",
    "publisher": {
      "@type": "Organization",
      "name": "Meta3Ventures",
      "logo": {
        "@type": "ImageObject",
        "url": "https://meta3ventures.com/og-image.jpg"
      }
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "Meta3Ventures",
      "description": "A venture studio focused on AI innovation and digital transformation",
      "url": "https://meta3ventures.com",
      "areaServed": "Worldwide",
      "serviceType": [
        "Venture Studio Support",
        "AI Integration",
        "Strategic Consulting",
        "Digital Transformation"
      ]
    }
  };

  return (
    <>
      <SEO 
        title="Meta3Ventures - AI Innovation & Digital Transformation"
        description="Meta3Ventures empowers organizations with cutting-edge AI solutions, strategic consulting, and venture studio support."
        schema={schema}
      />
      <div className="w-full">
        <Hero />
        <FocusPillars />
        <ValueFlywheel />
        <Services />
        {/* <PublicAgents /> Coming soon */}
        <About />
        <Contact />
      </div>
    </>
  );
};

export default HomePage;