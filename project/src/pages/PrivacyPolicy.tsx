import React from 'react';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Meta3Ventures",
    "description": "Privacy Policy for Meta3Ventures platform and services",
    "publisher": {
      "@type": "Organization",
      "name": "Meta3Ventures",
      "logo": {
        "@type": "ImageObject",
        "url": "https://meta3ventures.com/og-image.jpg"
      }
    }
  };

  return (
    <>
      <SEO 
        title="Privacy Policy - Meta3Ventures"
        description="Privacy Policy for Meta3Ventures platform and services"
        schema={schema}
      />
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  submit an application, contact us, or use our services.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Name and contact information (email, phone number, address)</li>
                  <li>Company information and business details</li>
                  <li>Professional background and experience</li>
                  <li>Financial information relevant to investment decisions</li>
                  <li>Communication preferences and history</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Usage data and analytics</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and server data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process applications and evaluate business opportunities</li>
                  <li>Communicate with you about our services and updates</li>
                  <li>Personalize your experience and content</li>
                  <li>Analyze usage patterns and optimize our platform</li>
                  <li>Comply with legal obligations and protect our rights</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party 
                      service providers who assist us in operating our website and conducting our business</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law 
                      or to protect our rights, property, or safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale 
                      of assets, your information may be transferred as part of the transaction</li>
                  <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction. 
                  However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication systems</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
                <p className="text-gray-700 mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required or 
                  permitted by law. When we no longer need your information, we will securely delete 
                  or anonymize it.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our website. 
                  You can control cookie settings through your browser preferences, but disabling cookies 
                  may affect the functionality of our services.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
                <p className="text-gray-700 mb-4">
                  Our website may contain links to third-party websites and services. We are not responsible 
                  for the privacy practices of these third parties. We encourage you to read their privacy 
                  policies before providing any personal information.
                </p>
                <p className="text-gray-700 mb-4">
                  We may use third-party services such as:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Analytics providers (Google Analytics, etc.)</li>
                  <li>Form handling services (Formspree)</li>
                  <li>Database services (Supabase)</li>
                  <li>Communication platforms (Email services)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure that such transfers comply with applicable data protection laws and implement 
                  appropriate safeguards to protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13. If we become aware that we have 
                  collected personal information from a child under 13, we will take steps to delete 
                  such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Meta3Ventures</strong><br />
                    Email: privacy@meta3ventures.com<br />
                    Website: https://meta3ventures.com<br />
                    Address: [Your Business Address]
                  </p>
                </div>
                <p className="text-gray-700 mt-4">
                  For data protection inquiries, you can also contact our Data Protection Officer at: 
                  dpo@meta3ventures.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
