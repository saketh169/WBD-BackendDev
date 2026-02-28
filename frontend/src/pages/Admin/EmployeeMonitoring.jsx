import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeMonitoring = () => {
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, inactive, pending
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // Fetch employee statistics
    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employees/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchEmployees();
    }, []);

    // Filter employees based on status and department
    const filteredEmployees = employees.filter(emp => {
        const statusMatch = filter === 'all' || emp.status === filter;
        const deptMatch = selectedDepartment === 'all' || emp.department === selectedDepartment;
        return statusMatch && deptMatch;
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-[#1A4A40] mb-2">
                        <i className="fas fa-chart-line mr-3"></i>
                        Employee Monitoring & Analytics
                    </h1>
                    <p className="text-gray-600">Track employee activity, performance, and statistics</p>
                </div>

                {loading && !stats ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-[#27AE60]"></i>
                        <p className="mt-4 text-gray-600">Loading statistics...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics Overview */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Total Employees */}
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium mb-1">Total Employees</p>
                                            <p className="text-4xl font-bold">{stats.total}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                            <i className="fas fa-users text-3xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Employees */}
                                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium mb-1">Active</p>
                                            <p className="text-4xl font-bold">{stats.active}</p>
                                            <p className="text-green-100 text-xs mt-1">
                                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
                                            </p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                            <i className="fas fa-user-check text-3xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Inactive Employees */}
                                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-red-100 text-sm font-medium mb-1">Inactive</p>
                                            <p className="text-4xl font-bold">{stats.inactive}</p>
                                            <p className="text-red-100 text-xs mt-1">
                                                {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total
                                            </p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                            <i className="fas fa-user-times text-3xl"></i>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Employees */}
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-yellow-100 text-sm font-medium mb-1">Pending</p>
                                            <p className="text-4xl font-bold">{stats.pending}</p>
                                            <p className="text-yellow-100 text-xs mt-1">Awaiting activation</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-4 rounded-full">
                                            <i className="fas fa-user-clock text-3xl"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Role Distribution & Department Distribution */}
                        {stats && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* By Role */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-[#1A4A40] mb-4">
                                        <i className="fas fa-user-tag mr-2"></i>Distribution by Role
                                    </h2>
                                    <div className="space-y-4">
                                        {stats.byRole && stats.byRole.length > 0 ? (
                                            stats.byRole.map((role, index) => {
                                                const percentage = stats.total > 0 ? (role.count / stats.total) * 100 : 0;
                                                const colors = {
                                                    admin: 'bg-purple-500',
                                                    manager: 'bg-indigo-500',
                                                    verifier: 'bg-green-500'
                                                };
                                                return (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-gray-700 font-semibold capitalize">
                                                                {role._id}
                                                            </span>
                                                            <span className="text-gray-600 font-medium">
                                                                {role.count} ({percentage.toFixed(0)}%)
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                                            <div
                                                                className={`${colors[role._id] || 'bg-gray-500'} h-3 rounded-full transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No role data available</p>
                                        )}
                                    </div>
                                </div>

                                {/* By Department */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-[#1A4A40] mb-4">
                                        <i className="fas fa-building mr-2"></i>Distribution by Department
                                    </h2>
                                    <div className="space-y-4">
                                        {stats.byDepartment && stats.byDepartment.length > 0 ? (
                                            stats.byDepartment.map((dept, index) => {
                                                const percentage = stats.total > 0 ? (dept.count / stats.total) * 100 : 0;
                                                const colors = [
                                                    'bg-blue-500',
                                                    'bg-teal-500',
                                                    'bg-pink-500',
                                                    'bg-orange-500'
                                                ];
                                                return (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-gray-700 font-semibold">
                                                                {dept._id}
                                                            </span>
                                                            <span className="text-gray-600 font-medium">
                                                                {dept.count} ({percentage.toFixed(0)}%)
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                                            <div
                                                                className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No department data available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Filter by Status
                                    </label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                        <option value="pending-activation">Pending Only</option>
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Filter by Department
                                    </label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                    >
                                        <option value="all">All Departments</option>
                                        <option value="Document Review">Document Review</option>
                                        <option value="Verification">Verification</option>
                                        <option value="Quality Assurance">Quality Assurance</option>
                                        <option value="Management">Management</option>
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[200px] flex items-end">
                                    <button
                                        onClick={() => {
                                            setFilter('all');
                                            setSelectedDepartment('all');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <i className="fas fa-redo mr-2"></i>Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Employee Activity Table */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#1A4A40]">
                                    Employee Activity Log ({filteredEmployees.length})
                                </h2>
                                <button
                                    onClick={fetchEmployees}
                                    className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#1E6F5C] transition-colors"
                                >
                                    <i className="fas fa-sync-alt mr-2"></i>Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-spinner fa-spin text-4xl text-[#27AE60]"></i>
                                    <p className="mt-4 text-gray-600">Loading employees...</p>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-filter text-6xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-lg">No employees match the selected filters</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Employee</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">License</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Department</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Last Login</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredEmployees.map((employee) => (
                                                <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#27AE60] to-[#1E6F5C] rounded-full flex items-center justify-center text-white font-bold">
                                                                {employee.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">{employee.name}</div>
                                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                                            </div>
                                                        </div>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {employee.department}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center ${
                                                            employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                                                employee.status === 'active' ? 'bg-green-500' :
                                                                employee.status === 'inactive' ? 'bg-red-500' :
                                                                'bg-yellow-500'
                                                            }`}></span>
                                                            {employee.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {employee.lastLogin ? (
                                                            <div>
                                                                <div>{formatDate(employee.lastLogin)}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Never</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(employee.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmployeeMonitoring;
