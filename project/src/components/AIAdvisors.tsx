import React, { lazy, Suspense } from 'react';
import { AIAdvisorErrorBoundary } from './AIAdvisorErrorBoundary';

// All agents removed from public access - now admin-only
// const VentureLaunchBuilder = lazy(() => import('./VentureLaunchBuilder'));

// Loading placeholder for lazy components
const AdvisorLoadingPlaceholder = () => (
  <div className="fixed bottom-6 right-6 w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
);

// Main component that wraps only the public AI advisor with lazy loading and error handling
export const AIAdvisors: React.FC = () => {
  const handleAdvisorError = (error: Error, errorInfo: React.ErrorInfo) => {
    // You could send this to your analytics service
    console.error('AI Advisor crashed:', error, errorInfo);
  };

  return (
    <>
      <AIAdvisorErrorBoundary onError={handleAdvisorError}>
        {/* All agents removed from public access - now admin-only */}
        {/* <Suspense fallback={<AdvisorLoadingPlaceholder />}>
          <VentureLaunchBuilder />
        </Suspense> */}
      </AIAdvisorErrorBoundary>
    </>
  );
};