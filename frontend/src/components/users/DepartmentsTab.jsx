import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddDepartmentModal from './AddDepartmentModal';

export default function DepartmentsTab({ departments, setDepartments }) {
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteDepartment = (id) => {
    const dept = departments.find(d => d.id === id);
    if (!dept) return;
    if (!confirm(`Set department "${dept.name}" inactive?`)) return;
    setDepartments(departments.map(d => d.id === id ? { ...d, status: 'Inactive' } : d));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Departments</h3>
        <button onClick={() => { setEditingDepartment(null); setShowAddDepartment(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>
      <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select className="w-full border rounded-lg px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700">Department</th>
              <th className="text-left p-4 font-medium text-gray-700">Head</th>
              <th className="text-left p-4 font-medium text-gray-700">Employees</th>
              <th className="text-left p-4 font-medium text-gray-700">Location</th>
              <th className="text-left p-4 font-medium text-gray-700">Budget</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.filter(d => statusFilter === 'all' || d.status === statusFilter).map(dept => (
              <tr key={dept.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{dept.name}</td>
                <td className="p-4 text-gray-600">{dept.head}</td>
                <td className="p-4 text-gray-600">{dept.employees}</td>
                <td className="p-4 text-gray-600">{dept.location}</td>
                <td className="p-4 text-gray-600">{dept.budget}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dept.status)}`}>
                    {dept.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => { setEditingDepartment(dept); setShowAddDepartment(true); }}>
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddDepartment && (
        <AddDepartmentModal
          setShowAddDepartment={setShowAddDepartment}
          departments={departments}
          setDepartments={setDepartments}
          editDepartment={editingDepartment}
        />
      )}
    </div>
  );
}