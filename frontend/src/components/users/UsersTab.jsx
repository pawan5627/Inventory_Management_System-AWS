import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddUserModal from './AddUsersModal';

export default function UsersTab({ users, setUsers }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteUser = (id) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    if (window.confirm(`Set user "${u.name}" inactive?`)) {
      setUsers(users.map(x => x.id === id ? { ...x, status: 'Inactive' } : x));
    }
  };

  const distinct = useMemo(() => {
    const groups = Array.from(new Set(users.map(u => (u.group || u.role || '').toString()).filter(Boolean)));
    const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));
    const companies = Array.from(new Set(users.map(u => u.company).filter(Boolean)));
    return { groups, departments, companies };
  }, [users]);

  const filteredUsers = users.filter(u => {
    const statusOk = statusFilter === 'all' || (u.status || '').toLowerCase() === statusFilter.toLowerCase();
    const groupValue = (u.group || u.role || '').toString();
    const groupOk = groupFilter === 'all' || groupValue === groupFilter;
    const deptOk = departmentFilter === 'all' || u.department === departmentFilter;
    const compOk = companyFilter === 'all' || u.company === companyFilter;
    return statusOk && groupOk && deptOk && compOk;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Users</h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">Group</label>
            <select className="w-full border rounded-lg px-3 py-2" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
              <option value="all">All</option>
              {distinct.groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Department</label>
            <select className="w-full border rounded-lg px-3 py-2" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="all">All</option>
              {distinct.departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Company</label>
            <select className="w-full border rounded-lg px-3 py-2" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
              <option value="all">All</option>
              {distinct.companies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Name</th>
                <th className="text-left p-4 font-medium text-gray-700">Email</th>
                <th className="text-left p-4 font-medium text-gray-700">Group</th>
                <th className="text-left p-4 font-medium text-gray-700">Department</th>
                <th className="text-left p-4 font-medium text-gray-700">Company</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.group || user.role}</td>
                  <td className="p-4 text-gray-600">{user.department}</td>
                  <td className="p-4 text-gray-600">{user.company}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{user.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => { setEditingUser(user); setShowAddModal(true); }}>
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
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
      </div>

      {showAddModal && (
        <AddUserModal 
          setShowAddModal={setShowAddModal}
          users={users}
          setUsers={setUsers}
          editUser={editingUser}
        />
      )}
    </>
  );
}