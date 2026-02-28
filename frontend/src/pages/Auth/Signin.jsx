import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../contexts/AuthContext';

// --- Color constants for UI consistency ---
const primaryGreen = '#1E6F5C';
const lightGreen = '#6a994e';

// --- Global UI constants (used in final render) ---
const commonLinkClasses = 'text-[#1E6F5C] hover:text-[#155345] font-medium transition-colors duration-300';

// --- Role-based redirection routes ---
const roleRoutes = {
    user: '/user/home',
    admin: '/admin/home',
    organization: '/organization/home',
    dietitian: '/dietitian/home',
};

// --- Formik & Yup Validation Schema Builder ---
const buildValidationSchema = (role, orgType = '') => {
    // Base schema for all roles
    let schema = Yup.object().shape({
        email: Yup.string()
            .matches(
                /^[a-zA-Z][a-zA-Z0-9._]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Invalid email address.'
            )
            .required('Email is required.')
            .min(5, 'Email must be at least 5 characters.')
            .max(50, 'Email must not exceed 50 characters.'),
        password: Yup.string()
            .required('Password is required.')
            .min(6, 'Password must be at least 6 characters.')
            .max(20, 'Password must not exceed 20 characters.'),
        rememberMe: Yup.boolean(),
    });

    // Role-specific field additions and conditional validation
    switch (role) {
        case 'dietitian':
            schema = schema.shape({
                licenseNumber: Yup.string()
                    .required('License Number is required.')
                    .matches(
                        /^DLN[0-9]{6}$/,
                        'License Number format is incorrect (e.g., DLN123456).'
                    )
                    .length(9, 'License Number must be 9 characters (e.g., DLN123456).'),
            });
            break;

        case 'organization':
            if (orgType !== 'employee') {
                schema = schema.shape({
                    licenseNumber: Yup.string()
                        .required('License Number is required.')
                        .min(5, 'License Number must be at least 5 characters.')
                        .max(20, 'License Number must not exceed 20 characters.'),
                });
            } else {
                // Employee: 3 uppercase org letters + 6 digits e.g. APO123456
                schema = schema.shape({
                    licenseNumber: Yup.string()
                        .required('Employee License Number is required.')
                        .matches(
                            /^[A-Z]{3}[0-9]{6}$/,
                            'Format must be 3 uppercase org letters + 6 digits (e.g. APO123456).'
                        )
                        .length(9, 'Employee License Number must be exactly 9 characters.'),
                });
            }
            break;


        case 'admin':
            schema = schema.shape({
                adminKey: Yup.string()
                    .required('Admin Key is required.')
                    .min(5, 'Admin Key must be at least 5 characters.')
                    .max(20, 'Admin Key must not exceed 20 characters.'),
            });
            break;

        default:
            break;
    }

    return schema;
};

// --- Initial Form Values Based on Role ---
const getInitialValues = (role) => {
    const base = {
        email: '',
        password: '',
        rememberMe: false,
    };

    switch (role) {
        case 'dietitian':
            return { ...base, licenseNumber: '' };
        case 'organization':
            return { ...base, licenseNumber: '' };
        case 'admin':
            return { ...base, adminKey: '' };
        default:
            return base; // For 'user'
    }
};


// --- Main Component ---
const Signin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [role, setRole] = useState('');
    const [orgType, setOrgType] = useState(''); // 'management' or 'employee'
    const [message, setMessage] = useState('');

    // Get role from URL on mount
    useEffect(() => {
        const roleFromUrl = searchParams.get('role') || 'user';
        const typeFromUrl = searchParams.get('type') || '';
        setRole(roleFromUrl);
        setOrgType(typeFromUrl);
    }, [searchParams]);

    // Define the Formik submission handler
    const handleFormikSubmit = async (values, { setSubmitting, setErrors }) => {

        // Construct the API payload object
        const formData = {
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
            role: role,
        };

        // Map role-specific fields to the API payload
        if (role === 'dietitian') formData.licenseNumber = values.licenseNumber;
        if (role === 'organization') {
            formData.orgType = orgType;
            formData.licenseNumber = values.licenseNumber; // required for both management and employee
        }
        if (role === 'admin') formData.adminKey = values.adminKey;

        const apiRoute = `/api/signin/${role}`; // e.g., /api/signin/user

        setSubmitting(true);
        setMessage('Verifying credentials...');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const additionalData = {};
            if (role === 'dietitian') additionalData.licenseNumber = values.licenseNumber;
            if (role === 'organization') {
                additionalData.orgType = orgType;
                additionalData.licenseNumber = values.licenseNumber;
            }
            if (role === 'admin') additionalData.adminKey = values.adminKey;

            const result = await login(values.email, values.password, role, additionalData);

            if (result.success) {
                setMessage(`Sign-in successful! Redirecting...`);

                // Redirect after a short delay
                setTimeout(() => {
                    setMessage('');
                    // For organization, all go to home
                    if (role === 'organization') {
                        navigate('/organization/home');
                    } else {
                        navigate(roleRoutes[role]);
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('Sign-in Error:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            setMessage(`Error: ${errorMessage}`);

            const backendErrors = error.response?.data?.errors;
            if (backendErrors) {
                setErrors(backendErrors);
            }

        } finally {
            setSubmitting(false);
        }
    };

    // Render Form Content (Role-agnostic components)
    const renderFormFields = () => {
        const commonInputClasses = `w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${lightGreen}] transition-all duration-300`;
        const errorClasses = 'text-red-500 text-xs mt-1';

        // Function to generate the name/id for Field and ErrorMessage
        const getFieldIdAndName = (type) => type;

        const renderInputGroup = (type, label, placeholder, fieldName, isRequired = true) => (
            <div className="relative">
                <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <Field
                    id={fieldName}
                    name={fieldName}
                    type={type}
                    className={`${commonInputClasses} h-11`}
                    placeholder={placeholder}
                    required={isRequired}
                />
                <ErrorMessage name={fieldName} component="div" className={errorClasses} />
            </div>
        );

        const RememberMe = () => (
            <div className="flex items-center">
                <Field
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className={`h-4 w-4 text-[${primaryGreen}] border-gray-300 rounded focus:ring-[${primaryGreen}]`}
                />
                <label className="ml-2 block text-sm text-gray-900" htmlFor="rememberMe">
                    Remember Me
                </label>
            </div>
        );

        // --- Dynamic Fields ---
        const renderRoleFields = () => {
            if (role === 'dietitian') {
                return <div key="roleField">{renderInputGroup('text', 'License Number', 'e.g., DLN123456', getFieldIdAndName('licenseNumber'))}</div>;
            } else if (role === 'organization' && orgType !== 'employee') {
                return <div key="roleField">{renderInputGroup('text', 'License Number', 'Enter your License Number', getFieldIdAndName('licenseNumber'))}</div>;
            } else if (role === 'organization' && orgType === 'employee') {
                return <div key="roleField">{renderInputGroup('text', 'Employee License Number', 'e.g. APO123456', getFieldIdAndName('licenseNumber'))}</div>;
            } else if (role === 'admin') {
                return <div key="roleField">{renderInputGroup('password', 'Admin Key', 'Enter Admin Key', getFieldIdAndName('adminKey'))}</div>;
            }
            return null;
        };

        return (
            <>
                {/* Email */}
                {renderInputGroup('email', 'Email', 'Enter your email', getFieldIdAndName('email'))}

                {/* Password */}
                {renderInputGroup('password', 'Password', 'Enter your password', getFieldIdAndName('password'))}

                {/* Role-Specific Field(s) */}
                {renderRoleFields()}
                <div className="flex items-center justify-between">
                    <RememberMe />
                    <Link to={`/forgot-password?role=${role}`} className="text-sm font-medium text-[#1E6F5C] hover:text-[#155345]">
                        Forgot Password?
                    </Link>
                </div>
            </>
        );
    };

    // Fallback for unselected role
    if (!role || role === 'default') {
        return (
            <section className="flex items-center justify-center bg-gray-100 p-4 min-h-150">
                <div className="w-full max-w-lg p-8 mx-auto rounded-3xl shadow-2xl bg-white animate-fade-in">
                    <div className="text-center p-8">
                        <h3 className="text-xl text-gray-700 font-semibold mb-4">Please select a role to sign in.</h3>
                        <button
                            onClick={() => navigate('/role')}
                            className="mt-4 bg-[#28B463] hover:bg-[#1E8449] text-white font-bold py-2 px-4 rounded-md shadow-lg transition-colors"
                        >
                            Select a Role
                        </button>
                    </div>
                </div>
            </section>
        );
    }


    // Main Render with Formik Wrapper
    return (
        <section className="flex items-center justify-center bg-gray-100 p-4 min-h-150">
            <div className="w-full max-w-lg p-8 mx-auto rounded-3xl shadow-2xl bg-white animate-fade-in relative">
                <button
                    onClick={() => navigate('/role')}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Back to Role Selection"
                >
                    <i className="fas fa-times text-xl"></i>
                </button>
                <h2 className="text-center text-3xl font-bold text-[#1E6F5C] mb-6">
                    LOG IN AS {role === 'organization' && orgType ? `ORGANIZATION - ${orgType.toUpperCase()}` : role.toUpperCase()}
                </h2>

                {/* Global Alert */}
                {message && (
                    <div
                        aria-live="polite"
                        className={`p-3 mb-5 text-center text-base font-medium rounded-lg shadow-sm animate-slide-in w-full ${message.includes('successful') || message.includes('Redirecting')
                                ? 'text-green-800 bg-green-100 border border-green-300'
                                : message.includes('Verifying')
                                    ? 'text-blue-800 bg-blue-100 border border-blue-300'
                                    : 'text-red-800 bg-red-100 border border-red-300'
                            }`}
                        role="alert"
                    >
                        {message}
                    </div>
                )}

                <Formik
                    initialValues={getInitialValues(role)}
                    validationSchema={buildValidationSchema(role, orgType)}
                    onSubmit={handleFormikSubmit}
                    enableReinitialize={true}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4" noValidate>

                            {renderFormFields()}

                            {/* Submit Button with Loading State */}
                            <button
                                type="submit"
                                className={`w-full bg-[${primaryGreen}] text-white font-semibold py-3 rounded-lg hover:bg-[#155345] transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i> Logging In...
                                    </>
                                ) : (
                                    'Log In'
                                )}
                            </button>

                            <p className="text-center text-sm mt-4">
                                Don't have an account?{' '}
                                <Link to={`/signup?role=${role}`} className={commonLinkClasses}>Sign Up</Link>
                            </p>
                        </Form>
                    )}
                </Formik>
            </div>
        </section>
    );
};

export default Signin;