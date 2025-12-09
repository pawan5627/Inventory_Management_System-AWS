import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddRoleModal from './AddRoleModal';
import FilterRow from '../common/filters/FilterRow';
import SelectFilter from '../common/filters/SelectFilter';
import StatusBadge from '../common/StatusBadge';
import TableContainer from '../common/TableContainer';

export default function RolesTab({ roles, setRoles }) {
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('rolesFilter_status') || 'all');
  useEffect(() => { localStorage.setItem('rolesFilter_status', statusFilter); }, [statusFilter]);

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteRole = (id) => {
    const r = roles.find(x => x.id === id);
    if (!r) return;
    if (window.confirm(`Set role "${r.name}" inactive?`)) {
      setRoles(roles.map(x => x.id === id ? { ...x, status: 'Inactive' } : x));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Roles</h3>
        <button onClick={() => { setEditingRole(null); setShowAddRole(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>
      <FilterRow>
        <SelectFilter
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{value:'all',label:'All'},{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]}
        />
      </FilterRow>
      <TableContainer>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700">Role Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Description</th>
              <th className="text-left p-4 font-medium text-gray-700">Permissions</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Users</th>
              <th className="text-left p-4 font-medium text-gray-700">Created</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.filter(r => statusFilter === 'all' || (r.status || 'Active') === statusFilter).map(role => (
              <tr key={role.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{role.name}</td>
                <td className="p-4 text-gray-600">{role.description}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(role.permissions) ? role.permissions : []).map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {typeof perm === 'string' ? perm : `${perm.name} (${perm.level})`}
                      </span>
                    ))}
                  </div>
                </td>
                  <td className="p-4"><StatusBadge status={role.status || 'Active'} /></td>
                <td className="p-4 text-gray-600">{role.users}</td>
                <td className="p-4 text-gray-600">{role.created}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => { setEditingRole(role); setShowAddRole(true); }}>
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(role.id)}
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
      </TableContainer>

      {showAddRole && (
        <AddRoleModal
          setShowAddRole={setShowAddRole}
          roles={roles}
          setRoles={setRoles}
          editRole={editingRole}
        />
      )}
    </div>
  );
}