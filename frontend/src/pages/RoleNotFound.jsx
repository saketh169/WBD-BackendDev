import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * RoleNotFound Component
 * Displayed when a user tries to access a role-specific path they don't have access to
 */
const RoleNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        {/* Error Title */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-3">
          Access Denied
        </h1>
        <h2 className="text-xl font-semibold text-[#1A4A40] text-center mb-6">
          Role Not Found
        </h2>

        {/* Error Message */}
        <div className="bg-green-50 border-l-4 border-[#27AE60] rounded-r-lg p-4 mb-6">
          <p className="text-gray-700 leading-relaxed">
            You're trying to access a section that requires a different role or doesn't exist.
            This could happen if:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1 ml-2">
            <li>You don't have the required permissions for this role</li>
            <li>The role-specific path you're trying to access doesn't exist</li>
            <li>Your session has expired and you need to sign in again</li>
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-green-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-[#1A4A40] font-semibold mb-2">What can you do?</p>
          <p className="text-sm text-[#2F4F4F]">
            Go back to the home page and sign in with the appropriate account, or check if you have the correct URL.
          </p>
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
            className="px-6 py-3 bg-linear-to-r from-[#27AE60] to-[#1A4A40] text-white font-semibold rounded-lg hover:from-green-600 hover:to-[#1A4A40] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
              className="text-[#27AE60] hover:text-[#1A4A40] font-semibold underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleNotFound;
