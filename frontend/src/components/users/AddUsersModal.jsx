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
    departmentCode: '',
    companyCode: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

    if (!editUser && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password) {
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password)) newErrors.password = 'Password must include uppercase and lowercase characters';
      else if (!/\d/.test(formData.password)) newErrors.password = 'Password must include at least one digit';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = 'Password must include at least one special character';
    }

    if (formData.password && !formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.groupId) newErrors.groupId = 'Group is required';
    if (!formData.departmentCode) newErrors.departmentCode = 'Department is required';
    if (!formData.companyCode) newErrors.companyCode = 'Company is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Correctly declare variables here
      const groupName = (groups.find(g => String(g.id) === String(formData.groupId)) || {}).name || '';
      const deptName = (departments.find(d => d.code === formData.departmentCode) || {}).name || '';
      const companyName = (companies.find(c => c.code === formData.companyCode) || {}).name || '';

      if (editUser) {
        const updateBody = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          status: formData.status,
          departmentCode: formData.departmentCode,
          companyCode: formData.companyCode
        };
        if (formData.password) updateBody.password = formData.password;

        const updated = await authPut(`/api/users/${editUser.id}`, updateBody);
        try { await authPut(`/api/users/${editUser.id}/groups`, { groupIds: [formData.groupId] }); } 
        catch (e) { console.warn('Group assignment failed', e); }

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

        try { await authPut(`/api/users/${created.id}/groups`, { groupIds: [formData.groupId] }); }
        catch (e) { console.warn('Group assignment failed', e); }

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
      {/* ... rest of JSX remains unchanged ... */}
    </>
  );
}
