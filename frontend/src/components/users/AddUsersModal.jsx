import { useState, useEffect } from 'react';
import { authGet, authPost, authPut } from '../../apiClient';
import { X } from 'lucide-react';
import { SuccessBanner, ErrorBanner } from '../common/banner';

export default function AddUserModal({ setShowAddModal, users, setUsers, editUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    groupId: '',
      const groupName = (groups.find(g => String(g.id) === String(formData.groupId)) || {}).name || '';
      const deptName = (departments.find(d => d.code === formData.departmentCode) || {}).name || '';
      const companyName = (companies.find(c => c.code === formData.companyCode) || {}).name || '';

      if (editUser) {
        // Update existing user metadata
        const upd = await authPut(`/api/users/${editUser.id}`, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          status: formData.status,
          departmentCode: formData.departmentCode,
          companyCode: formData.companyCode,
          password: formData.password ? formData.password : undefined
        });
        // Assign group
        try {
          await authPut(`/api/users/${editUser.id}/groups`, { groupIds: [formData.groupId] });
        } catch (e) { console.warn('Group assignment failed', e); }
        const updatedRow = {
          id: editUser.id,
          name: upd.name,
          email: upd.email,
          group: groupName,
          department: deptName,
          company: companyName,
          status: upd.status,
          lastLogin: editUser.lastLogin || ''
        };
        setUsers(users.map(u => u.id === editUser.id ? { ...u, ...updatedRow } : u));
      } else {
        // Create user in backend (requires admin role)
        const username = (formData.email || '').split('@')[0];
        const body = {
          username,
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          status: formData.status,
          departmentCode: formData.departmentCode,
          companyCode: formData.companyCode
        };
        const created = await authPost('/api/users', body);
        // Try to assign group membership; ignore failures to not block UX
        try {
          await authPut(`/api/users/${created.id}/groups`, { groupIds: [formData.groupId] });
        } catch (e) { console.warn('Group assignment failed', e); }
        const newUser = {
          id: created.id,
          name: created.name,
          email: created.email,
          group: groupName,
          department: deptName,
          company: companyName,
          status: created.status,
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        setUsers([...users, newUser]);
      }
  useEffect(() => {
    let cancelled = false;
    const fetchMeta = async () => {
      try {
        const [gr, deps, comps] = await Promise.all([
          authGet('/api/groups'),
          authGet('/api/departments'),
          authGet('/api/companies')
        ]);
        if (!cancelled) {
          setGroups(gr || []);
          setDepartments(deps || []);
          setCompanies(comps || []);
        }
      } catch (e) {
        console.warn('Failed to fetch groups/departments/companies', e);
      }
    };
    fetchMeta();
    return () => { cancelled = true; };
  }, []);

  const getPasswordStrength = () => {
    const password = formData.password;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    return { checks, strength };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (users.some(u => u.email === formData.email && (!editUser || u.id !== editUser.id))) {
      newErrors.email = 'Email already exists';
    }
    
    // Password is only required when creating a new user
    if (!editUser && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password) {
      // Validate password if provided
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must include uppercase and lowercase characters';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must include at least one digit';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        newErrors.password = 'Password must include at least one special character';
      }
    }
    
    // Confirm password only required if password is provided
    if (formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.groupId) newErrors.groupId = 'Group is required';
    if (!formData.departmentCode) newErrors.departmentCode = 'Department is required';
    if (!formData.companyCode) newErrors.companyCode = 'Company is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const groupName = (groups.find(g => String(g.id) === String(formData.groupId)) || {}).name || '';
      const deptName = (departments.find(d => d.code === formData.departmentCode) || {}).name || '';
      const companyName = (companies.find(c => c.code === formData.companyCode) || {}).name || '';
      
      if (editUser) {
        // Update existing user
        const updateBody = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          status: formData.status,
          departmentCode: formData.departmentCode,
          companyCode: formData.companyCode
        };
        
        // Only include password if provided
        if (formData.password) {
          updateBody.password = formData.password;
        }
        
        const updated = await authPut(`/api/users/${editUser.id}`, updateBody);
        
        // Try to assign group membership
        try {
          await authPut(`/api/users/${editUser.id}/groups`, { groupIds: [formData.groupId] });
        } catch (e) {
          console.warn('Group assignment failed', e);
        }
        
        const updatedUser = {
          id: editUser.id,
          name: updated.name,
          email: updated.email,
          group: groupName,
          department: deptName,
          company: companyName,
          status: updated.status,
          lastLogin: editUser.lastLogin
        };
        
        setUsers(users.map(u => u.id === editUser.id ? updatedUser : u));
      } else {
        // Create new user in backend (requires admin role)
        const username = (formData.email || '').split('@')[0];
        const body = {
          username,
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          status: formData.status,
          departmentCode: formData.departmentCode,
          companyCode: formData.companyCode
        };
        const created = await authPost('/api/users', body);
        
        // Try to assign group membership; ignore failures to not block UX
        try {
          await authPut(`/api/users/${created.id}/groups`, { groupIds: [formData.groupId] });
        } catch (e) {
          console.warn('Group assignment failed', e);
        }
        
        const newUser = {
          id: created.id,
          name: created.name,
          email: created.email,
          group: groupName,
          department: deptName,
          company: companyName,
          status: created.status,
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        
        setUsers([...users, newUser]);
      }
      
      setShowSuccessBanner(true);
      setTimeout(() => {
        setShowSuccessBanner(false);
        setShowAddModal(false);
      }, 2000);
    } catch (error) {
      setErrorMessage(`Failed to ${editUser ? 'update' : 'create'} user. Please try again.`);
      setShowErrorBanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showSuccessBanner && (
        <SuccessBanner 
          message="User created successfully!"
          onClose={() => setShowSuccessBanner(false)}
          autoRedirect={false}
        />
      )}
      
      {showErrorBanner && (
        <ErrorBanner 
          message={errorMessage}
          onClose={() => setShowErrorBanner(false)}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{editUser ? 'Edit User' : 'Add New User'}</h3>
            <button 
              onClick={() => setShowAddModal(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.employeeId ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="EMP-12345"
                    />
                    {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Organization Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Organization Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="groupId"
                      value={formData.groupId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.groupId ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    {errors.groupId && <p className="mt-1 text-sm text-red-600">{errors.groupId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="departmentCode"
                      value={formData.departmentCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.departmentCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept.code} value={dept.code}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.departmentCode && <p className="mt-1 text-sm text-red-600">{errors.departmentCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="companyCode"
                      value={formData.companyCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.companyCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select company</option>
                      {companies.map(company => (
                        <option key={company.code} value={company.code}>{company.name}</option>
                      ))}
                    </select>
                    {errors.companyCode && <p className="mt-1 text-sm text-red-600">{errors.companyCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Security</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editUser ? '(leave blank to keep current)' : (<span className="text-red-500">*</span>)}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordStrength.strength <= 2 ? 'bg-red-500' :
                                passwordStrength.strength === 3 ? 'bg-yellow-500' :
                                passwordStrength.strength === 4 ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {passwordStrength.strength <= 2 ? 'Weak' :
                             passwordStrength.strength === 3 ? 'Fair' :
                             passwordStrength.strength === 4 ? 'Good' :
                             'Strong'}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordStrength.checks.length ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                            </svg>
                            Min 8 characters
                          </div>
                          <div className={`flex items-center ${passwordStrength.checks.uppercase && passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordStrength.checks.uppercase && passwordStrength.checks.lowercase ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                            </svg>
                            Include uppercase and lowercase
                          </div>
                          <div className={`flex items-center ${passwordStrength.checks.digit ? 'text-green-600' : 'text-gray-500'}`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordStrength.checks.digit ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                            </svg>
                            Include one digit
                          </div>
                          <div className={`flex items-center ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordStrength.checks.special ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                            </svg>
                            Include one special character
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password {!editUser && (<span className="text-red-500">*</span>)}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    
                    {/* Password Match Validation */}
                    {formData.confirmPassword && (
                      <div className={`mt-2 text-xs flex items-center ${
                        formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={formData.password === formData.confirmPassword ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (editUser ? 'Saving...' : 'Creating User...') : (editUser ? 'Save' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}