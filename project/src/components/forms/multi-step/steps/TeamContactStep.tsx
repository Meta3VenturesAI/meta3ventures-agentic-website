/**
 * Team & Contact Step Component
 * Extracted from MultiStepApplication.tsx for better modularity
 */

import React from 'react';
import { StepComponentProps } from '../types/FormData';

const TeamContactStep: React.FC<StepComponentProps> = ({
  formData,
  errors,
  touchedFields,
  onFieldChange,
  onFieldTouch,
  onFieldBlur
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    onFieldChange(name as keyof typeof formData, finalValue);
    onFieldTouch(name as keyof typeof formData);
  };

  const handleBlur = (fieldName: keyof typeof formData) => {
    onFieldBlur(fieldName);
  };

  return (
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
            onBlur={() => handleBlur('contactName')}
            required
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('contactName') && errors.contactName 
                ? 'border-red-500' 
                : touchedFields.has('contactName') && formData.contactName 
                  ? 'border-green-500' 
                  : 'border-gray-300'}`}
          />
          {touchedFields.has('contactName') && errors.contactName && (
            <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
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
            onBlur={() => handleBlur('contactRole')}
            required
            placeholder="e.g., CEO, CTO, Founder"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('contactRole') && errors.contactRole 
                ? 'border-red-500' 
                : touchedFields.has('contactRole') && formData.contactRole 
                  ? 'border-green-500' 
                  : 'border-gray-300'}`}
          />
          {touchedFields.has('contactRole') && errors.contactRole && (
            <p className="mt-1 text-sm text-red-600">{errors.contactRole}</p>
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
            onBlur={() => handleBlur('contactEmail')}
            required
            placeholder="your.email@example.com"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('contactEmail') && errors.contactEmail 
                ? 'border-red-500' 
                : touchedFields.has('contactEmail') && formData.contactEmail 
                  ? 'border-green-500' 
                  : 'border-gray-300'}`}
          />
          {touchedFields.has('contactEmail') && errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
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
          onBlur={() => handleBlur('teamDescription')}
          rows={4}
          required
          maxLength={2000}
          placeholder="Describe your founding team. Include backgrounds, relevant experience, and key skills. (minimum 50 characters)"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('teamDescription') && errors.teamDescription 
              ? 'border-red-500' 
              : touchedFields.has('teamDescription') && (formData.teamDescription?.length || 0) >= 50 
                ? 'border-green-500' 
                : 'border-gray-300'}`}
        />
        {touchedFields.has('teamDescription') && errors.teamDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.teamDescription}</p>
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
            LinkedIn Profiles
          </label>
          <input
            type="text"
            name="linkedinProfiles"
            value={formData.linkedinProfiles || ''}
            onChange={handleInputChange}
            placeholder="LinkedIn profiles of key team members"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Previous Experience
        </label>
        <textarea
          name="previousExperience"
          value={formData.previousExperience || ''}
          onChange={handleInputChange}
          rows={3}
          placeholder="Relevant previous experience, exits, notable achievements"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Advisors
        </label>
        <textarea
          name="advisors"
          value={formData.advisors || ''}
          onChange={handleInputChange}
          rows={3}
          placeholder="Key advisors, board members, or notable supporters"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={formData.termsAccepted || false}
            onChange={handleInputChange}
            required
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="termsAccepted" className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
            . I understand that Meta3 Ventures will review my application and may contact me for additional information. *
          </label>
        </div>
        {touchedFields.has('termsAccepted') && errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>
    </div>
  );
};

export { TeamContactStep };
export default TeamContactStep;
