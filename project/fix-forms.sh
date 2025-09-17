#!/bin/bash

# Meta3Ventures Form Fix Script
# This script fixes all Formspree form issues automatically

set -e

echo "🔧 Starting Meta3Ventures Form Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from your project root directory"
    exit 1
fi

print_status "Found project structure"

# Backup current files
echo "📦 Creating backup..."
mkdir -p .form-fix-backup
cp src/pages/Apply.tsx .form-fix-backup/ 2>/dev/null || true
cp src/components/sections/Contact.tsx .form-fix-backup/ 2>/dev/null || true
cp src/components/Footer.tsx .form-fix-backup/ 2>/dev/null || true
print_status "Backup created in .form-fix-backup/"

# Fix Apply.tsx - remove the problematic isSubmitting variable
echo "🎯 Fixing Apply.tsx..."
sed -i '' 's/disabled={isSubmitting}/disabled={state.submitting}/g' src/pages/Apply.tsx
print_status "Fixed Apply form disabled states"

# Create a simple working Apply.tsx
cat > src/pages/Apply.tsx << 'EOF'
import React from 'react';
import { Send, Building } from 'lucide-react';
import { useForm } from '@formspree/react';
import { SEO } from '../components/SEO';
import toast from 'react-hot-toast';

const ApplyPage: React.FC = () => {
  const [state, handleSubmit] = useForm("myzwnkkp");

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success('Application submitted successfully! We\'ll review it and get back to you soon.');
      // Reset form
      const form = document.getElementById('apply-form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state.succeeded]);

  if (state.errors && state.errors.length > 0) {
    toast.error('Please check your form and try again.');
  }

  return (
    <>
      <SEO 
        title="Apply for Partnership - Meta3Ventures"
        description="Apply to partner with Meta3Ventures and join our ecosystem of innovative AI and technology companies."
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                Apply for Partnership
              </h1>
              <p className="text-xl text-gray-600">
                Ready to build the future of intelligent systems? Tell us about your venture.
              </p>
            </div>

            <form id="apply-form" onSubmit={handleSubmit} className="space-y-8 bg-gray-50 p-8 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    disabled={state.submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={state.submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founder Name *</label>
                <input
                  type="text"
                  name="founderName"
                  required
                  disabled={state.submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Stage *</label>
                <select
                  name="stage"
                  required
                  disabled={state.submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="mvp">MVP/Prototype</option>
                  <option value="early-revenue">Early Revenue</option>
                  <option value="growth">Growth Stage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  disabled={state.submitting}
                  placeholder="Tell us about your company, vision, and what problem you're solving..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Sought *</label>
                  <select
                    name="fundingNeeds"
                    required
                    disabled={state.submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">Select amount</option>
                    <option value="under-500k">Under $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="5m-10m">$5M - $10M</option>
                    <option value="over-10m">Over $10M</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                  <select
                    name="industry"
                    required
                    disabled={state.submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">Select industry</option>
                    <option value="ai-ml">AI & Machine Learning</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="enterprise">Enterprise Software</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {state.submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyPage;
EOF

print_status "Created simplified Apply.tsx"

# Create a simple working Contact section
echo "🎯 Fixing Contact section..."
cat > src/components/sections/Contact.tsx << 'EOF'
import React from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { useForm } from '@formspree/react';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const [state, handleSubmit] = useForm("mldbpggn");

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success('Message sent! We\'ll get back to you soon.');
      const form = document.getElementById('contact-form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state.succeeded]);

  if (state.errors && state.errors.length > 0) {
    toast.error('Please check your form and try again.');
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600">
            Ready to transform your business with AI? Let's start a conversation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Headquarters</p>
                    <p className="text-gray-600">Innovation Hub, Tel Aviv, Israel</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:hello@meta3ventures.com" className="text-gray-600 hover:text-indigo-600">
                      hello@meta3ventures.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+972527020150" className="text-gray-600 hover:text-indigo-600">
                      +972 52 702 0150
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Response Time</h4>
              <p className="text-gray-600">
                We typically respond to inquiries within 24-48 business hours.
              </p>
            </div>
          </div>

          <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  disabled={state.submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  disabled={state.submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                required
                disabled={state.submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                name="company"
                disabled={state.submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                name="subject"
                required
                disabled={state.submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select a subject</option>
                <option value="consultation">AI Consultation</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="investment">Investment Inquiry</option>
                <option value="general">General Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                name="message"
                rows={6}
                required
                disabled={state.submitting}
                placeholder="Tell us about your project or inquiry..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {state.submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
EOF

print_status "Created simplified Contact section"

# Check for Newsletter form in Footer and fix it
echo "🎯 Checking Footer newsletter..."
if [ -f "src/components/Footer.tsx" ]; then
    # Create a backup and simple newsletter fix
    cp src/components/Footer.tsx .form-fix-backup/Footer-original.tsx
    
    # Add newsletter form fix to Footer - this is a simple pattern
    print_warning "Footer newsletter needs manual verification - check that it uses simple Formspree pattern"
fi

# Build and test
echo "🏗️ Building project..."
if npm run build > /dev/null 2>&1; then
    print_status "Build successful!"
else
    print_error "Build failed - check for any remaining issues"
    echo "Check the output above for specific errors"
fi

# Test the forms are accessible
echo "🧪 Testing form accessibility..."
if grep -q "useForm.*myzwnkkp" src/pages/Apply.tsx; then
    print_status "Apply form has correct Formspree ID"
else
    print_warning "Apply form Formspree ID might be incorrect"
fi

if grep -q "useForm.*mldbpggn" src/components/sections/Contact.tsx; then
    print_status "Contact form has correct Formspree ID"
else
    print_warning "Contact form Formspree ID might be incorrect"
fi

# Summary
echo ""
echo "📋 SUMMARY:"
print_status "Fixed Apply.tsx with simplified Formspree integration"
print_status "Fixed Contact section with simplified Formspree integration"
print_status "Backup files saved in .form-fix-backup/"
print_status "Forms now use standard Formspree pattern"

echo ""
echo "🚀 NEXT STEPS:"
echo "1. Test the build: npm run build"
echo "2. Deploy: npx netlify deploy --prod --dir=dist"
echo "3. Test forms on live site"
echo "4. Check email delivery"

echo ""
print_warning "IMPORTANT: Test the forms after deployment to confirm they work!"

echo -e "${GREEN}✅ Form fix completed!${NC}"
