import { useState, useEffect } from 'react';
import { User, Upload, X } from 'lucide-react';

export default function Profile({ initialUser = { firstName: 'Admin', lastName: '', email: 'admin@example.com' } }) {
  const [firstName, setFirstName] = useState(initialUser.firstName || '');
  const [lastName, setLastName] = useState(initialUser.lastName || '');
  const [email] = useState(initialUser.email || '');
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [location, setLocation] = useState(initialUser.location || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('profileAvatar');
    if (saved) setAvatarDataUrl(saved);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (newPassword.length < 8) {
        alert('New password must be at least 8 characters');
        return;
      }
    }
    // Persist avatar locally
    if (avatarDataUrl) {
      localStorage.setItem('profileAvatar', avatarDataUrl);
    } else {
      localStorage.removeItem('profileAvatar');
    }
    alert('Profile saved');
  };

  const initials = `${(firstName || 'A')[0] || 'A'}${(lastName || '')[0] || ''}`.toUpperCase();

  const handleAvatarChange = (file) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG or JPG image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarDataUrl(String(e.target?.result || ''));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-lg font-semibold select-none overflow-hidden">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials || <User className="w-8 h-8" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 flex space-x-2">
              <label className="cursor-pointer bg-white border rounded-full p-1 shadow hover:bg-gray-50" title="Upload avatar">
                <Upload className="w-4 h-4 text-gray-700" />
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                />
              </label>
              {avatarDataUrl && (
                <button
                  type="button"
                  className="bg-white border rounded-full p-1 shadow hover:bg-gray-50"
                  title="Remove avatar"
                  onClick={() => setAvatarDataUrl('')}
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Profile</h3>
            <p className="text-gray-500 text-sm">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country (optional)"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setFirstName(initialUser.firstName || '');
                setLastName(initialUser.lastName || '');
                setPhone(initialUser.phone || '');
                setLocation(initialUser.location || '');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
