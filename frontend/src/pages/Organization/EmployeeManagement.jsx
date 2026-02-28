import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        employeeRole: 'verifier',
        department: 'Document Review',
        status: 'active'
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Role and Department options
    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'verifier', label: 'Verifier' }
    ];

    const departmentOptions = [
        { value: 'Document Review', label: 'Document Review' },
        { value: 'Verification', label: 'Verification' },
        { value: 'Quality Assurance', label: 'Quality Assurance' },
        { value: 'Management', label: 'Management' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending-activation', label: 'Pending Activation' }
    ];

    // Fetch all employees
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!showEditModal && !formData.password.trim()) newErrors.password = 'Password is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        return newErrors;
    };

    // Add employee
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/employees/add`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSuccessMessage(`Employee added successfully! License Number: ${response.data.data.licenseNumber}`);
            setShowAddModal(false);
            resetForm();
            fetchEmployees();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to add employee');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Update employee
    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const updateData = { ...formData };
            delete updateData.password; // Don't send password in update

            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/employees/${selectedEmployee._id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSuccessMessage('Employee updated successfully!');
            setShowEditModal(false);
            resetForm();
            fetchEmployees();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to update employee');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Delete employee
    const handleDeleteEmployee = async (employeeId) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/employees/${employeeId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSuccessMessage('Employee deleted successfully!');
            fetchEmployees();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to delete employee');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Handle CSV file upload
    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
        setUploadResult(null);
    };

    // Bulk upload employees
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            setErrorMessage('Please select a CSV file');
            return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('csvFile', csvFile);

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/employees/bulk-upload`,
                formDataUpload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            setUploadResult(response.data.data);
            setSuccessMessage(`Successfully added ${response.data.data.added} employees!`);
            setCsvFile(null);
            fetchEmployees();
            setTimeout(() => {
                setSuccessMessage('');
                setShowBulkUpload(false);
                setUploadResult(null);
            }, 8000);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to upload employees');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Download CSV template
    const downloadTemplate = () => {
        const csvContent = 'name,email,password,employeeRole,department\nJohn Doe,john@example.com,password123,verifier,Document Review\nJane Smith,jane@example.com,pass456,manager,Management';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_upload_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            employeeRole: 'verifier',
            department: 'Document Review',
            status: 'active'
        });
        setErrors({});
        setSelectedEmployee(null);
    };

    // Open edit modal
    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            password: '',
            employeeRole: employee.employeeRole,
            department: employee.department,
            status: employee.status
        });
        setShowEditModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-[#1A4A40] mb-2">
                        <i className="fas fa-users-cog mr-3"></i>
                        Employee Management
                    </h1>
                    <p className="text-gray-600">Add, update, and manage organization employees</p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                        <i className="fas fa-check-circle mr-2"></i>{successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                        <i className="fas fa-exclamation-circle mr-2"></i>{errorMessage}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1E6F5C] transition-all duration-200 shadow-md"
                        >
                            <i className="fas fa-plus mr-2"></i>Add Employee
                        </button>
                        <button
                            onClick={() => setShowBulkUpload(true)}
                            className="bg-[#2980B9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1A5276] transition-all duration-200 shadow-md"
                        >
                            <i className="fas fa-upload mr-2"></i>Bulk Upload
                        </button>
                        <button
                            onClick={downloadTemplate}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 shadow-md"
                        >
                            <i className="fas fa-download mr-2"></i>Download Template
                        </button>
                        <button
                            onClick={fetchEmployees}
                            className="bg-[#17A2B8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#138496] transition-all duration-200 shadow-md"
                        >
                            <i className="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-[#1A4A40]">
                            All Employees ({employees.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <i className="fas fa-spinner fa-spin text-4xl text-[#27AE60]"></i>
                            <p className="mt-4 text-gray-600">Loading employees...</p>
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray-500 text-lg">No employees found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">License Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {employees.map((employee) => (
                                        <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{employee.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {employee.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                                                    {employee.licenseNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    employee.employeeRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    employee.employeeRole === 'manager' ? 'bg-indigo-100 text-indigo-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {employee.employeeRole}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {employee.department}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(employee)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEmployee(employee._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Employee Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-[#27AE60] text-white p-6 rounded-t-lg">
                                <h2 className="text-2xl font-bold">
                                    <i className="fas fa-user-plus mr-2"></i>Add New Employee
                                </h2>
                            </div>
                            <form onSubmit={handleAddEmployee} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter employee name"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="employee@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter password"
                                        />
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Employee Role
                                        </label>
                                        <select
                                            name="employeeRole"
                                            value={formData.employeeRole}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                        >
                                            {roleOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                        >
                                            {departmentOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#1E6F5C] transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Adding...' : 'Add Employee'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Employee Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-[#2980B9] text-white p-6 rounded-t-lg">
                                <h2 className="text-2xl font-bold">
                                    <i className="fas fa-user-edit mr-2"></i>Edit Employee
                                </h2>
                            </div>
                            <form onSubmit={handleUpdateEmployee} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent ${
                                                errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Employee Role
                                        </label>
                                        <select
                                            name="employeeRole"
                                            value={formData.employeeRole}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent"
                                        >
                                            {roleOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent"
                                        >
                                            {departmentOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-[#2980B9] text-white rounded-lg hover:bg-[#1A5276] transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Employee'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bulk Upload Modal */}
                {showBulkUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-[#2980B9] text-white p-6 rounded-t-lg">
                                <h2 className="text-2xl font-bold">
                                    <i className="fas fa-file-upload mr-2"></i>Bulk Upload Employees
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                    <h3 className="font-semibold text-blue-900 mb-2">CSV Format Instructions:</h3>
                                    <ul className="text-sm text-blue-800 space-y-1 ml-4">
                                        <li>• Headers: name, email, password, employeeRole, department</li>
                                        <li>• employeeRole: admin, manager, or verifier</li>
                                        <li>• department: Document Review, Verification, Quality Assurance, or Management</li>
                                        <li>• Download the template below for reference</li>
                                    </ul>
                                </div>

                                <form onSubmit={handleBulkUpload}>
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Select CSV File <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2980B9] focus:border-transparent"
                                        />
                                        {csvFile && (
                                            <p className="text-sm text-green-600 mt-2">
                                                <i className="fas fa-check-circle mr-1"></i>
                                                {csvFile.name}
                                            </p>
                                        )}
                                    </div>

                                    {uploadResult && (
                                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-gray-900 mb-3">Upload Results:</h4>
                                            <div className="space-y-2">
                                                <p className="text-green-600">
                                                    <i className="fas fa-check-circle mr-2"></i>
                                                    Successfully added: {uploadResult.added} employees
                                                </p>
                                                {uploadResult.errors > 0 && (
                                                    <div>
                                                        <p className="text-red-600">
                                                            <i className="fas fa-exclamation-circle mr-2"></i>
                                                            Errors: {uploadResult.errors}
                                                        </p>
                                                        <div className="ml-6 mt-2 text-sm text-red-700 max-h-40 overflow-y-auto">
                                                            {uploadResult.errorDetails.map((error, index) => (
                                                                <p key={index}>• {error}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-4">
                                        <button
                                            type="button"
                                            onClick={downloadTemplate}
                                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <i className="fas fa-download mr-2"></i>Download Template
                                        </button>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowBulkUpload(false);
                                                    setCsvFile(null);
                                                    setUploadResult(null);
                                                }}
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !csvFile}
                                                className="px-6 py-2 bg-[#2980B9] text-white rounded-lg hover:bg-[#1A5276] transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Uploading...' : 'Upload & Add'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeManagement;
