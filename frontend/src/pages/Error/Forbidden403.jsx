import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Forbidden403 Component
 * Displayed when user doesn't have permission to access a resource (HTTP 403)
 */
const Forbidden403 = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        {/* Error Title */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-3">
          Access Forbidden
        </h1>
        <h2 className="text-xl font-semibold text-red-600 text-center mb-6">
          You Don't Have Permission
        </h2>

        {/* Error Message */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6">
          <p className="text-gray-700 leading-relaxed mb-3">
            Sorry, you don't have permission to access this resource or perform this action.
          </p>
          <p className="text-sm text-gray-600">
            This could happen if:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1 ml-2">
            <li>Your account doesn't have the required privileges</li>
            <li>You're trying to access another user's private data</li>
            <li>This feature is restricted to specific user roles</li>
            <li>Your session has expired or authentication is invalid</li>
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-green-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-[#1A4A40] font-semibold mb-2">What you can try:</p>
          <ul className="list-disc list-inside text-sm text-[#2F4F4F] space-y-1 ml-2">
            <li>Sign in with an account that has the required permissions</li>
            <li>Contact your administrator if you believe you should have access</li>
            <li>Check if your subscription or membership is active</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-linear-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a
              href="/contact-us"
              className="text-red-600 hover:text-red-700 font-semibold underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403;
