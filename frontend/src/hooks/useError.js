import { useContext } from 'react';
import ErrorContext from '../contexts/ErrorContext';

/**
 * Custom hook to use ErrorContext
 * @returns {object} Error context object with all error handling utilities
 */
const useError = () => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }

  return context;
};

export default useError;
