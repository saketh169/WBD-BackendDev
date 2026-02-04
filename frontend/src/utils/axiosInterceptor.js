import axios from 'axios';

let errorHandlerRef = null;
let navigate = null;

/**
 * Setup axios interceptors for global error handling
 * @param {function} setAppError - Function from ErrorContext to set error
 * @param {function} markServerRecovered - Function from ErrorContext to mark server recovered
 * @param {function} navigateFn - Optional navigate function from react-router
 */
export const setupAxiosInterceptors = (setAppError, markServerRecovered, navigateFn = null) => {
  // Store reference to error handler
  errorHandlerRef = setAppError;
  navigate = navigateFn;
  
  // Response interceptor to handle errors
  axios.interceptors.response.use(
    (response) => {
      // If we get a successful response and server was down, mark it recovered
      if (response.status >= 200 && response.status < 300) {
        // Clear any previous errors on successful responses
        return response;
      }
      return response;
    },
    (error) => {
      // Log error details
      console.error('Axios Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });

      // Check for timeout errors (ECONNABORTED or timeout in message)
      if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        const errorData = {
          message: 'Request timed out. The server is taking too long to respond.',
          status: 408,
          type: 'timeout',
          details: {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
          },
        };
        
        console.log('⏱️ TIMEOUT ERROR DETECTED - Triggering error page');
        setAppError(errorData);
        error.isServerDownError = true;
        return Promise.reject(error);
      }

      // Check for network/connection errors (server is down or unreachable)
      if (!error.response) {
        // No response means server is unreachable or network error
        const isNetworkError = 
          error.message === 'Network Error' ||
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ERR_CONNECTION_REFUSED' ||
          !navigator.onLine;

        if (isNetworkError) {
          // Critical: Server is down or network is unavailable
          const errorData = {
            message: 'Unable to connect to server. The backend server may be down or your internet connection is unavailable.',
            status: null,
            type: 'network',
            details: {
              url: error.config?.url,
              method: error.config?.method,
              code: error.code,
            },
          };
          
          console.log('🔴 NETWORK ERROR DETECTED - Triggering error page');
          setAppError(errorData);
          
          // Mark this error so components know not to handle it locally
          error.isServerDownError = true;
          
          return Promise.reject(error);
        }
      }

      // Check for 403 Forbidden errors
      if (error.response && error.response.status === 403) {
        console.log('🚫 403 FORBIDDEN ERROR DETECTED');
        if (navigate) {
          navigate('/forbidden');
        } else {
          window.location.href = '/forbidden';
        }
        return Promise.reject(error);
      }

      // Check for 429 Too Many Requests (Rate Limiting)
      if (error.response && error.response.status === 429) {
        console.log('⏸️ 429 RATE LIMIT ERROR DETECTED');
        if (navigate) {
          navigate('/rate-limit');
        } else {
          window.location.href = '/rate-limit';
        }
        return Promise.reject(error);
      }

      // Check for server errors (5xx) - backend is having issues
      if (error.response && error.response.status >= 500) {
        const errorData = {
          message: `Server Error (${error.response.status}): The backend server encountered an error. ${
            error.response.data?.message || 'Please try again later.'
          }`,
          status: error.response.status,
          type: 'server_error',
          details: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
          },
        };
        
        console.log('🔴 SERVER ERROR (5xx) DETECTED - Triggering error page');
        setAppError(errorData);
        
        // Mark this error so components know not to handle it locally
        error.isServerDownError = true;
        
        return Promise.reject(error);
      }

      // All other errors (401, 404, 4xx) - let component handle them
      // These are expected application errors, not system failures
      return Promise.reject(error);
    }
  );

  // Request interceptor to add authorization header
  axios.interceptors.request.use(
    (config) => {
      // You can add request-level logic here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
