import React, { createContext, useState, useCallback, useEffect } from 'react';

// Create Error Context
const ErrorContext = createContext();

// Error Provider Component
export const ErrorProvider = ({ children }) => {
  // Initialize error from localStorage to persist across page refreshes
  const [error, setError] = useState(() => {
    try {
      const stored = localStorage.getItem('appError');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  // Initialize from localStorage to persist across page refreshes
  const [isServerDown, setIsServerDown] = useState(() => {
    try {
      const stored = localStorage.getItem('isServerDown');
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // Save isServerDown state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('isServerDown', String(isServerDown));
    } catch (e) {
      console.error('Failed to save server down state to localStorage:', e);
    }
  }, [isServerDown]);

  // Save error state to localStorage when it changes
  useEffect(() => {
    try {
      if (error) {
        localStorage.setItem('appError', JSON.stringify(error));
      } else {
        localStorage.removeItem('appError');
      }
    } catch (e) {
      console.error('Failed to save error state to localStorage:', e);
    }
  }, [error]);

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
    // Clear from localStorage too
    try {
      localStorage.removeItem('appError');
    } catch (e) {
      console.error('Failed to clear error from localStorage:', e);
    }
  }, []);

  // Function to mark server as recovered
  const markServerRecovered = useCallback(() => {
    setIsServerDown(false);
    clearError();
    setRetryCount(0);
    setIsRecovering(false);
    // Clear the localStorage flags when server is back up
    try {
      localStorage.removeItem('isServerDown');
      localStorage.removeItem('appError');
    } catch (e) {
      console.error('Failed to clear state from localStorage:', e);
    }
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
