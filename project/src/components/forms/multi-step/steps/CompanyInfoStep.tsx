/**
 * Company Information Step Component
 * Extracted from MultiStepApplication.tsx for better modularity
 */

import React from 'react';
import { StepComponentProps } from '../types/FormData';

const CompanyInfoStep: React.FC<StepComponentProps> = ({
  formData,
  errors,
  touchedFields,
  onFieldChange,
  onFieldTouch,
  onFieldBlur
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFieldChange(name as keyof typeof formData, value);
    onFieldTouch(name as keyof typeof formData);
  };

  const handleBlur = (fieldName: keyof typeof formData) => {
    onFieldBlur(fieldName);
  };

  return (
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
              ${touchedFields.has('companyName') && errors.companyName 
                ? 'border-red-500' 
                : touchedFields.has('companyName') && formData.companyName 
                  ? 'border-green-500' 
                  : 'border-gray-300'}`}
          />
          {touchedFields.has('companyName') && errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
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
          {touchedFields.has('industry') && errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
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
                ${touchedFields.has('otherIndustry') && errors.otherIndustry 
                  ? 'border-red-500' 
                  : 'border-gray-300'}`}
            />
            {touchedFields.has('otherIndustry') && errors.otherIndustry && (
              <p className="mt-1 text-sm text-red-600">{errors.otherIndustry}</p>
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
            onBlur={() => handleBlur('companyStage')}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('companyStage') && errors.companyStage 
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
          {touchedFields.has('companyStage') && errors.companyStage && (
            <p className="mt-1 text-sm text-red-600">{errors.companyStage}</p>
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
          onBlur={() => handleBlur('companyDescription')}
          rows={4}
          required
          placeholder="Provide a brief description of your company, the problem you're solving, and your unique value proposition."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('companyDescription') && errors.companyDescription 
              ? 'border-red-500' 
              : touchedFields.has('companyDescription') && formData.companyDescription 
                ? 'border-green-500' 
                : 'border-gray-300'}`}
        />
        {touchedFields.has('companyDescription') && errors.companyDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.companyDescription}</p>
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
            onBlur={() => handleBlur('location')}
            required
            placeholder="City, Country"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('location') && errors.location 
                ? 'border-red-500' 
                : touchedFields.has('location') && formData.location 
                  ? 'border-green-500' 
                  : 'border-gray-300'}`}
          />
          {touchedFields.has('location') && errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { CompanyInfoStep };
export default CompanyInfoStep;
