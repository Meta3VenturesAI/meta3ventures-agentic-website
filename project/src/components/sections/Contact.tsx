import React from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { useForm } from '@formspree/react';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const [state, handleSubmit] = useForm("mldbpggn");
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success('Message sent! We\'ll get back to you soon.');
      // Reset form and reload page to clear Formspree state
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.reset();
        }
        // Reload to clear form state completely
        window.location.reload();
      }, 2000);
    }
  }, [state.succeeded]);

  if (state.errors && Object.keys(state.errors).length > 0) {
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
                    <a href="mailto:liron@meta3ventures.com" className="text-gray-600 hover:text-indigo-600">
                      liron@meta3ventures.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+972528444500" className="text-gray-600 hover:text-indigo-600">
                      +972 52-844-4500
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

          <form ref={formRef} id="contact-form" onSubmit={handleSubmit} className="space-y-6">
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
