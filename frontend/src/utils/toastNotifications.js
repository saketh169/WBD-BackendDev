import { toast } from 'react-toastify';

/**
 * Utility functions for displaying errors to users
 * Using react-toastify for non-critical errors
 */

export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};

/**
 * Format error message for display
 * @param {Error|string} error - Error object or message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Handle API error with toast notification
 * @param {Error} error - Axios error object
 * @param {string} customMessage - Optional custom message
 */
export const handleErrorToast = (error, customMessage = null) => {
  const message = customMessage || formatErrorMessage(error);
  showErrorToast(message);
};

export default {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  formatErrorMessage,
  handleErrorToast,
};
