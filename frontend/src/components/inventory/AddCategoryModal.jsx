import { useState } from 'react';

export default function AddCategoryModal({ setShowAddCategory, onSave }) {
  const [form, setForm] = useState({ id: '', name: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Category name is required');
    onSave({ id: form.id ? Number(form.id) : undefined, name: form.name.trim() });
    setShowAddCategory(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add Category</h3>
          <button onClick={() => setShowAddCategory(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category ID (optional)</label>
            <input
              type="number"
              name="id"
              value={form.id}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="Leave empty to auto-generate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g., Electronics"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowAddCategory(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
