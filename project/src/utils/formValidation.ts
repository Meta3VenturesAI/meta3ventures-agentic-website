/**
 * Enhanced form validation with specific error messages
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  min?: number;
  max?: number;
  custom?: (value: unknown, formData?: Record<string, unknown>) => string | null;
}

export interface FieldValidation {
  field: string;
  rules: ValidationRule;
  messages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    email?: string;
    url?: string;
    phone?: string;
    min?: string;
    max?: string;
    custom?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

class FormValidator {
  /**
   * Common validation patterns
   */
  private patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
    phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,5}[-\s.]?[0-9]{1,5}$/,
    companyName: /^[a-zA-Z0-9\s\-\.&,]{2,100}$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/
  };

  /**
   * Default error messages
   */
  private defaultMessages = {
    required: 'This field is required',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must be no more than {max} characters',
    pattern: 'Invalid format',
    email: 'Please enter a valid email address',
    url: 'Please enter a valid URL',
    phone: 'Please enter a valid phone number',
    min: 'Must be at least {min}',
    max: 'Must be no more than {max}',
    custom: 'Invalid value'
  };

  /**
   * Validate a single field
   */
  validateField(value: unknown, rules: ValidationRule, messages?: unknown): string | null {
    // Required validation
    if (rules.required && !value) {
      return messages?.required || this.defaultMessages.required;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return null;
    }

    // Email validation
    if (rules.email && !this.patterns.email.test(value)) {
      return messages?.email || this.defaultMessages.email;
    }

    // URL validation
    if (rules.url && !this.patterns.url.test(value)) {
      return messages?.url || this.defaultMessages.url;
    }

    // Phone validation
    if (rules.phone && !this.patterns.phone.test(value)) {
      return messages?.phone || this.defaultMessages.phone;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      const message = messages?.minLength || this.defaultMessages.minLength;
      return message.replace('{min}', rules.minLength.toString());
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      const message = messages?.maxLength || this.defaultMessages.maxLength;
      return message.replace('{max}', rules.maxLength.toString());
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return messages?.pattern || this.defaultMessages.pattern;
    }

    // Numeric min validation
    if (rules.min !== undefined && Number(value) < rules.min) {
      const message = messages?.min || this.defaultMessages.min;
      return message.replace('{min}', rules.min.toString());
    }

    // Numeric max validation
    if (rules.max !== undefined && Number(value) > rules.max) {
      const message = messages?.max || this.defaultMessages.max;
      return message.replace('{max}', rules.max.toString());
    }

    // Custom validation
    if (rules.custom) {
      const error = rules.custom(value);
      if (error) {
        return messages?.custom || error;
      }
    }

    return null;
  }

  /**
   * Validate entire form
   */
  validateForm(formData: Record<string, any>, validations: FieldValidation[]): ValidationResult {
    const errors: Record<string, string> = {};
    let isValid = true;

    validations.forEach(({ field, rules, messages }) => {
      const value = formData[field];
      const error = this.validateField(value, rules, messages);
      
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  /**
   * Get validation rules for multi-step application form
   */
  getApplicationValidationRules(step: number): FieldValidation[] {
    const validations: Record<number, FieldValidation[]> = {
      1: [ // Company Info
        {
          field: 'companyName',
          rules: { required: true, minLength: 2, maxLength: 100, pattern: this.patterns.companyName },
          messages: {
            required: 'Company name is required',
            minLength: 'Company name must be at least 2 characters',
            maxLength: 'Company name must be less than 100 characters',
            pattern: 'Company name contains invalid characters'
          }
        },
        {
          field: 'website',
          rules: { url: true },
          messages: { url: 'Please enter a valid website URL (e.g., https://example.com)' }
        },
        {
          field: 'industry',
          rules: { required: true },
          messages: { required: 'Please select your industry' }
        },
        {
          field: 'companyStage',
          rules: { required: true },
          messages: { required: 'Please select your company stage' }
        },
        {
          field: 'companyDescription',
          rules: { required: true, minLength: 50, maxLength: 1000 },
          messages: {
            required: 'Company description is required',
            minLength: 'Please provide at least 50 characters describing your company',
            maxLength: 'Description must be less than 1000 characters'
          }
        },
        {
          field: 'location',
          rules: { required: true },
          messages: { required: 'Please enter your company location' }
        }
      ],
      2: [ // Technology
        {
          field: 'technologyFocus',
          rules: { required: true },
          messages: { required: 'Please select your technology focus area' }
        },
        {
          field: 'productDescription',
          rules: { required: true, minLength: 50, maxLength: 2000 },
          messages: {
            required: 'Product description is required',
            minLength: 'Please provide at least 50 characters describing your product',
            maxLength: 'Description must be less than 2000 characters'
          }
        },
        {
          field: 'competitiveAdvantage',
          rules: { required: true, minLength: 30, maxLength: 1000 },
          messages: {
            required: 'Please describe your competitive advantage',
            minLength: 'Please provide at least 30 characters',
            maxLength: 'Must be less than 1000 characters'
          }
        },
        {
          field: 'developmentStatus',
          rules: { required: true },
          messages: { required: 'Please select your development status' }
        }
      ],
      3: [ // Market & Funding
        {
          field: 'targetMarket',
          rules: { required: true, minLength: 50, maxLength: 1500 },
          messages: {
            required: 'Target market description is required',
            minLength: 'Please provide at least 50 characters about your target market',
            maxLength: 'Must be less than 1500 characters'
          }
        },
        {
          field: 'fundingSought',
          rules: { required: true },
          messages: { required: 'Please select the funding amount you are seeking' }
        }
      ],
      4: [ // Team & Contact
        {
          field: 'contactName',
          rules: { required: true, minLength: 2, maxLength: 100 },
          messages: {
            required: 'Contact name is required',
            minLength: 'Name must be at least 2 characters',
            maxLength: 'Name must be less than 100 characters'
          }
        },
        {
          field: 'contactRole',
          rules: { required: true },
          messages: { required: 'Please enter your role/title' }
        },
        {
          field: 'contactEmail',
          rules: { required: true, email: true },
          messages: {
            required: 'Email address is required',
            email: 'Please enter a valid email address'
          }
        },
        {
          field: 'contactPhone',
          rules: { phone: true },
          messages: { phone: 'Please enter a valid phone number' }
        },
        {
          field: 'teamDescription',
          rules: { required: true, minLength: 50, maxLength: 2000 },
          messages: {
            required: 'Team description is required',
            minLength: 'Please provide at least 50 characters about your team',
            maxLength: 'Must be less than 2000 characters'
          }
        },
        {
          field: 'linkedinProfile',
          rules: { 
            pattern: this.patterns.linkedin,
            custom: (value: unknown) => {
              if (typeof value === 'string' && value && !value.includes('linkedin.com')) {
                return 'Please enter a valid LinkedIn URL';
              }
              return null;
            }
          },
          messages: { pattern: 'Please enter a valid LinkedIn profile URL' }
        },
        {
          field: 'termsAccepted',
          rules: { 
            required: true,
            custom: (value: unknown) => {
              if (typeof value === 'boolean' && !value) return 'You must accept the terms and conditions';
              return null;
            }
          },
          messages: { required: 'You must accept the terms and conditions' }
        }
      ]
    };

    return validations[step] || [];
  }

  /**
   * Real-time field validation for better UX
   */
  getFieldStatus(value: unknown, rules: ValidationRule): 'valid' | 'invalid' | 'neutral' {
    if (!value) return 'neutral';
    const error = this.validateField(value, rules);
    return error ? 'invalid' : 'valid';
  }

  /**
   * Check if email domain exists (basic DNS check)
   */
  async validateEmailDomain(email: string): Promise<boolean> {
    // In production, this would make an API call to verify domain
    // For now, just check format
    return this.patterns.email.test(email);
  }

  /**
   * Validate file upload
   */
  validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): string | null {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'] } = options;
    
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    
    return null;
  }
}

// Export singleton instance
export const formValidator = new FormValidator();

// Helper function for conditional validation
export function conditionalValidation(
  condition: boolean,
  rules: ValidationRule,
  messages?: unknown
): FieldValidation | null {
  if (!condition) return null;
  
  return {
    field: '',
    rules,
    messages
  };
}

// Types are already exported at the top of the file