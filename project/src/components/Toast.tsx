import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: 'dark:bg-gray-800 dark:text-white',
        style: {
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4F46E5',
            secondary: '#fff',
          },
          style: {
            background: '#047857',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            background: '#DC2626',
            color: '#fff',
          },
        },
      }}
    />
  );
};