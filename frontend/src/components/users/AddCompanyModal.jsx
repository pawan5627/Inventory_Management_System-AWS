import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function AddCompanyModal({ setShowAddCompany, companies, setCompanies, editCompany }) {
  const [form, setForm] = useState({ idNumber: '', name: '', industry: '', location: '', established: '', status: 'Active' });
  const ID_PREFIX = 'COM-';

  useEffect(() => {
    if (editCompany) {
      const existingIdNum = typeof editCompany.id === 'string' && editCompany.id.startsWith(ID_PREFIX)
        ? editCompany.id.slice(ID_PREFIX.length)
        : editCompany.id ?? '';
      setForm({
        idNumber: existingIdNum || '',
        name: editCompany.name || '',
        industry: editCompany.industry || '',
        location: editCompany.location || '',
        established: editCompany.established || '',
        status: editCompany.status || 'Active',
      });
    }
  }, [editCompany]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert('Company name is required');

    const idNumStr = form.idNumber ? String(form.idNumber).replace(/\D/g, '') : '';
    const idStr = idNumStr ? `${ID_PREFIX}${idNumStr}` : '';

    // Unique validations
    const existsByName = companies.find(c => c.name.toLowerCase() === name.toLowerCase());
    const existsById = idStr ? companies.find(c => c.id === idStr) : null;
    if (editCompany) {
      if (existsByName && existsByName.id !== editCompany.id) {
        return alert('Another company already uses this name');
      }
      if (existsById && existsById.id !== editCompany.id) {
        return alert('Another company already uses this ID');
      }
    } else {
      if (existsByName) return alert('Company name must be unique');
      if (existsById) return alert('Company ID must be unique');
    }

    const nextNumber = () => {
      const nums = companies
        .map(c => typeof c.id === 'string' && c.id.startsWith(ID_PREFIX) ? Number(c.id.slice(ID_PREFIX.length)) : (typeof c.id === 'number' ? c.id : 0))
        .filter(n => !Number.isNaN(n));
      const max = nums.length ? Math.max(...nums) : 0;
      return String(max + 1);
    };

    const payload = {
      id: idNumStr ? `${ID_PREFIX}${idNumStr}` : `${ID_PREFIX}${nextNumber()}`,
      name,
      industry: form.industry,
      location: form.location,
      established: form.established,
      status: form.status,
      employees: editCompany?.employees ?? 0,
      revenue: editCompany?.revenue ?? '',
    };

    if (editCompany) {
      setCompanies(companies.map(c => c.id === editCompany.id ? { ...c, ...payload, id: editCompany.id } : c));
    } else {
      setCompanies([...companies, payload]);
    }
    setShowAddCompany(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-visible">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">{editCompany ? 'Edit Company' : 'Add Company'}</h3>
          <button onClick={() => setShowAddCompany(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Tech Corp"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., New York"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.established}
                onChange={(e) => setForm(prev => ({ ...prev, established: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2010"
              />
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
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button type="button" onClick={() => setShowAddCompany(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">{editCompany ? 'Save' : 'Create Company'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
