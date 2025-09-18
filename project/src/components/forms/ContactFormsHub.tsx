import React, { useState } from 'react';
import { 
  Send, Building, Users, Newspaper, 
  Handshake, MessageSquare, Briefcase,
  Mail, Phone, Globe, CheckCircle
} from 'lucide-react';
import { useForm } from '@formspree/react';
import toast from 'react-hot-toast';
import { dataStorage, FormType } from '../../services/data-storage.service';
import { SEO } from '../SEO';

type ContactType = 'entrepreneur' | 'investor' | 'media' | 'partnership' | 'general';

interface ContactOption {
  id: ContactType;
  title: string;
  description: string;
  icon: React.ElementType;
  formspreeId: string;
  fields: string[];
  color: string;
}

const contactOptions: ContactOption[] = [
  {
    id: 'entrepreneur',
    title: 'Entrepreneurs',
    description: 'Apply for funding and accelerator programs',
    icon: Building,
    formspreeId: 'myzwnkkp', // Using apply form ID
    fields: ['company', 'stage', 'funding', 'pitch'],
    color: 'indigo'
  },
  {
    id: 'investor',
    title: 'Investors',
    description: 'Explore co-investment and partnership opportunities',
    icon: Briefcase,
    formspreeId: 'mldbpggn', // Using contact form ID
    fields: ['firm', 'investment_focus', 'typical_check', 'portfolio'],
    color: 'purple'
  },
  {
    id: 'media',
    title: 'Media & Press',
    description: 'Media inquiries and press coverage',
    icon: Newspaper,
    formspreeId: 'mldbpggn',
    fields: ['publication', 'deadline', 'topic', 'format'],
    color: 'pink'
  },
  {
    id: 'partnership',
    title: 'Strategic Partners',
    description: 'Explore strategic partnerships and collaborations',
    icon: Handshake,
    formspreeId: 'mldbpggn',
    fields: ['organization', 'partnership_type', 'objectives', 'timeline'],
    color: 'green'
  },
  {
    id: 'general',
    title: 'General Inquiry',
    description: 'Any other questions or requests',
    icon: MessageSquare,
    formspreeId: 'mldbpggn',
    fields: ['subject', 'message'],
    color: 'blue'
  }
];

export const ContactFormsHub: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const selectedOption = contactOptions.find(opt => opt.id === selectedType);
  const [state, handleSubmit] = useForm(selectedOption?.formspreeId || 'mldbpggn');

  React.useEffect(() => {
    if (state.succeeded) {
      // Store form submission
      dataStorage.storeFormSubmission({
        type: `contact_${selectedType}` as FormType,
        data: {
          ...formData,
          contactType: selectedType,
          submittedAt: new Date().toISOString()
        },
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          sessionId: sessionStorage.getItem('session_id') || ''
        }
      }).then(() => {
        console.log('Contact form data stored');
      });

      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setTimeout(() => {
        setFormData({});
        setSelectedType(null);
        const form = document.getElementById('contact-form') as HTMLFormElement;
        if (form) form.reset();
      }, 2000);
    }
  }, [state.succeeded, selectedType, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Track form submission
    await dataStorage.trackEvent({
      event_type: 'contact_form_submitted',
      event_data: {
        contact_type: selectedType,
        form_fields: Object.keys(formData).length
      }
    });

    handleSubmit(e);
  };

  const renderFormFields = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case 'entrepreneur':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Stage *
                </label>
                <select
                  name="stage"
                  required
                  value={formData.stage || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="mvp">MVP/Prototype</option>
                  <option value="revenue">Early Revenue</option>
                  <option value="growth">Growth Stage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Sought
              </label>
              <select
                name="funding"
                value={formData.funding || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Amount</option>
                <option value="100k-250k">$100K - $250K</option>
                <option value="250k-500k">$250K - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m+">$5M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Pitch *
              </label>
              <textarea
                name="pitch"
                required
                rows={4}
                value={formData.pitch || ''}
                onChange={handleInputChange}
                placeholder="Describe your company, problem you're solving, and why you're reaching out..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </>
        );

      case 'investor':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firm/Organization *
                </label>
                <input
                  type="text"
                  name="firm"
                  required
                  value={formData.firm || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Focus
                </label>
                <input
                  type="text"
                  name="investment_focus"
                  value={formData.investment_focus || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., AI, Web3, FinTech"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typical Check Size
                </label>
                <select
                  name="typical_check"
                  value={formData.typical_check || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Range</option>
                  <option value="50k-100k">$50K - $100K</option>
                  <option value="100k-500k">$100K - $500K</option>
                  <option value="500k-1m">$500K - $1M</option>
                  <option value="1m-5m">$1M - $5M</option>
                  <option value="5m+">$5M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio || ''}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partnership Interest *
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message || ''}
                onChange={handleInputChange}
                placeholder="What type of partnership or collaboration are you interested in?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </>
        );

      case 'media':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication/Media Outlet *
                </label>
                <input
                  type="text"
                  name="publication"
                  required
                  value={formData.publication || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic/Story Focus *
                </label>
                <input
                  type="text"
                  name="topic"
                  required
                  value={formData.topic || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., AI Innovation, Startup Ecosystem"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  name="format"
                  value={formData.format || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select Format</option>
                  <option value="interview">Interview</option>
                  <option value="article">Article/Feature</option>
                  <option value="podcast">Podcast</option>
                  <option value="video">Video</option>
                  <option value="panel">Panel/Event</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Details *
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message || ''}
                onChange={handleInputChange}
                placeholder="Please provide details about your media request..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </>
        );

      case 'partnership':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  required
                  value={formData.organization || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partnership Type *
                </label>
                <select
                  name="partnership_type"
                  required
                  value={formData.partnership_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Type</option>
                  <option value="technology">Technology Partnership</option>
                  <option value="channel">Channel Partnership</option>
                  <option value="strategic">Strategic Alliance</option>
                  <option value="integration">Integration Partnership</option>
                  <option value="distribution">Distribution Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partnership Objectives *
              </label>
              <textarea
                name="objectives"
                required
                rows={3}
                value={formData.objectives || ''}
                onChange={handleInputChange}
                placeholder="What are your main objectives for this partnership?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                name="timeline"
                value={formData.timeline || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Timeline</option>
                <option value="immediate">Immediate (&lt; 1 month)</option>
                <option value="short">Short-term (1-3 months)</option>
                <option value="medium">Medium-term (3-6 months)</option>
                <option value="long">Long-term (6+ months)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                name="message"
                rows={3}
                value={formData.message || ''}
                onChange={handleInputChange}
                placeholder="Any additional information about your partnership proposal..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </>
        );

      case 'general':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Organization
              </label>
              <input
                type="text"
                name="company"
                value={formData.company || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                required
                rows={6}
                value={formData.message || ''}
                onChange={handleInputChange}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="Contact Meta3Ventures - Multiple Ways to Connect"
        description="Connect with Meta3Ventures. Whether you're an entrepreneur, investor, media, or partner, we have a dedicated channel for you."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the option that best describes you, and we'll make sure your message reaches the right team
            </p>
          </div>

          {/* Contact Options Grid - Show when no type selected */}
          {!selectedType && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {contactOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedType(option.id)}
                    className={`
                      p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105
                      border-2 border-transparent hover:border-${option.color}-500
                    `}
                  >
                    <div className={`w-16 h-16 bg-${option.color}-100 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className={`w-8 h-8 text-${option.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Form Section - Show when type is selected */}
          {selectedType && selectedOption && (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              {/* Form Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-${selectedOption.color}-100 rounded-full flex items-center justify-center mr-4`}>
                    <selectedOption.icon className={`w-6 h-6 text-${selectedOption.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOption.title} Form</h2>
                    <p className="text-gray-600">{selectedOption.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setFormData({});
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </div>

              {/* Form */}
              <form id="contact-form" onSubmit={handleFormSubmit} className="space-y-6">
                {renderFormFields()}
                
                {/* Submit Button */}
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className={`
                      px-8 py-3 bg-gradient-to-r from-${selectedOption.color}-600 to-${selectedOption.color}-700 
                      text-white font-medium rounded-lg hover:from-${selectedOption.color}-700 hover:to-${selectedOption.color}-800 
                      transition-all flex items-center disabled:opacity-50
                    `}
                  >
                    {state.submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contact Info Footer */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <Mail className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email</h3>
              <a href="mailto:hello@meta3ventures.com" className="text-gray-600 hover:text-indigo-600">
                hello@meta3ventures.com
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Phone className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <a href="tel:+972527020150" className="text-gray-600 hover:text-indigo-600">
                +972 52-702-0150
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Globe className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Office</h3>
              <p className="text-gray-600">
                Tel Aviv, Israel
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactFormsHub;