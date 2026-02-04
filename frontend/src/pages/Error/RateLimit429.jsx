import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * RateLimit429 Component
 * Displayed when user exceeds rate limits (HTTP 429 - Too Many Requests)
 */
const RateLimit429 = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = React.useState(60);

  // Countdown timer
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        {/* Error Title */}
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-3">
          Whoa, Slow Down!
        </h1>
        <h2 className="text-xl font-semibold text-orange-600 text-center mb-6">
          Too Many Requests
        </h2>

        {/* Error Message */}
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 mb-6">
          <p className="text-gray-700 leading-relaxed mb-3">
            You've made too many requests in a short period of time. Please wait a moment before trying again.
          </p>
          <p className="text-sm text-gray-600">
            This limit helps us keep the service fast and reliable for everyone.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-linear-to-r from-orange-100 to-yellow-100 rounded-lg p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Please wait before retrying</p>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-20 h-20">
                <circle
                  className="text-orange-200"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="40"
                  cy="40"
                />
                <circle
                  className="text-orange-500 transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray={`${(countdown / 60) * 188.5} 188.5`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="30"
                  cx="40"
                  cy="40"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">{countdown}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-green-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-[#1A4A40] font-semibold mb-2">Tips to avoid this:</p>
          <ul className="list-disc list-inside text-sm text-[#2F4F4F] space-y-1 ml-2">
            <li>Don't refresh the page too quickly</li>
            <li>Avoid clicking buttons multiple times</li>
            <li>Wait for requests to complete before making new ones</li>
            <li>Consider upgrading for higher rate limits</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
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
            onClick={handleRetry}
            disabled={countdown > 0}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
              countdown > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-[#27AE60] to-[#1A4A40] text-white hover:from-green-600 hover:to-[#1A4A40]'
            }`}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Now
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-linear-to-r from-[#27AE60] to-[#1A4A40] text-white font-semibold rounded-lg hover:from-green-600 hover:to-[#1A4A40] transition-all duration-200 shadow-md hover:shadow-lg"
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
            Experiencing issues?{' '}
            <a
              href="/contact-us"
              className="text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateLimit429;
