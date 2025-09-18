import React, { useState, useEffect } from 'react';

interface Partner {
  name: string;
  logo?: string;
  description: string;
  imageUrl?: string;
}

export const Partners: React.FC = () => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const partners: Partner[] = [
    {
      name: "HubSpot for Startups",
      imageUrl: "/logos/png-clipart-hubspot-logo-hubspot-logo-icons-logos-emojis-tech-companies.png",
      description: "CRM and marketing platform for growing startups"
    },
    {
      name: "NVIDIA Inception",
      imageUrl: "/logos/20181218-Nvidia-Inception.webp",
      description: "AI computing platform and startup acceleration program"
    },
    {
      name: "Google for Startups",
      imageUrl: "/logos/Logo_for_Google_for_Startups_page.png",
      description: "Cloud credits and startup support from Google"
    },
    {
      name: "Microsoft for Startups",
      imageUrl: "/logos/Microsoft-for-Startups.jpg",
      description: "Azure credits and enterprise tools for startups"
    },
    {
      name: "Oracle for Startups",
      imageUrl: "/logos/oracle-for-startups.png",
      description: "Cloud infrastructure and database solutions for startups"
    },
    {
      name: "AWS Startups",
      imageUrl: "/logos/amazon.jpg",
      description: "Cloud computing platform and startup credits"
    },
    {
      name: "EY",
      imageUrl: "/logos/EYLogo.gif",
      description: "Professional services and startup advisory"
    },
    {
      name: "PwC",
      imageUrl: "/logos/PwC_2025_Logo.svg.png",
      description: "Consulting and professional services"
    },
    {
      name: "Start-up Nation Central",
      imageUrl: "/logos/SNC.png",
      description: "Israeli innovation ecosystem connector"
    },
    {
      name: "Nielsen",
      imageUrl: "/logos/Nielsen_New_Logo_2021.png",
      description: "Global measurement and data analytics company"
    },
    {
      name: "Atlassian",
      imageUrl: "/logos/Atlassian-Logo.png",
      description: "Team collaboration and productivity tools"
    },
    {
      name: "Slack",
      imageUrl: "/logos/slack-logo-PNG-large-size-900x230.png",
      description: "Business communication and collaboration platform"
    },
    {
      name: "Zoom",
      imageUrl: "/logos/zoom-logo-png-video-meeting-call-software.png",
      description: "Video communications and virtual meetings"
    },
    {
      name: "Notion",
      imageUrl: "/logos/notion-symbol.png",
      description: "All-in-one workspace for notes, docs, and collaboration"
    },
    {
      name: "Figma",
      imageUrl: "/logos/figma.png",
      description: "Collaborative design and prototyping platform"
    },
    {
      name: "Databricks",
      imageUrl: "/logos/Databricks_Logo.png",
      description: "Unified analytics platform for big data and machine learning"
    },
    {
      name: "MongoDB",
      imageUrl: "/logos/MongoDB_forStartups_ForestGreen.png",
      description: "Document database for modern applications"
    },
    {
      name: "Snowflake",
      imageUrl: "/logos/ibsi_snowflake.jpg",
      description: "Cloud data platform for data warehousing"
    },
    {
      name: "Stripe",
      imageUrl: "/logos/new-stripe-logo-png.png",
      description: "Payment processing platform for internet businesses"
    },
    {
      name: "Salesforce",
      imageUrl: "/logos/salesforce.png",
      description: "Customer relationship management platform"
    }
  ];

  // Log all partner logos on component mount to verify paths
  useEffect(() => {
    console.log("Partner logos:", partners.map(p => ({ name: p.name, logo: p.imageUrl })));
  }, [partners]);

  const handleImageError = (partnerName: string) => {
    console.error(`Failed to load image for partner: ${partnerName}`);
    setImageLoadErrors(prev => ({ ...prev, [partnerName]: true }));
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Our Partners
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We collaborate with industry leaders to provide our portfolio companies with the best resources and opportunities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="w-full max-w-[200px] h-20 flex items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {!imageLoadErrors[partner.name] && partner.imageUrl ? (
                <img
                  src={partner.imageUrl}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                  onError={() => handleImageError(partner.name)}
                />
              ) : (
                <div className="text-gray-600 dark:text-gray-300 text-sm font-medium text-center">
                  {partner.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};