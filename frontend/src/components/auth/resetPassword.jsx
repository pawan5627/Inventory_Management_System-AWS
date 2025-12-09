import { useState, useEffect } from 'react';
import { SuccessBanner, ErrorBanner } from '../common/banner';
import { apiPost } from '../../apiClient';

export default function ResetPassword({ onNavigate }) {
  const [resetToken, setResetToken] = useState('');
  
  // Extract token from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
    }
  }, []);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
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
    
    if (!resetToken) {
      setErrorMessage('Invalid reset token. Please request a new password reset link.');
      setShowErrorBanner(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await apiPost('/api/auth/reset-password', {
        token: resetToken,
        password: formData.password
      }, false);
      console.log('Password reset successful');
      setShowSuccessBanner(true);
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrorMessage(error.message || 'Failed to reset password. Please try again or request a new reset link.');
      setShowErrorBanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessBanner = () => {
    setShowSuccessBanner(false);
    onNavigate('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      {showSuccessBanner && (
        <SuccessBanner 
          message="Password reset successful! Redirecting to login..."
          onClose={handleCloseSuccessBanner}
          autoRedirect={true}
          redirectDelay={3000}
        />
      )}
      
      {showErrorBanner && (
        <ErrorBanner 
          message={errorMessage}
          onClose={() => setShowErrorBanner(false)}
        />
      )}

      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create New Password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
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

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </span>
            ) : 'Reset Password'}
          </button>

          <div className="text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}