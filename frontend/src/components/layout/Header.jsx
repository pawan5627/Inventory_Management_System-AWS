import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, Bell, User, ChevronDown } from 'lucide-react';

export default function Header({ activeView, searchTerm, setSearchTerm, notifications, onLogout, setActiveView }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const allowedOptions = [
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'System Status', view: 'system-status' },
    { label: 'Items', view: 'items' },
    { label: 'Item Category', view: 'items' },
    { label: 'User Management', view: 'user-management' },
    { label: 'Users', view: 'user-management' },
    { label: 'Groups', view: 'user-management' },
    { label: 'Roles', view: 'user-management' },
    { label: 'Departments', view: 'user-management' },
    { label: 'Companies', view: 'user-management' },
    { label: 'Reports', view: 'reports' },
    { label: 'Profile', view: 'profile' },
  ];
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('profileAvatar');
    if (saved) setAvatarDataUrl(saved);
  }, []);

  const filteredOptions = allowedOptions.filter((opt) =>
    (searchTerm || '').toLowerCase().trim() === ''
      ? false
      : opt.label.toLowerCase().includes((searchTerm || '').toLowerCase().trim())
  );

  const triggerSearchNavigate = () => {
    if (!setActiveView) return;
    const exact = allowedOptions.find(
      (opt) => opt.label.toLowerCase() === (searchTerm || '').toLowerCase().trim()
    );
    const target = exact || filteredOptions[0];
    if (target) {
      setActiveView(target.view);
      setShowSearchOptions(false);
    }
  };
  const getTitle = () => {
    switch(activeView) {
      case 'system-status': return 'System Status';
      case 'items': return 'Item Management';
      case 'user-management': return 'User Management';
      case 'dashboard': return 'Dashboard';
      case 'reports': return 'Reports';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchOptions(true);
              }}
              onFocus={() => setShowSearchOptions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  triggerSearchNavigate();
                }
                if (e.key === 'Escape') {
                  setShowSearchOptions(false);
                }
              }}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

            {showSearchOptions && filteredOptions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow z-10 max-h-40 overflow-auto">
                {filteredOptions.map((opt) => (
                  <button
                    key={opt.label}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setActiveView && setActiveView(opt.view);
                      setShowSearchOptions(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded-lg"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setProfileOpen(false);
                    if (typeof setActiveView === 'function') setActiveView('profile');
                  }}
                >
                  Profile
                </button>
                <div className="h-px bg-gray-200" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setProfileOpen(false);
                    if (typeof onLogout === 'function') onLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}