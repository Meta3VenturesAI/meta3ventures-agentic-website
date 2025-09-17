/**
 * Technology & Product Step Component
 * Extracted from MultiStepApplication.tsx for better modularity
 */

import React from 'react';
import { StepComponentProps } from '../types/FormData';

const TechnologyStep: React.FC<StepComponentProps> = ({
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
      <h2 className="text-2xl font-bold mb-6">Technology & Product</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technology Focus *
        </label>
        <select
          name="technologyFocus"
          value={formData.technologyFocus || ''}
          onChange={handleInputChange}
          onBlur={() => handleBlur('technologyFocus')}
          required
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('technologyFocus') && errors.technologyFocus 
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
        {touchedFields.has('technologyFocus') && errors.technologyFocus && (
          <p className="mt-1 text-sm text-red-600">{errors.technologyFocus}</p>
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
          onBlur={() => handleBlur('productDescription')}
          rows={4}
          required
          maxLength={2000}
          placeholder="Describe your product or solution in detail. What does it do? How does it work? What makes it innovative? (minimum 50 characters)"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('productDescription') && errors.productDescription 
              ? 'border-red-500' 
              : touchedFields.has('productDescription') && (formData.productDescription?.length || 0) >= 50 
                ? 'border-green-500' 
                : 'border-gray-300'}`}
        />
        {touchedFields.has('productDescription') && errors.productDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.productDescription}</p>
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
          onBlur={() => handleBlur('competitiveAdvantage')}
          rows={4}
          required
          maxLength={1000}
          placeholder="What makes your solution unique? What technological advantages do you have over competitors? (minimum 30 characters)"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('competitiveAdvantage') && errors.competitiveAdvantage 
              ? 'border-red-500' 
              : touchedFields.has('competitiveAdvantage') && (formData.competitiveAdvantage?.length || 0) >= 30 
                ? 'border-green-500' 
                : 'border-gray-300'}`}
        />
        {touchedFields.has('competitiveAdvantage') && errors.competitiveAdvantage && (
          <p className="mt-1 text-sm text-red-600">{errors.competitiveAdvantage}</p>
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
            onBlur={() => handleBlur('developmentStatus')}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('developmentStatus') && errors.developmentStatus 
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
          {touchedFields.has('developmentStatus') && errors.developmentStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.developmentStatus}</p>
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
  );
};

export { TechnologyStep };
export default TechnologyStep;
