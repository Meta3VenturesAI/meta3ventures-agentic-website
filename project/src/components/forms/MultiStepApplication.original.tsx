import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Building, Cpu, TrendingUp, Users, Send, Check } from 'lucide-react';
import { useForm } from '@formspree/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { dataStorage } from '../../services/data-storage.service';
import { formValidator } from '../../utils/formValidation';
import { hubspotService } from '../../services/hubspot.service';
import ProgressIndicator from './ProgressIndicator';
import FileUploadZone from './FileUploadZone';

interface FormData {
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
  linkedinProfile: string;
  additionalInfo: string;
  referralSource: string;
  referralName?: string; // Conditional field
  termsAccepted: boolean;
  newsletterOptIn: boolean;
}

export const MultiStepApplication: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [state, handleSubmit] = useForm("myzwnkkp");
  const navigate = useNavigate();
  const startTime = useRef(Date.now());
  const formId = 'multi-step-application';
  
  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Company Info', icon: Building, fields: 7 },
    { number: 2, title: 'Technology', icon: Cpu, fields: 5 },
    { number: 3, title: 'Market & Funding', icon: TrendingUp, fields: 8 },
    { number: 4, title: 'Team & Contact', icon: Users, fields: 11 },
  ];

  // Calculate total fields and completed fields for progress tracking
  const calculateProgress = useCallback(() => {
    const requiredFields = [
      // Step 1
      'companyName', 'industry', 'companyStage', 'companyDescription', 'location',
      // Step 2
      'technologyFocus', 'productDescription', 'competitiveAdvantage', 'developmentStatus',
      // Step 3
      'targetMarket', 'fundingSought',
      // Step 4
      'contactName', 'contactRole', 'contactEmail', 'teamDescription', 'termsAccepted'
    ];

    // Add conditional required fields
    if (formData.industry === 'other') requiredFields.push('otherIndustry');
    if (formData.technologyFocus === 'other') requiredFields.push('otherTechnology');
    if (formData.patents === 'filed' || formData.patents === 'granted') requiredFields.push('patentDetails');
    if (formData.referralSource === 'referral') requiredFields.push('referralName');

    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return value !== undefined && value !== '' && value !== false;
    });

    return {
      totalFields: requiredFields.length,
      completedFields: completedFields.length
    };
  }, [formData]);

  // Clean up any existing saved data when component mounts
  useEffect(() => {
    localStorage.removeItem(`form_draft_${formId}`);
  }, []);

  // Form submission effect with detailed debugging
  useEffect(() => {
    console.log('📊 Formspree state changed:', { 
      succeeded: state.succeeded, 
      submitting: state.submitting, 
      errors: state.errors,
      timestamp: new Date().toISOString()
    });
    
    if (state.errors && (state.errors.getFormErrors().length > 0 || state.errors.getAllFieldErrors().length > 0)) {
      console.error('❌ Formspree submission errors:', state.errors);
      toast.error('Form submission failed. Please check your connection and try again.');
      
      // Track the submission failure
      dataStorage.trackEvent({
        event_type: 'application_submission_failed',
        event_data: {
          errors: state.errors,
          form_data_keys: Object.keys(formData)
        }
      }).catch(err => console.error('Failed to track error event:', err));
    }
    
    if (state.succeeded) {
      console.log('🎉 Form submission successful! Processing completion tasks...');
      
      // Clear saved data
      localStorage.removeItem(`form_draft_${formId}`);
      console.log('🗑️ Cleared saved form data');
      
      // Store in local database
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      dataStorage.storeFormSubmission({
        type: 'apply',
        data: {
          ...formData,
          formType: 'multi_step_application',
          completedSteps: 4,
          timeSpentSeconds: timeSpent,
          submittedAt: new Date().toISOString()
        },
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          sessionId: sessionStorage.getItem('session_id') || ''
        }
      }).then(() => {
        console.log('💾 Application data stored successfully');
      }).catch(err => {
        console.error('❌ Failed to store application data:', err);
      });
      
      // Track the successful completion
      dataStorage.trackEvent({
        event_type: 'application_completed',
        event_data: {
          steps_completed: 4,
          industry: formData.industry,
          funding_sought: formData.fundingSought,
          company_stage: formData.companyStage,
          time_spent_seconds: timeSpent
        }
      }).catch(err => console.error('Failed to track completion event:', err));
      
      toast.success('Application submitted successfully! We\'ll review it and get back to you within 48 hours.');
      console.log('✅ Success toast displayed');
      
      setTimeout(() => {
        console.log('🔄 Redirecting to home page...');
        navigate('/');
      }, 3000);
    }
    
    if (state.submitting) {
      console.log('⏳ Form is currently submitting to Formspree...');
    }
    
  }, [state.succeeded, state.submitting, state.errors, navigate, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(name));

    // Validate field
    const validationRules = formValidator.getApplicationValidationRules(currentStep);
    const fieldValidation = validationRules.find(v => v.field === name);
    if (fieldValidation) {
      const error = formValidator.validateField(value, fieldValidation.rules, fieldValidation.messages);
      setFieldErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
      });
    }
  };

  const handleFileChange = (field: string) => (files: File[]) => {
    setFormData(prev => ({ ...prev, [field]: files }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const validateStep = (step: number): boolean => {
    const validationRules = formValidator.getApplicationValidationRules(step);
    const validation = formValidator.validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      // Mark all fields in this step as touched to show errors
      validationRules.forEach(rule => {
        setTouchedFields(prev => new Set(prev).add(rule.field));
      });
    }
    
    return validation.isValid;
  };

  // Mark all required fields in current step as touched to show validation
  const markStepFieldsAsTouched = (step: number) => {
    const requiredFields: Record<number, string[]> = {
      1: ['companyName', 'industry', 'companyStage', 'companyDescription', 'location'],
      2: ['technologyFocus', 'productDescription', 'competitiveAdvantage', 'developmentStatus'],
      3: ['targetMarket', 'fundingSought'],
      4: ['contactName', 'contactRole', 'contactEmail', 'teamDescription', 'termsAccepted']
    };
    
    const fields = requiredFields[step] || [];
    fields.forEach(field => {
      setTouchedFields(prev => new Set(prev).add(field));
    });
    
    // Also mark conditional fields if needed
    if (step === 1 && formData.industry === 'other') {
      setTouchedFields(prev => new Set(prev).add('otherIndustry'));
    }
    if (step === 2 && formData.technologyFocus === 'other') {
      setTouchedFields(prev => new Set(prev).add('otherTechnology'));
    }
  };

  const handleNext = () => {
    // Mark all required fields as touched to show validation
    markStepFieldsAsTouched(currentStep);
    
    // First validate to get specific errors
    const isValid = validateStep(currentStep);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      // Clear errors when moving to next step
      setFieldErrors({});
    } else {
      // Show specific error message with field names
      const missingFields: string[] = [];
      
      // Check which fields are missing based on current step
      if (currentStep === 1) {
        if (!formData.companyName) missingFields.push('Company Name');
        if (!formData.industry) missingFields.push('Industry');
        if (!formData.companyStage) missingFields.push('Company Stage');
        if (!formData.companyDescription) missingFields.push('Company Description');
        if (!formData.location) missingFields.push('Location');
        if (formData.industry === 'other' && !formData.otherIndustry) missingFields.push('Industry Specification');
      } else if (currentStep === 2) {
        if (!formData.technologyFocus) missingFields.push('Technology Focus');
        if (!formData.productDescription) missingFields.push('Product Description');
        if (!formData.competitiveAdvantage) missingFields.push('Competitive Advantage');
        if (!formData.developmentStatus) missingFields.push('Development Status');
        if (formData.technologyFocus === 'other' && !formData.otherTechnology) missingFields.push('Technology Specification');
      } else if (currentStep === 3) {
        if (!formData.targetMarket) missingFields.push('Target Market');
        if (!formData.fundingSought) missingFields.push('Funding Sought');
      } else if (currentStep === 4) {
        if (!formData.contactName) missingFields.push('Contact Name');
        if (!formData.contactRole) missingFields.push('Role/Title');
        if (!formData.contactEmail) missingFields.push('Email');
        if (!formData.teamDescription) missingFields.push('Team Description');
        if (!formData.termsAccepted) missingFields.push('Terms Acceptance');
      }
      
      // Show detailed error message
      if (missingFields.length > 0) {
        toast.error(`Please complete the following fields: ${missingFields.join(', ')}`, {
          duration: 5000,
        });
      } else {
        toast.error('Please correct the errors in the form', {
          duration: 4000,
        });
      }
      
      // Focus on first error field
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500') as HTMLElement;
        if (firstErrorField) {
          firstErrorField.focus();
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🚀 Final submit triggered, current step:', currentStep);
    console.log('📋 Form data:', formData);
    console.log('📊 Formspree state before submission:', { succeeded: state.succeeded, submitting: state.submitting, errors: state.errors });
    
    // Validate first, prevent submission if validation fails
    if (!validateStep(currentStep)) {
      console.log('❌ Validation failed for step:', currentStep);
      e.preventDefault();
      toast.error('Please complete all required fields');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with submission');
    
    // Run our additional logic immediately (before Formspree submission)
    try {
      console.log('🔧 Running pre-submission tasks...');
      
      // Track completion attempt (non-blocking)
      dataStorage.trackEvent({
        event_type: 'application_submission_started',
        event_data: {
          steps_completed: 4,
          industry: formData.industry,
          funding_sought: formData.fundingSought,
          company_stage: formData.companyStage
        }
      }).catch(err => console.error('Failed to track event:', err));
      
      // Submit to HubSpot CRM (non-blocking)
      hubspotService.submitApplication(formData)
        .then(() => console.log('✅ Application submitted to HubSpot'))
        .catch(err => console.error('❌ Failed to submit to HubSpot:', err));
      
    } catch (err) {
      console.error('❌ Error in pre-submission tasks:', err);
    }
    
    console.log('🔄 About to call Formspree handleSubmit function...');
    
    // Let Formspree handle the form submission
    // The state changes will be handled in the useEffect
    handleSubmit(e);
    
    console.log('📤 Formspree handleSubmit called');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Apply for Funding</h1>
          <p className="text-xl opacity-95 max-w-2xl mx-auto">
            Join Meta3Ventures portfolio and accelerate your AI/Web3 startup to the next level
          </p>
        </div>

        {/* Enhanced Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          completedFields={calculateProgress().completedFields}
          totalFields={calculateProgress().totalFields}
          estimatedTime={15}
          stepNames={steps.map(s => s.title)}
          showPercentage={true}
          showFieldCount={true}
          showTimeEstimate={true}
        />

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div key={step.number} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-semibold
                      transition-all duration-300 mb-2
                      ${isCompleted ? 'bg-green-500 text-white' : 
                        isActive ? 'bg-white text-indigo-600 shadow-lg scale-110' : 
                        'bg-gray-300 text-gray-600'}
                    `}>
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-300'}`}>
                      {step.title}
                    </span>
                  </div>
                  {step.number < totalSteps && (
                    <div className={`
                      absolute top-6 left-[50%] w-full h-0.5
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleFinalSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Company Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('companyName') && fieldErrors.companyName 
                        ? 'border-red-500' 
                        : touchedFields.has('companyName') && formData.companyName 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  />
                  {touchedFields.has('companyName') && fieldErrors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.companyName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourcompany.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Industry</option>
                    <option value="ai-ml">AI & Machine Learning</option>
                    <option value="blockchain">Blockchain & Web3</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="saas">Enterprise SaaS</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="edtech">EdTech</option>
                    <option value="other">Other</option>
                  </select>
                  {touchedFields.has('industry') && fieldErrors.industry && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.industry}</p>
                  )}
                </div>
                
                {/* Conditional field for Other Industry */}
                {formData.industry === 'other' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify your industry *
                    </label>
                    <input
                      type="text"
                      name="otherIndustry"
                      value={formData.otherIndustry || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your industry"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                        ${touchedFields.has('otherIndustry') && fieldErrors.otherIndustry 
                          ? 'border-red-500' 
                          : 'border-gray-300'}`}
                    />
                    {touchedFields.has('otherIndustry') && fieldErrors.otherIndustry && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.otherIndustry}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Stage *
                  </label>
                  <select
                    name="companyStage"
                    value={formData.companyStage || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('companyStage'))}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('companyStage') && fieldErrors.companyStage 
                        ? 'border-red-500' 
                        : touchedFields.has('companyStage') && formData.companyStage 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  >
                    <option value="">Select Stage</option>
                    <option value="idea">Idea Stage</option>
                    <option value="prototype">Prototype/MVP</option>
                    <option value="early-revenue">Early Revenue</option>
                    <option value="growth">Growth Stage</option>
                  </select>
                  {touchedFields.has('companyStage') && fieldErrors.companyStage && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.companyStage}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('companyDescription'))}
                  rows={4}
                  required
                  placeholder="Provide a brief description of your company, the problem you're solving, and your unique value proposition."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('companyDescription') && fieldErrors.companyDescription 
                      ? 'border-red-500' 
                      : touchedFields.has('companyDescription') && formData.companyDescription 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                />
                {touchedFields.has('companyDescription') && fieldErrors.companyDescription && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.companyDescription}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear || ''}
                    onChange={handleInputChange}
                    min="2020"
                    max="2025"
                    placeholder="2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('location'))}
                    required
                    placeholder="City, Country"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('location') && fieldErrors.location 
                        ? 'border-red-500' 
                        : touchedFields.has('location') && formData.location 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  />
                  {touchedFields.has('location') && fieldErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Technology */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Technology & Product</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technology Focus *
                </label>
                <select
                  name="technologyFocus"
                  value={formData.technologyFocus || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('technologyFocus'))}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('technologyFocus') && fieldErrors.technologyFocus 
                      ? 'border-red-500' 
                      : touchedFields.has('technologyFocus') && formData.technologyFocus 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                >
                  <option value="">Select Focus Area</option>
                  <option value="generative-ai">Generative AI</option>
                  <option value="machine-learning">Machine Learning</option>
                  <option value="computer-vision">Computer Vision</option>
                  <option value="nlp">Natural Language Processing</option>
                  <option value="blockchain">Blockchain/DeFi</option>
                  <option value="iot">IoT & Edge Computing</option>
                  <option value="quantum">Quantum Computing</option>
                  <option value="other">Other</option>
                </select>
                {touchedFields.has('technologyFocus') && fieldErrors.technologyFocus && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.technologyFocus}</p>
                )}
              </div>
              
              {/* Conditional field for Other Technology */}
              {formData.technologyFocus === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify your technology *
                  </label>
                  <input
                    type="text"
                    name="otherTechnology"
                    value={formData.otherTechnology || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your technology focus"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description *
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.productDescription?.length || 0}/2000 characters, min. 50)
                  </span>
                </label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('productDescription'))}
                  rows={4}
                  required
                  maxLength={2000}
                  placeholder="Describe your product or solution in detail. What does it do? How does it work? What makes it innovative? (minimum 50 characters)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('productDescription') && fieldErrors.productDescription 
                      ? 'border-red-500' 
                      : touchedFields.has('productDescription') && (formData.productDescription?.length || 0) >= 50 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                />
                {touchedFields.has('productDescription') && fieldErrors.productDescription && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.productDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitive Advantage *
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.competitiveAdvantage?.length || 0}/1000 characters, min. 30)
                  </span>
                </label>
                <textarea
                  name="competitiveAdvantage"
                  value={formData.competitiveAdvantage || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('competitiveAdvantage'))}
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="What makes your solution unique? What technological advantages do you have over competitors? (minimum 30 characters)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('competitiveAdvantage') && fieldErrors.competitiveAdvantage 
                      ? 'border-red-500' 
                      : touchedFields.has('competitiveAdvantage') && (formData.competitiveAdvantage?.length || 0) >= 30 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                />
                {touchedFields.has('competitiveAdvantage') && fieldErrors.competitiveAdvantage && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.competitiveAdvantage}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Development Status *
                  </label>
                  <select
                    name="developmentStatus"
                    value={formData.developmentStatus || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('developmentStatus'))}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('developmentStatus') && fieldErrors.developmentStatus 
                        ? 'border-red-500' 
                        : touchedFields.has('developmentStatus') && formData.developmentStatus 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  >
                    <option value="">Select Status</option>
                    <option value="concept">Concept/Design</option>
                    <option value="development">In Development</option>
                    <option value="beta">Beta/Testing</option>
                    <option value="launched">Launched</option>
                    <option value="scaling">Scaling</option>
                  </select>
                  {touchedFields.has('developmentStatus') && fieldErrors.developmentStatus && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.developmentStatus}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patents/IP
                  </label>
                  <select
                    name="patents"
                    value={formData.patents || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="filed">Patent(s) Filed</option>
                    <option value="granted">Patent(s) Granted</option>
                    <option value="pending">Patent Pending</option>
                    <option value="none">No Patents</option>
                  </select>
                </div>
              </div>
              
              {/* Conditional field for Patent Details */}
              {(formData.patents === 'filed' || formData.patents === 'granted') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patent Details *
                  </label>
                  <textarea
                    name="patentDetails"
                    value={formData.patentDetails || ''}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    placeholder="Please describe your patents, including patent numbers if granted"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Market & Funding */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Market & Funding</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Market *
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.targetMarket?.length || 0}/1500 characters, min. 50)
                  </span>
                </label>
                <textarea
                  name="targetMarket"
                  value={formData.targetMarket || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('targetMarket'))}
                  rows={4}
                  required
                  maxLength={1500}
                  placeholder="Describe your target market, customer segments, and market size. Who are your customers? (minimum 50 characters)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('targetMarket') && fieldErrors.targetMarket 
                      ? 'border-red-500' 
                      : touchedFields.has('targetMarket') && (formData.targetMarket?.length || 0) >= 50 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                />
                {touchedFields.has('targetMarket') && fieldErrors.targetMarket && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.targetMarket}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Status
                  </label>
                  <select
                    name="revenueStatus"
                    value={formData.revenueStatus || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="pre-revenue">Pre-Revenue</option>
                    <option value="0-100k">$0 - $100K ARR</option>
                    <option value="100k-500k">$100K - $500K ARR</option>
                    <option value="500k-1m">$500K - $1M ARR</option>
                    <option value="1m+">$1M+ ARR</option>
                  </select>
                  
                  {/* Conditional field for Revenue Details */}
                  {formData.revenueStatus && formData.revenueStatus !== 'pre-revenue' && (
                    <div className="col-span-2 mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Revenue Details
                      </label>
                      <input
                        type="text"
                        name="revenueDetails"
                        value={formData.revenueDetails || ''}
                        onChange={handleInputChange}
                        placeholder="Monthly recurring revenue, growth rate, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Users/Customers
                  </label>
                  <input
                    type="text"
                    name="currentUsers"
                    value={formData.currentUsers || ''}
                    onChange={handleInputChange}
                    placeholder="Number of users/customers"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Sought *
                  </label>
                  <select
                    name="fundingSought"
                    value={formData.fundingSought || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('fundingSought'))}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('fundingSought') && fieldErrors.fundingSought 
                        ? 'border-red-500' 
                        : touchedFields.has('fundingSought') && formData.fundingSought 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  >
                    <option value="">Select Amount</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-500k">$250K - $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="1m-2m">$1M - $2M</option>
                    <option value="2m-5m">$2M - $5M</option>
                    <option value="5m+">$5M+</option>
                  </select>
                  {touchedFields.has('fundingSought') && fieldErrors.fundingSought && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fundingSought}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Funding
                  </label>
                  <select
                    name="previousFunding"
                    value={formData.previousFunding || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="none">No Previous Funding</option>
                    <option value="friends-family">Friends & Family</option>
                    <option value="angel">Angel Investment</option>
                    <option value="pre-seed">Pre-Seed Round</option>
                    <option value="seed">Seed Round</option>
                    <option value="series-a">Series A</option>
                    <option value="grants">Grants</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use of Funds
                </label>
                <textarea
                  name="useOfFunds"
                  value={formData.useOfFunds || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="How will you use the funding? (e.g., product development, team expansion, marketing, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Model
                </label>
                <textarea
                  name="businessModel"
                  value={formData.businessModel || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your revenue model and go-to-market strategy."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {/* File Upload Section */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">Supporting Documents</h3>
                
                <div>
                  <FileUploadZone
                    id="pitchDeck"
                    label="Pitch Deck"
                    accept={['.pdf', '.ppt', '.pptx']}
                    maxSize={10}
                    maxFiles={1}
                    value={formData.pitchDeck}
                    onChange={handleFileChange('pitchDeck')}
                    helperText="Upload your pitch deck (PDF or PowerPoint, max 10MB)"
                  />
                </div>
                
                <div>
                  <FileUploadZone
                    id="businessPlan"
                    label="Business Plan (Optional)"
                    accept={['.pdf', '.doc', '.docx']}
                    maxSize={10}
                    maxFiles={1}
                    value={formData.businessPlan}
                    onChange={handleFileChange('businessPlan')}
                    helperText="Upload your business plan if available (PDF or Word, max 10MB)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team & Contact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Team & Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('contactName'))}
                    required
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('contactName') && fieldErrors.contactName 
                        ? 'border-red-500' 
                        : touchedFields.has('contactName') && formData.contactName 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  />
                  {touchedFields.has('contactName') && fieldErrors.contactName && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.contactName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    name="contactRole"
                    value={formData.contactRole || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('contactRole'))}
                    required
                    placeholder="e.g., CEO, CTO, Founder"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('contactRole') && fieldErrors.contactRole 
                        ? 'border-red-500' 
                        : touchedFields.has('contactRole') && formData.contactRole 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  />
                  {touchedFields.has('contactRole') && fieldErrors.contactRole && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.contactRole}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => new Set(prev).add('contactEmail'))}
                    required
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${touchedFields.has('contactEmail') && fieldErrors.contactEmail 
                        ? 'border-red-500' 
                        : touchedFields.has('contactEmail') && formData.contactEmail 
                          ? 'border-green-500' 
                          : 'border-gray-300'}`}
                  />
                  {touchedFields.has('contactEmail') && fieldErrors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.contactEmail}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Description *
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.teamDescription?.length || 0}/2000 characters, min. 50)
                  </span>
                </label>
                <textarea
                  name="teamDescription"
                  value={formData.teamDescription || ''}
                  onChange={handleInputChange}
                  onBlur={() => setTouchedFields(prev => new Set(prev).add('teamDescription'))}
                  rows={4}
                  required
                  maxLength={2000}
                  placeholder="Describe your founding team. Include backgrounds, relevant experience, and key skills. (minimum 50 characters)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    ${touchedFields.has('teamDescription') && fieldErrors.teamDescription 
                      ? 'border-red-500' 
                      : touchedFields.has('teamDescription') && (formData.teamDescription?.length || 0) >= 50 
                        ? 'border-green-500' 
                        : 'border-gray-300'}`}
                />
                {touchedFields.has('teamDescription') && fieldErrors.teamDescription && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.teamDescription}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    <option value="1-2">1-2 people</option>
                    <option value="3-5">3-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="20+">20+ people</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile || ''}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information you'd like to share? (partnerships, advisors, press coverage, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about us?
                </label>
                <select
                  name="referralSource"
                  value={formData.referralSource || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Source</option>
                  <option value="web-search">Web Search</option>
                  <option value="social-media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="event">Event/Conference</option>
                  <option value="portfolio">Portfolio Company</option>
                  <option value="press">Press/Media</option>
                  <option value="other">Other</option>
                </select>
                
                {/* Conditional field for Referral Name */}
                {formData.referralSource === 'referral' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Name *
                    </label>
                    <input
                      type="text"
                      name="referralName"
                      value={formData.referralName || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Who referred you?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted || false}
                    onChange={handleInputChange}
                    required
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm that all information provided is accurate and I accept the terms and conditions of the application process. *
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="newsletterOptIn"
                    checked={formData.newsletterOptIn || false}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-600">
                    I'd like to receive updates and insights from Meta3Ventures
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Hidden fields for Formspree submission - all form data */}
          {currentStep === totalSteps && (
            <>
              <input type="hidden" name="formType" value="multi_step_application" />
              <input type="hidden" name="completedSteps" value="4" />
              <input type="hidden" name="submissionDate" value={new Date().toISOString()} />
              
              {/* Step 1 Data */}
              <input type="hidden" name="companyName" value={formData.companyName || ''} />
              <input type="hidden" name="website" value={formData.website || ''} />
              <input type="hidden" name="industry" value={formData.industry || ''} />
              <input type="hidden" name="otherIndustry" value={formData.otherIndustry || ''} />
              <input type="hidden" name="companyStage" value={formData.companyStage || ''} />
              <input type="hidden" name="companyDescription" value={formData.companyDescription || ''} />
              <input type="hidden" name="foundedYear" value={formData.foundedYear || ''} />
              <input type="hidden" name="location" value={formData.location || ''} />
              
              {/* Step 2 Data */}
              <input type="hidden" name="technologyFocus" value={formData.technologyFocus || ''} />
              <input type="hidden" name="otherTechnology" value={formData.otherTechnology || ''} />
              <input type="hidden" name="productDescription" value={formData.productDescription || ''} />
              <input type="hidden" name="competitiveAdvantage" value={formData.competitiveAdvantage || ''} />
              <input type="hidden" name="developmentStatus" value={formData.developmentStatus || ''} />
              <input type="hidden" name="patents" value={formData.patents || ''} />
              <input type="hidden" name="patentDetails" value={formData.patentDetails || ''} />
              
              {/* Step 3 Data */}
              <input type="hidden" name="targetMarket" value={formData.targetMarket || ''} />
              <input type="hidden" name="revenueStatus" value={formData.revenueStatus || ''} />
              <input type="hidden" name="revenueDetails" value={formData.revenueDetails || ''} />
              <input type="hidden" name="currentUsers" value={formData.currentUsers || ''} />
              <input type="hidden" name="fundingSought" value={formData.fundingSought || ''} />
              <input type="hidden" name="previousFunding" value={formData.previousFunding || ''} />
              <input type="hidden" name="useOfFunds" value={formData.useOfFunds || ''} />
              <input type="hidden" name="businessModel" value={formData.businessModel || ''} />
              
              {/* Step 4 Data (visible fields are already included) */}
              <input type="hidden" name="teamSize" value={formData.teamSize || ''} />
              <input type="hidden" name="referralSource" value={formData.referralSource || ''} />
              <input type="hidden" name="referralName" value={formData.referralName || ''} />
              
              {/* Files - convert to JSON string for email */}
              <input type="hidden" name="attachedFiles" value={
                JSON.stringify({
                  pitchDeck: formData.pitchDeck?.map(f => f.name) || [],
                  businessPlan: formData.businessPlan?.map(f => f.name) || []
                })
              } />
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`
                flex items-center px-6 py-3 rounded-lg font-medium transition-all
                ${currentStep === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={state.submitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {state.submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Send className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center text-white/90">
          <p>Need help? Contact us at <a href="mailto:apply@meta3ventures.com" className="underline">apply@meta3ventures.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default MultiStepApplication;