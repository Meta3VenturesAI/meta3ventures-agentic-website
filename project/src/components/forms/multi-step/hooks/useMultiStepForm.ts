/**
 * Multi-Step Form Management Hook
 * Extracted from MultiStepApplication.tsx for better modularity and reusability
 */

import { useState, useCallback } from 'react';
import { FormData, FormErrors, StepValidation } from '../types/FormData';
import { formValidator } from '../../../../utils/formValidation';

export const useMultiStepForm = (initialData?: Partial<FormData>) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Company Info
    companyName: '',
    website: '',
    industry: '',
    otherIndustry: '',
    companyStage: '',
    companyDescription: '',
    foundedYear: '',
    location: '',
    
    // Step 2: Technology
    technologyFocus: '',
    otherTechnology: '',
    productDescription: '',
    competitiveAdvantage: '',
    developmentStatus: '',
    patents: '',
    patentDetails: '',
    
    // Step 3: Market & Funding
    targetMarket: '',
    revenueStatus: '',
    revenueDetails: '',
    currentUsers: '',
    fundingSought: '',
    previousFunding: '',
    useOfFunds: '',
    businessModel: '',
    pitchDeck: [],
    businessPlan: [],
    
    // Step 4: Team & Contact
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    teamDescription: '',
    teamSize: '',
    linkedinProfiles: '',
    previousExperience: '',
    advisors: '',
    termsAccepted: false,
    
    ...initialData
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const totalSteps = 4;

  // Field change handler
  const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  // Field touch handler - only mark as touched, don't validate immediately
  const handleFieldTouch = useCallback((field: keyof FormData) => {
    setTouchedFields(prev => new Set(prev).add(field));
  }, []);

  // Field blur handler - validate when user leaves field
  const handleFieldBlur = useCallback((field: keyof FormData) => {
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validate field on blur
    const value = formData[field];
    if (typeof value === 'string' && value.trim() === '') {
      setFieldErrors(prev => ({
        ...prev,
        [field]: `${field} is required`
      }));
    } else if (field === 'contactEmail' && typeof value === 'string') {
      const emailError = formValidator.validateField(value, { email: true });
      if (emailError) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: emailError
        }));
      } else {
        // Clear email error if validation passes
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else if (value && typeof value === 'string' && value.trim() !== '') {
      // Clear error if field has value
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData]);

  // Step validation
  const validateStep = useCallback((step: number): StepValidation => {
    const missingFields: string[] = [];
    const errors: FormErrors = {};

    if (step === 1) {
      if (!formData.companyName) missingFields.push('Company Name');
      if (!formData.industry) missingFields.push('Industry');
      if (!formData.companyStage) missingFields.push('Company Stage');
      if (!formData.companyDescription) missingFields.push('Company Description');
      if (!formData.location) missingFields.push('Location');
      if (formData.industry === 'other' && !formData.otherIndustry) missingFields.push('Industry Specification');
    } else if (step === 2) {
      if (!formData.technologyFocus) missingFields.push('Technology Focus');
      if (!formData.productDescription) missingFields.push('Product Description');
      if (!formData.competitiveAdvantage) missingFields.push('Competitive Advantage');
      if (!formData.developmentStatus) missingFields.push('Development Status');
      if (formData.technologyFocus === 'other' && !formData.otherTechnology) missingFields.push('Technology Specification');
    } else if (step === 3) {
      if (!formData.targetMarket) missingFields.push('Target Market');
      if (!formData.fundingSought) missingFields.push('Funding Sought');
    } else if (step === 4) {
      if (!formData.contactName) missingFields.push('Contact Name');
      if (!formData.contactRole) missingFields.push('Role/Title');
      if (!formData.contactEmail) missingFields.push('Email');
      if (!formData.teamDescription) missingFields.push('Team Description');
      if (!formData.termsAccepted) missingFields.push('Terms Acceptance');
      
      // Email validation
      if (formData.contactEmail) {
        const emailError = formValidator.validateField(formData.contactEmail, { email: true });
        if (emailError) {
          errors.contactEmail = emailError;
          missingFields.push('Valid Email');
        }
      }
    }

    return {
      isValid: missingFields.length === 0 && Object.keys(errors).length === 0,
      missingFields,
      errors
    };
  }, [formData]);

  // Mark step fields as touched for validation display
  const markStepFieldsAsTouched = useCallback((step: number) => {
    const stepFields: { [key: number]: (keyof FormData)[] } = {
      1: ['companyName', 'industry', 'companyStage', 'companyDescription', 'location'],
      2: ['technologyFocus', 'productDescription', 'competitiveAdvantage', 'developmentStatus'],
      3: ['targetMarket', 'fundingSought'],
      4: ['contactName', 'contactRole', 'contactEmail', 'teamDescription', 'termsAccepted']
    };

    const fieldsToTouch = stepFields[step] || [];
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      fieldsToTouch.forEach(field => newSet.add(field));
      return newSet;
    });

    // Also mark conditional fields if needed
    if (step === 1 && formData.industry === 'other') {
      setTouchedFields(prev => new Set(prev).add('otherIndustry'));
    }
    if (step === 2 && formData.technologyFocus === 'other') {
      setTouchedFields(prev => new Set(prev).add('otherTechnology'));
    }
  }, [formData.industry, formData.technologyFocus]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      return true;
    } else {
      markStepFieldsAsTouched(currentStep);
      setFieldErrors(validation.errors);
      return false;
    }
  }, [currentStep, validateStep, markStepFieldsAsTouched]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, []);

  return {
    // State
    currentStep,
    formData,
    touchedFields,
    fieldErrors,
    totalSteps,
    
    // Handlers
    handleFieldChange,
    handleFieldTouch,
    handleFieldBlur,
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    
    // Validation
    validateStep,
    markStepFieldsAsTouched,
    
    // Computed
    canGoNext: validateStep(currentStep).isValid,
    canGoPrevious: currentStep > 1,
    isLastStep: currentStep === totalSteps
  };
};
