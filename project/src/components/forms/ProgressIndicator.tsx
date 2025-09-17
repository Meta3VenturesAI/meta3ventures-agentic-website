import React from 'react';
import { Check, Clock, CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedFields: number;
  totalFields: number;
  estimatedTime?: number; // in minutes
  stepNames?: string[];
  showPercentage?: boolean;
  showFieldCount?: boolean;
  showTimeEstimate?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedFields,
  totalFields,
  estimatedTime = 5,
  stepNames = [],
  showPercentage = true,
  showFieldCount = true,
  showTimeEstimate = true
}) => {
  const completionPercentage = totalFields > 0 
    ? Math.round((completedFields / totalFields) * 100) 
    : 0;
  
  const remainingFields = totalFields - completedFields;
  const estimatedTimeRemaining = estimatedTime > 0
    ? Math.ceil((remainingFields / totalFields) * estimatedTime)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Application Progress
          </h3>
          {showPercentage && (
            <span className="text-2xl font-bold text-indigo-600">
              {completionPercentage}%
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="h-full flex items-center justify-end pr-2">
                {completionPercentage > 10 && (
                  <span className="text-xs text-white font-medium">
                    {completionPercentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const stepName = stepNames[index] || `Step ${stepNumber}`;
          
          return (
            <div key={stepNumber} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    transition-all duration-300 mb-1
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent
                        ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-200'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className={`
                  text-xs font-medium hidden sm:block
                  ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}
                `}>
                  {stepName}
                </span>
              </div>
              
              {/* Connection Line */}
              {stepNumber < totalSteps && (
                <div 
                  className={`
                    absolute top-5 left-[50%] w-full h-0.5
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        {/* Fields Completed */}
        {showFieldCount && (
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fields</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {completedFields}/{totalFields}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-indigo-500 h-1 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Step</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div 
              className="bg-purple-500 h-1 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Time Remaining */}
        {showTimeEstimate && (
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Time
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ~{estimatedTimeRemaining} min
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              to complete
            </div>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      {completionPercentage > 0 && completionPercentage < 100 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {completionPercentage < 25 && "Great start! Keep going 💪"}
            {completionPercentage >= 25 && completionPercentage < 50 && "You're making progress! 🚀"}
            {completionPercentage >= 50 && completionPercentage < 75 && "Halfway there! You're doing great! 🎯"}
            {completionPercentage >= 75 && completionPercentage < 100 && "Almost done! Just a few more fields! 🏁"}
          </p>
        </div>
      )}

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-green-800">
              All fields completed! Ready to submit your application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Circular Progress Component for sidebar/header
export const CircularProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
}> = ({ percentage, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-indigo-600 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm font-semibold">
        {percentage}%
      </span>
    </div>
  );
};

// Mini Progress Bar for form headers
export const MiniProgress: React.FC<{
  current: number;
  total: number;
}> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-600 font-medium">
        {current}/{total}
      </span>
    </div>
  );
};

export default ProgressIndicator;