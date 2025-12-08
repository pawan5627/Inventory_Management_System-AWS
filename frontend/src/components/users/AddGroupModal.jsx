import { useEffect, useMemo, useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddGroupModal({ setShowAddGroup, groups, setGroups, editGroup, availableRoles = [] }) {
  const [form, setForm] = useState({ id: '', name: '', roles: [] });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const roleOptions = useMemo(() => (availableRoles || []).map(r => r.name || r), [availableRoles]);

  // Prefill for edit
  useEffect(() => {
    if (editGroup) {
      setForm({ id: editGroup.id || '', name: editGroup.name || '', roles: Array.isArray(editGroup.roles) ? editGroup.roles : [] });
    }
  }, [editGroup]);

  const addRole = (role) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles : [...prev.roles, role]
    }));
  };

  const removeRole = (role) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Group name is required');
    const idVal = form.id ? Number(form.id) : undefined;
    const newGroup = {
      id: idVal ?? (groups.length ? Math.max(...groups.map(g => g.id)) + 1 : 1),
      name: form.name.trim(),
      description: '',
      members: 0,
      permissions: form.roles.join(', '),
      roles: form.roles,
      created: new Date().toISOString().slice(0, 10)
    };

    if (editGroup) {
      setGroups(groups.map(g => g.id === editGroup.id ? { ...g, ...newGroup, id: editGroup.id } : g));
    } else {
      setGroups([...groups, newGroup]);
    }
    setShowAddGroup(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-visible">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">{editGroup ? 'Edit Group' : 'Add Group'}</h3>
          <button onClick={() => setShowAddGroup(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
              <input
                type="number"
                value={form.id}
                onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty to auto-generate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Admins"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Roles</label>
            <div className="relative">
              <div className="flex items-center flex-wrap gap-2 border border-gray-300 rounded-lg px-3 py-2">
                <button type="button" onClick={() => setDropdownOpen(v => !v)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">Select roles</button>
                {form.roles.map(role => (
                  <span key={role} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <Check className="w-3 h-3" />
                    {role}
                    <button type="button" onClick={() => removeRole(role)} className="ml-1 text-blue-700 hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={roleQuery}
                      onChange={(e) => setRoleQuery(e.target.value)}
                      placeholder="Search role..."
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  {/* Show up to ~3 items, scroll for more */}
                  <ul className="max-h-32 overflow-auto">
                    {roleOptions
                      .filter(r => !form.roles.includes(r))
                      .filter(r => r.toLowerCase().includes(roleQuery.toLowerCase()))
                      .map(role => (
                        <li key={role}>
                          <button
                            type="button"
                            onClick={() => addRole(role)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          >
                            {role}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={() => setShowAddGroup(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">{editGroup ? 'Save' : 'Create Group'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
