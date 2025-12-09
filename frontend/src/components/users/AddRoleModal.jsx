import { useEffect, useMemo, useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddRoleModal({ setShowAddRole, roles, setRoles, editRole }) {
  const [form, setForm] = useState({ idNumber: '', name: '', fullAccess: false, permissions: [], description: '', status: 'Active' });
  const ID_PREFIX = 'ROL-';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [permQuery, setPermQuery] = useState('');

  // Define available permissions categories
  const availablePermissions = useMemo(() => ([
    'Analytics',
    'User Management',
    'Item Management',
    'Inventory',
    'Reports',
    'Settings',
    'Audit Logs',
    'System Status',
  ]), []);

  // Prefill for edit
  useEffect(() => {
    if (editRole) {
      const normalizedPerms = Array.isArray(editRole.permissions)
        ? editRole.permissions.map(p => typeof p === 'string' ? { name: p, level: 'view' } : p)
        : [];
      // Extract numeric part if id has prefix
      const existingIdNum = typeof editRole.id === 'string' && editRole.id.startsWith(ID_PREFIX)
        ? editRole.id.slice(ID_PREFIX.length)
        : editRole.id ?? '';
      setForm({
        idNumber: existingIdNum || '',
        name: editRole.name || '',
        description: editRole.description || '',
        status: editRole.status || 'Active',
        fullAccess: !!editRole.fullAccess,
        permissions: normalizedPerms,
      });
    }
  }, [editRole]);

  const addPermission = (name) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.some(p => p.name === name)
        ? prev.permissions
        : [...prev.permissions, { name, level: 'view' }]
    }));
  };

  const removePermission = (name) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => p.name !== name)
    }));
  };

  const setPermissionLevel = (name, level) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => p.name === name ? { ...p, level } : p)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Role name is required');
    const num = form.idNumber ? String(form.idNumber).replace(/\D/g, '') : '';
    const composeId = (n) => `${ID_PREFIX}${n}`;
    const nextNumber = () => {
      const nums = roles
        .map(r => typeof r.id === 'string' && r.id.startsWith(ID_PREFIX) ? Number(r.id.slice(ID_PREFIX.length)) : (typeof r.id === 'number' ? r.id : 0))
        .filter(n => !Number.isNaN(n));
      const max = nums.length ? Math.max(...nums) : 0;
      return String(max + 1);
    };

    const payload = {
      id: num ? composeId(num) : composeId(nextNumber()),
      name: form.name.trim(),
      description: form.description?.trim() || '',
      users: editRole?.users ?? 0,
      created: editRole?.created ?? new Date().toISOString().slice(0, 10),
      fullAccess: form.fullAccess,
      permissions: form.fullAccess ? availablePermissions.map(n => ({ name: n, level: 'full' })) : form.permissions,
      status: form.status,
    };

    if (editRole) {
      setRoles(roles.map(r => r.id === editRole.id ? { ...r, ...payload, id: editRole.id } : r));
    } else {
      setRoles([...roles, payload]);
    }
    setShowAddRole(false);
  };

  const visibleOptions = availablePermissions
    .filter(n => !form.permissions.some(p => p.name === n))
    .filter(n => n.toLowerCase().includes(permQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-visible">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">{editRole ? 'Edit Role' : 'Add Role'}</h3>
          <button onClick={() => setShowAddRole(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role ID</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-lg text-sm">{ID_PREFIX}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.idNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, idNumber: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty to auto-generate"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional: brief description of the role"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="full-access"
                type="checkbox"
                checked={form.fullAccess}
                onChange={(e) => setForm(prev => ({ ...prev, fullAccess: e.target.checked }))}
              />
              <label htmlFor="full-access" className="text-sm font-medium text-gray-700">Full Access (grays out individual levels)</label>
            </div>

            <label className="block text-sm font-medium text-gray-700">Add Permissions</label>
            <div className="relative">
              <div className="flex items-center flex-wrap gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <button
                  type="button"
                  disabled={form.fullAccess}
                  onClick={() => !form.fullAccess && setDropdownOpen(v => !v)}
                  className={`px-2 py-1 rounded text-sm ${form.fullAccess ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Select permission
                </button>
                {form.permissions.map(p => (
                  <span key={p.name} className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Check className="w-3 h-3" />
                    {p.name}
                    <select
                      disabled={form.fullAccess}
                      value={p.level}
                      onChange={(e) => setPermissionLevel(p.name, e.target.value)}
                      className={`text-xs px-1 py-0.5 border rounded ${form.fullAccess ? 'bg-gray-100 text-gray-500' : ''}`}
                    >
                      <option value="denied">Denied</option>
                      <option value="view">View</option>
                      <option value="full">Full</option>
                    </select>
                    <button type="button" onClick={() => removePermission(p.name)} className="ml-1 text-blue-700 hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>

              {dropdownOpen && !form.fullAccess && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={permQuery}
                      onChange={(e) => setPermQuery(e.target.value)}
                      placeholder="Search permission..."
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <ul className="max-h-32 overflow-auto">
                    {visibleOptions.map(name => (
                      <li key={name}>
                        <button
                          type="button"
                          onClick={() => addPermission(name)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={() => setShowAddRole(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">{editRole ? 'Save' : 'Create Role'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
