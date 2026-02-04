import React, { Suspense, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import SplashScreen from './components/extras/SplashScreen';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Aboutus from './pages/Aboutus';
import Blog from './pages/Blog';
import Guide from './pages/Guide';

import Contactus from './pages/Contactus';

import Signin from './pages/Auth/Signin';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChatbotPage from './pages/Chatbot';
import RoleModal from './pages/RoleModal';
import DocUpload from './pages/Auth/DocUpload';

import PrivacyPolicy from './components/extras/PrivacyPolicy';
import TermsOfUse  from './components/extras/TermsOfUse';
import ServerError from './pages/Error/ServerError';
import Forbidden403 from './pages/Error/Forbidden403';
import RateLimit429 from './pages/Error/RateLimit429';

import Layout from './Layout';
import ErrorContext from './contexts/ErrorContext';
import setupAxiosInterceptors from './utils/axiosInterceptor';

// NotFound component for 404 pages
const NotFound = () => (
  <main className="flex-1 max-w-6xl mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold text-[#2C3E50]">Page Not Found</h1>
    <p className="mt-4 text-lg text-gray-600">
      The requested page does not exist.{' '}
      <a href="/" className="text-blue-600 hover:underline">
        Go back to Home
      </a>
    </p>
  </main>
);

// Error monitor component to handle navigation
const ErrorMonitor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isServerDown } = useContext(ErrorContext);
  const [previousPath, setPreviousPath] = React.useState('/');

  // Remember the path before error
  useEffect(() => {
    if (!isServerDown && location.pathname !== '/server-error') {
      setPreviousPath(location.pathname);
    }
  }, [location.pathname, isServerDown]);

  useEffect(() => {
    console.log('🟢 ErrorMonitor: isServerDown =', isServerDown, 'current path:', location.pathname);
    
    if (isServerDown && location.pathname !== '/server-error') {
      console.log('🔴 ErrorMonitor: Navigating to /server-error');
      navigate('/server-error', { replace: true });
    } else if (!isServerDown && location.pathname === '/server-error') {
      console.log('🟢 ErrorMonitor: Server recovered, navigating back to:', previousPath);
      navigate(previousPath, { replace: true });
    }
  }, [isServerDown, navigate, location.pathname, previousPath]);

  return null;
};

const App = () => {
  const { setAppError, markServerRecovered } = useContext(ErrorContext);

  // Setup axios interceptors with error context
  useEffect(() => {
    console.log('🟢 App: Setting up axios interceptors');
    setupAxiosInterceptors(setAppError, markServerRecovered);
  }, [setAppError, markServerRecovered]);

  return (
    <ErrorBoundary>
      <Router>
        <ErrorMonitor />
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <Routes>
            {/* Error Routes - NO Header/Footer to avoid auth issues */}
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/forbidden" element={<Forbidden403 />} />
            <Route path="/rate-limit" element={<RateLimit429 />} />
            
            {/* All other routes with normal layout */}
            <Route path="*" element={
              <div className="app-container">
                <div className="main-layout">
                  <Header />
                  <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/about-us" element={<Aboutus />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/guide" element={<Guide />} />
                      <Route path="/chatbot" element={<ChatbotPage />} />
                      <Route path="/contact-us" element={<Contactus />} />
                      <Route path="/signin" element={<Signin />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/role" element={<RoleModal />} />
                      <Route path="/upload-documents" element={<DocUpload />} />

                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-use" element={<TermsOfUse/>} />

                      {/* Role-Specific Routes (handled by Layout.jsx) */}
                      <Route path="/*" element={<Layout />} />

                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Footer />
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;