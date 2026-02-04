import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorContext from '../../contexts/ErrorContext';

const ServerError = () => {
  const navigate = useNavigate();
  const { error, isServerDown, isRecovering, attemptRecovery, markServerRecovered } =
    useContext(ErrorContext);

  // If server recovers, show recovery notification and navigate back
  useEffect(() => {
    if (!isServerDown) {
      // Small delay to show recovery state
      const timer = setTimeout(() => {
        navigate(-1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isServerDown, navigate]);

  const handleRetry = async () => {
    const isRecovered = await attemptRecovery();
    if (isRecovered) {
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    markServerRecovered();
    navigate('/');
  };

  // Show recovery success state
  if (!isServerDown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-green-100 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Server Recovered!</h1>
          <p className="text-gray-600 mb-6">The server is back online. Redirecting you now...</p>

          <div className="animate-spin inline-block w-6 h-6 border-4 border-gray-300 border-t-green-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-red-100 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Server Connection Error</h1>
        <p className="text-lg text-gray-600 text-center mb-6">
          We're having trouble connecting to our server.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-semibold mb-2">Error Details:</p>
            <p className="text-red-600 text-sm wrap-break-word">{error.message}</p>
            {error.details && (
              <p className="text-red-500 text-xs mt-2 font-mono wrap-break-word">
                Status: {error.status || 'Unknown'}
              </p>
            )}
          </div>
        )}

        {/* Status Information */}
        <div className="bg-green-50 border border-[#27AE60] rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#1A4A40] mb-3">What's happening?</h3>
          <ul className="text-sm text-[#2F4F4F] space-y-2 list-disc list-inside">
            <li>The backend server appears to be temporarily unavailable</li>
            <li>We're automatically checking if it comes back online</li>
            <li>Please don't close this page - we'll refresh automatically when the server recovers</li>
            <li>If the issue persists, try refreshing the page or contact support</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            disabled={isRecovering}
            className="px-6 py-3 bg-[#27AE60] text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRecovering ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Checking...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry Now
              </>
            )}
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 4m0 0l4-4m-4 4V5"
              />
            </svg>
            Go to Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-gray-300 text-center">
          <p className="text-gray-600 text-sm">
            Experiencing persistent issues?{' '}
            <a href="/contact-us" className="text-blue-600 hover:underline font-semibold">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
