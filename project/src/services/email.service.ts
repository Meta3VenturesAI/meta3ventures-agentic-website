/**
 * Email Automation Service
 * Handles automated email responses and notifications
 */

interface EmailTemplate {
  subject: string;
  body: string;
  variables?: string[];
}

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
  cc?: string[];
  bcc?: string[];
}

class EmailService {
  private templates: Map<string, EmailTemplate> = new Map();
  private formspreeEndpoints: Record<string, string> = {
    application: import.meta.env.VITE_FORMSPREE_APPLICATION_ID || 'mldbpggn',
    contact: import.meta.env.VITE_FORMSPREE_CONTACT_ID || 'myzwnkkp',
    newsletter: import.meta.env.VITE_FORMSPREE_NEWSLETTER_ID || 'xdkgwaaa'
  };

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Application received template
    this.templates.set('application-received', {
      subject: 'Application Received - Meta3Ventures',
      body: `
Dear {contactName},

Thank you for submitting your application to Meta3Ventures. We've successfully received your application for {companyName}.

What happens next:
1. Our team will review your application within 48 hours
2. If your application meets our criteria, we'll schedule an initial screening call
3. Selected companies will be invited to present to our investment committee
4. Final decisions are typically made within 2-3 weeks

In the meantime, feel free to:
- Update your application materials if needed
- Connect with us on LinkedIn
- Explore our portfolio companies and resources

We appreciate your interest in Meta3Ventures and look forward to learning more about {companyName}.

Best regards,
The Meta3Ventures Team

--
Meta3Ventures
AI Innovation & Digital Transformation
https://meta3ventures.com
      `.trim(),
      variables: ['contactName', 'companyName']
    });

    // Contact form response template
    this.templates.set('contact-received', {
      subject: 'Thank you for contacting Meta3Ventures',
      body: `
Dear {name},

Thank you for reaching out to Meta3Ventures. We've received your message and appreciate your interest.

Our team typically responds within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to reach out directly at:
- Email: liron@meta3ventures.com
- LinkedIn: https://linkedin.com/company/meta3ventures

We look forward to connecting with you soon.

Best regards,
The Meta3Ventures Team

--
Your Message:
{message}
      `.trim(),
      variables: ['name', 'message']
    });

    // Newsletter welcome template
    this.templates.set('newsletter-welcome', {
      subject: 'Welcome to Meta3Ventures Newsletter',
      body: `
Welcome to the Meta3Ventures community!

You're now subscribed to our newsletter where we share:
- Latest AI and Web3 industry insights
- Portfolio company updates and success stories
- Funding opportunities and application tips
- Exclusive events and webinars
- Technology trends and market analysis

Your interests: {interests}

Stay connected:
- Website: https://meta3ventures.com
- LinkedIn: https://linkedin.com/company/meta3ventures
- Twitter: @meta3ventures

To ensure you receive our emails, please add newsletter@meta3ventures.com to your contacts.

Best regards,
The Meta3Ventures Team

P.S. You can update your preferences or unsubscribe at any time using the links at the bottom of our emails.
      `.trim(),
      variables: ['interests']
    });

    // Investor inquiry response
    this.templates.set('investor-inquiry', {
      subject: 'Investor Inquiry - Meta3Ventures',
      body: `
Dear {name},

Thank you for your interest in partnering with Meta3Ventures.

We're excited to explore potential collaboration opportunities. Our team will review your inquiry and reach out within 48 hours to discuss:
- Co-investment opportunities
- Portfolio company introductions
- Strategic partnerships
- Deal flow sharing

In the meantime, please feel free to review our:
- Portfolio: https://meta3ventures.com/portfolio
- Investment thesis: https://meta3ventures.com/about
- Recent investments and exits

We look forward to discussing how we can work together to support the next generation of AI and Web3 innovators.

Best regards,
Liron Langer
Managing Partner
Meta3Ventures
      `.trim(),
      variables: ['name']
    });

    // Application status update
    this.templates.set('application-status', {
      subject: 'Application Status Update - {companyName}',
      body: `
Dear {contactName},

We wanted to update you on the status of your application for {companyName}.

Status: {status}

{statusMessage}

Next Steps:
{nextSteps}

If you have any questions or would like to provide additional information, please don't hesitate to reach out.

Best regards,
The Meta3Ventures Team
      `.trim(),
      variables: ['contactName', 'companyName', 'status', 'statusMessage', 'nextSteps']
    });
  }

  /**
   * Send an email using Formspree
   */
  async sendEmail(request: EmailRequest): Promise<boolean> {
    const template = this.templates.get(request.template);
    if (!template) {
      console.error(`Email template '${request.template}' not found`);
      return false;
    }

    // Replace variables in template
    let subject = template.subject;
    let body = template.body;

    if (template.variables) {
      template.variables.forEach(variable => {
        const value = request.data[variable] || '';
        const regex = new RegExp(`{${variable}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });
    }

    // Determine which Formspree endpoint to use
    const endpointType = request.template.includes('application') ? 'application' :
                        request.template.includes('newsletter') ? 'newsletter' : 'contact';
    const formspreeId = this.formspreeEndpoints[endpointType];

    if (!formspreeId) {
      console.error(`Formspree ID not configured for ${endpointType}`);
      return false;
    }

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: request.to,
          subject,
          message: body,
          _replyto: request.to,
          _cc: request.cc?.join(','),
          _bcc: request.bcc?.join(','),
          _template: request.template,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Failed to send email:', response.statusText);
        return false;
      }

      console.log(`Email sent successfully: ${request.template} to ${request.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send application confirmation email
   */
  async sendApplicationConfirmation(data: unknown): Promise<boolean> {
    return this.sendEmail({
      to: data.contactEmail,
      template: 'application-received',
      data: {
        contactName: data.contactName,
        companyName: data.companyName
      }
    });
  }

  /**
   * Send contact form confirmation
   */
  async sendContactConfirmation(data: unknown): Promise<boolean> {
    return this.sendEmail({
      to: data.email,
      template: 'contact-received',
      data: {
        name: data.name,
        message: data.message
      }
    });
  }

  /**
   * Send newsletter welcome email
   */
  async sendNewsletterWelcome(email: string, interests: string[]): Promise<boolean> {
    return this.sendEmail({
      to: email,
      template: 'newsletter-welcome',
      data: {
        interests: interests.join(', ')
      }
    });
  }

  /**
   * Send investor inquiry response
   */
  async sendInvestorResponse(data: unknown): Promise<boolean> {
    return this.sendEmail({
      to: data.email,
      template: 'investor-inquiry',
      data: {
        name: data.name
      }
    });
  }

  /**
   * Send application status update
   */
  async sendStatusUpdate(data: {
    email: string;
    contactName: string;
    companyName: string;
    status: string;
    statusMessage: string;
    nextSteps: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: data.email,
      template: 'application-status',
      data
    });
  }

  /**
   * Queue email for later sending (when offline or rate limited)
   */
  queueEmail(request: EmailRequest): void {
    const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');
    queue.push({
      ...request,
      queuedAt: new Date().toISOString(),
      attempts: 0
    });
    localStorage.setItem('email-queue', JSON.stringify(queue));
  }

  /**
   * Process queued emails
   */
  async processEmailQueue(): Promise<void> {
    const queue = JSON.parse(localStorage.getItem('email-queue') || '[]');
    const pending = [...queue];
    const failed = [];

    for (const email of pending) {
      const success = await this.sendEmail(email);
      if (!success) {
        email.attempts++;
        if (email.attempts < 3) {
          failed.push(email);
        }
      }
    }

    localStorage.setItem('email-queue', JSON.stringify(failed));
    
    if (failed.length > 0) {
      console.log(`${failed.length} emails remain in queue`);
    } else {
      console.log('Email queue processed successfully');
    }
  }

  /**
   * Get available templates
   */
  getTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Preview a template with sample data
   */
  previewTemplate(templateName: string, data: Record<string, any>): { subject: string; body: string } | null {
    const template = this.templates.get(templateName);
    if (!template) return null;

    let subject = template.subject;
    let body = template.body;

    if (template.variables) {
      template.variables.forEach(variable => {
        const value = data[variable] || `[${variable}]`;
        const regex = new RegExp(`{${variable}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });
    }

    return { subject, body };
  }
}

// Export singleton instance
export const emailService = new EmailService();