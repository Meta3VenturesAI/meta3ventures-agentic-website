// Form validation utilities

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  }
};

export interface ValidationRule {
  validator: (_value: string) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export const validateForm = (data: Record<string, string>, schema: ValidationSchema) => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach(field => {
    const value = data[field] || '';
    const rules = schema[field];

    for (const rule of rules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation schemas
export const contactFormSchema: ValidationSchema = {
  name: [
    { validator: validators.required, message: 'Name is required' },
    { validator: (v) => validators.minLength(v, 2), message: 'Name must be at least 2 characters' }
  ],
  email: [
    { validator: validators.required, message: 'Email is required' },
    { validator: validators.email, message: 'Please enter a valid email address' }
  ],
  subject: [
    { validator: validators.required, message: 'Subject is required' },
    { validator: (v) => validators.minLength(v, 5), message: 'Subject must be at least 5 characters' }
  ],
  message: [
    { validator: validators.required, message: 'Message is required' },
    { validator: (v) => validators.minLength(v, 10), message: 'Message must be at least 10 characters' }
  ]
};

export const applyFormSchema: ValidationSchema = {
  companyName: [
    { validator: validators.required, message: 'Company name is required' }
  ],
  founderName: [
    { validator: validators.required, message: 'Founder name is required' }
  ],
  email: [
    { validator: validators.required, message: 'Email is required' },
    { validator: validators.email, message: 'Please enter a valid email address' }
  ],
  description: [
    { validator: validators.required, message: 'Company description is required' },
    { validator: (v) => validators.minLength(v, 50), message: 'Description must be at least 50 characters' }
  ],
  fundingNeeds: [
    { validator: validators.required, message: 'Funding needs are required' }
  ]
};