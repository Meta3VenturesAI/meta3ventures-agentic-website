/**
 * Market & Funding Step Component
 * Extracted from MultiStepApplication.tsx for better modularity
 */

import React from 'react';
import { StepComponentProps } from '../types/FormData';
import FileUploadZone from '../../FileUploadZone';

const MarketFundingStep: React.FC<StepComponentProps> = ({
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

  const handleFileChange = (fieldName: 'pitchDeck' | 'businessPlan') => (files: File[]) => {
    onFieldChange(fieldName, files);
  };

  return (
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
          onBlur={() => handleBlur('targetMarket')}
          rows={4}
          required
          maxLength={1500}
          placeholder="Describe your target market, customer segments, and market size. Who are your customers? (minimum 50 characters)"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${touchedFields.has('targetMarket') && errors.targetMarket 
              ? 'border-red-500' 
              : touchedFields.has('targetMarket') && (formData.targetMarket?.length || 0) >= 50 
                ? 'border-green-500' 
                : 'border-gray-300'}`}
        />
        {touchedFields.has('targetMarket') && errors.targetMarket && (
          <p className="mt-1 text-sm text-red-600">{errors.targetMarket}</p>
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
            onBlur={() => handleBlur('fundingSought')}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${touchedFields.has('fundingSought') && errors.fundingSought 
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
          {touchedFields.has('fundingSought') && errors.fundingSought && (
            <p className="mt-1 text-sm text-red-600">{errors.fundingSought}</p>
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
  );
};

export { MarketFundingStep };
export default MarketFundingStep;
