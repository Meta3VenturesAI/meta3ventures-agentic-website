/**
 * Multi-Step Application Form Types
 * Extracted from MultiStepApplication.tsx for better modularity
 */

export interface FormData {
  // Step 1: Company Info
  companyName: string;
  website: string;
  industry: string;
  otherIndustry?: string; // Conditional field
  companyStage: string;
  companyDescription: string;
  foundedYear: string;
  location: string;
  
  // Step 2: Technology
  technologyFocus: string;
  otherTechnology?: string; // Conditional field
  productDescription: string;
  competitiveAdvantage: string;
  developmentStatus: string;
  patents: string;
  patentDetails?: string; // Conditional field
  
  // Step 3: Market & Funding
  targetMarket: string;
  revenueStatus: string;
  revenueDetails?: string; // Conditional field
  currentUsers: string;
  fundingSought: string;
  previousFunding: string;
  useOfFunds: string;
  businessModel: string;
  pitchDeck?: File[]; // File upload
  businessPlan?: File[]; // File upload
  
  // Step 4: Team & Contact
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  teamDescription: string;
  teamSize: string;
  linkedinProfiles: string;
  previousExperience: string;
  advisors: string;
  termsAccepted: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface StepValidation {
  isValid: boolean;
  missingFields: string[];
  errors: FormErrors;
}

export interface MultiStepFormProps {
  onSubmit: (_data: FormData) => void;
  initialData?: Partial<FormData>;
  onStepChange?: (_step: number) => void;
}

export interface StepComponentProps {
  formData: FormData;
  errors: FormErrors;
  touchedFields: Set<string>;
  onFieldChange: (_field: keyof FormData, _value: string | boolean | File[]) => void;
  onFieldTouch: (_field: keyof FormData) => void;
  onFieldBlur: (_field: keyof FormData) => void;
}
