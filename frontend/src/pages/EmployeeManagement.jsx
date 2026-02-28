import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

const EmployeeManagement = () => {
  const navigate = useNavigate();
  
  // Try to get orgType and token from AuthContext, fallback to localStorage
  const context = useContext(AuthContext);
  const [orgType, setOrgType] = useState(null);
  const [token, setToken] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    employeeRole: 'verifier'
  });

  useEffect(() => {
    if (context?.orgType && context?.token) {
      setOrgType(context.orgType);
      setToken(context.token);
    } else {
      // Fallback to localStorage
      const storedOrgType = localStorage.getItem('orgType_organization');
      const storedToken = localStorage.getItem('authToken_organization');
      setOrgType(storedOrgType);
      setToken(storedToken);
    }
  }, [context]);

  useEffect(() => {
    if (orgType !== 'management') {
      navigate('/organization/home');
      return;
    }
    if (token) {
      fetchEmployees();
    }
  }, [orgType, token, navigate]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/organization/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      setMessage('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    try {
      setMessage('Uploading CSV...');
      const response = await axios.post('/api/organization/upload-employees', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Employees uploaded successfully');
      fetchEmployees();
    } catch (error) {
      setMessage('Failed to upload CSV');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setMessage('Adding employee...');
      const response = await axios.post('/api/organization/employee', newEmployee, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Employee added successfully');
      setNewEmployee({ name: '', email: '', licenseNumber: '', employeeRole: 'verifier' });
      fetchEmployees();
    } catch (error) {
      setMessage('Failed to add employee');
    }
  };

  const updateEmployee = async (id, updates) => {
    try {
      await axios.put(`/api/organization/employee/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Employee updated');
      fetchEmployees();
    } catch (error) {
      setMessage('Failed to update employee');
    }
  };

  const removeEmployee = async (id) => {
    try {
      await axios.delete(`/api/organization/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Employee removed');
      fetchEmployees();
    } catch (error) {
      setMessage('Failed to remove employee');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {/* Add Single Employee Form */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Employee</h2>
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">License Number</label>
            <input
              type="text"
              value={newEmployee.licenseNumber}
              onChange={(e) => setNewEmployee({...newEmployee, licenseNumber: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={newEmployee.employeeRole}
              onChange={(e) => setNewEmployee({...newEmployee, employeeRole: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="verifier">Verifier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Employee
          </button>
        </form>
      </div>

      {/* CSV Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Upload Employee CSV</label>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="border p-2" />
      </div>

      {/* Employees Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Employees</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">License</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id}>
                <td className="border p-2">{emp.name}</td>
                <td className="border p-2">{emp.email}</td>
                <td className="border p-2">{emp.licenseNumber}</td>
                <td className="border p-2">{emp.employeeRole}</td>
                <td className="border p-2">{emp.status}</td>
                <td className="border p-2">
                  <button onClick={() => updateEmployee(emp._id, { status: emp.status === 'active' ? 'inactive' : 'active' })}>
                    Toggle Status
                  </button>
                  <button onClick={() => removeEmployee(emp._id)} className="ml-2 text-red-600">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;