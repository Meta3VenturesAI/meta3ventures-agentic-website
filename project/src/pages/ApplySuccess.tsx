import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Phone, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';

const ApplySuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = location.state?.applicationId || 'N/A';

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Application Submitted Successfully - Meta3Ventures",
    "description": "Your application to Meta3Ventures has been submitted successfully. We'll review it and get back to you soon.",
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
        title="Application Submitted Successfully - Meta3Ventures"
        description="Your application to Meta3Ventures has been submitted successfully. We'll review it and get back to you soon."
        schema={schema}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thank you for your interest in Meta3Ventures. We've received your application 
              and will review it carefully.
            </p>
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Happens Next?
              </h2>
              <p className="text-gray-600">
                Your application ID: <span className="font-mono font-semibold text-indigo-600">{applicationId}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Initial Review</h3>
                <p className="text-gray-600">
                  Our team will review your application within 2-3 business days.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                  <Phone className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up Call</h3>
                <p className="text-gray-600">
                  If selected, we'll schedule a call to discuss your venture in detail.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
                <p className="text-gray-600">
                  We'll guide you through our investment and acceleration process.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email us at:</p>
                  <a 
                    href="mailto:liron@meta3ventures.com" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    liron@meta3ventures.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Call us at:</p>
                  <a 
                    href="tel:+972528444500" 
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    +972 52-844-4500
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Back to Home
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <button
                onClick={() => navigate('/portfolio')}
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                View Our Portfolio
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Meta3Ventures</h3>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                We're a venture studio focused on AI innovation and digital transformation. 
                Our mission is to empower the next generation of AI-powered startups through 
                strategic investment, technical expertise, and comprehensive support.
              </p>
              <p>
                We focus on AI and Web3 startups at pre-seed to Series A stages, 
                providing not just capital but also hands-on support in technology development, 
                market strategy, and business scaling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplySuccessPage;
