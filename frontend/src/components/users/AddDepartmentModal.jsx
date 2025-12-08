import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function AddDepartmentModal({ setShowAddDepartment, departments, setDepartments, editDepartment }) {
  const [form, setForm] = useState({ idNumber: '', name: '', location: '', budget: '' });
  const ID_PREFIX = 'DEP-';

  useEffect(() => {
    if (editDepartment) {
      const existingIdNum = typeof editDepartment.id === 'string' && editDepartment.id.startsWith(ID_PREFIX)
        ? editDepartment.id.slice(ID_PREFIX.length)
        : editDepartment.id ?? '';
      setForm({ idNumber: existingIdNum || '', name: editDepartment.name || '', location: editDepartment.location || '', budget: editDepartment.budget || '' });
    }
  }, [editDepartment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert('Department name is required');
    // Unique validations
    const existingByName = departments.find(d => d.name.toLowerCase() === name.toLowerCase());
    const idNumStr = form.idNumber ? String(form.idNumber).replace(/\D/g, '') : '';
    const idStr = idNumStr ? `${ID_PREFIX}${idNumStr}` : '';
    const existingById = idStr ? departments.find(d => d.id === idStr) : null;
    if (editDepartment) {
      if (existingByName && existingByName.id !== editDepartment.id) {
        return alert('Another department already uses this name');
      }
      if (existingById && existingById.id !== editDepartment.id) {
        return alert('Another department already uses this ID');
      }
    } else {
      if (existingByName) return alert('Department name must be unique');
      if (existingById) return alert('Department ID must be unique');
    }
    const nextNumber = () => {
      const nums = departments
        .map(d => typeof d.id === 'string' && d.id.startsWith(ID_PREFIX) ? Number(d.id.slice(ID_PREFIX.length)) : (typeof d.id === 'number' ? d.id : 0))
        .filter(n => !Number.isNaN(n));
      const max = nums.length ? Math.max(...nums) : 0;
      return String(max + 1);
    };
    const payload = {
      id: idNumStr ? `${ID_PREFIX}${idNumStr}` : `${ID_PREFIX}${nextNumber()}`,
      name,
      // preserve existing optional fields if editing
      head: editDepartment?.head ?? '',
      employees: editDepartment?.employees ?? 0,
      location: form.location || '',
      budget: form.budget || '',
      status: editDepartment?.status ?? 'Active',
    };

    if (editDepartment) {
      setDepartments(departments.map(d => d.id === editDepartment.id ? { ...d, ...payload, id: editDepartment.id } : d));
    } else {
      setDepartments([...departments, payload]);
    }
    setShowAddDepartment(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg overflow-visible">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">{editDepartment ? 'Edit Department' : 'Add Department'}</h3>
          <button onClick={() => setShowAddDepartment(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Information Technology"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Building A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., $500,000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={() => setShowAddDepartment(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">{editDepartment ? 'Save' : 'Create Department'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
