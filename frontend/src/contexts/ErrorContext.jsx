import React, { createContext, useState, useCallback, useEffect } from 'react';

// Create Error Context
const ErrorContext = createContext();

// Error Provider Component
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [isServerDown, setIsServerDown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // Function to set error
  const setAppError = useCallback((errorData) => {
    if (errorData) {
      console.error('🔴 ErrorContext: setAppError called with:', errorData);
      
      setError({
        message: errorData.message || 'An unexpected error occurred',
        status: errorData.status || 500,
        type: errorData.type || 'unknown',
        timestamp: new Date().toISOString(),
        details: errorData.details || null,
      });

      // Check if it's a server connection error
      const shouldShowErrorPage = 
        errorData.status === undefined ||
        errorData.status === null ||
        errorData.message?.toLowerCase().includes('network') ||
        errorData.message?.toLowerCase().includes('connect') ||
        errorData.message?.toLowerCase().includes('econnrefused') ||
        errorData.message?.toLowerCase().includes('timeout') ||
        errorData.type === 'network' ||
        errorData.type === 'server_error';
      
      console.log('🔴 ErrorContext: shouldShowErrorPage?', shouldShowErrorPage);
      
      if (shouldShowErrorPage) {
        console.log('🔴 ErrorContext: Setting isServerDown = true');
        setIsServerDown(true);
      } else {
        console.log('🟡 ErrorContext: Not a critical error, component should handle it');
      }
    }
  }, []);

  // Function to clear error
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Function to mark server as recovered
  const markServerRecovered = useCallback(() => {
    setIsServerDown(false);
    clearError();
    setRetryCount(0);
    setIsRecovering(false);
  }, [clearError]);

  // Function to attempt recovery
  const attemptRecovery = useCallback(async () => {
    setIsRecovering(true);
    setRetryCount((prev) => prev + 1);

    try {
      // Try a simple health check request
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        throw new Error('Server health check failed');
      });

      if (response.ok) {
        markServerRecovered();
        return true;
      }
    } catch (err) {
      console.log(`Recovery attempt ${retryCount + 1} failed:`, err.message);
    }

    setIsRecovering(false);
    return false;
  }, [markServerRecovered, retryCount]);

  // Auto-attempt recovery after 5 seconds
  useEffect(() => {
    let recoveryTimer;
    if (isServerDown && !isRecovering) {
      recoveryTimer = setTimeout(() => {
        attemptRecovery();
      }, 5000);
    }

    return () => {
      if (recoveryTimer) clearTimeout(recoveryTimer);
    };
  }, [isServerDown, isRecovering, attemptRecovery]);

  return (
    <ErrorContext.Provider
      value={{
        error,
        setAppError,
        clearError,
        isServerDown,
        retryCount,
        isRecovering,
        markServerRecovered,
        attemptRecovery,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;
