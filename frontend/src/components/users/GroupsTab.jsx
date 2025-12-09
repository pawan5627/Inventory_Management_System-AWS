import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddGroupModal from './AddGroupModal';
import FilterRow from '../common/filters/FilterRow';
import SelectFilter from '../common/filters/SelectFilter';
import StatusBadge from '../common/StatusBadge';
import TableContainer from '../common/TableContainer';

export default function GroupsTab({ groups, setGroups, roles = [] }) {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('groupsFilter_status') || 'all');
  useEffect(() => { localStorage.setItem('groupsFilter_status', statusFilter); }, [statusFilter]);

  const handleDeleteGroup = async (id) => {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    if (window.confirm(`Set group "${g.name}" inactive?`)) {
      try {
        const { authPut } = await import('../../apiClient');
        await authPut(`/api/groups/${id}`, { status: 'Inactive' });
        setGroups(groups.map(x => x.id === id ? { ...x, status: 'Inactive' } : x));
      } catch (error) {
        console.error('Failed to update group status:', error);
        alert('Failed to update group status. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Groups</h3>
        <button onClick={() => { setEditingGroup(null); setShowAddGroup(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Group</span>
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
              <th className="text-left p-4 font-medium text-gray-700">Group Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Description</th>
              <th className="text-left p-4 font-medium text-gray-700">Members</th>
              <th className="text-left p-4 font-medium text-gray-700">Permissions</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Created</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.filter(g => statusFilter === 'all' || (g.status || 'Active') === statusFilter).map(group => (
              <tr key={group.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{group.name}</td>
                <td className="p-4 text-gray-600">{group.description}</td>
                <td className="p-4 text-gray-600">{group.members}</td>
                <td className="p-4 text-gray-600">{group.permissions}</td>
                <td className="p-4"><StatusBadge status={group.status || 'Active'} /></td>
                <td className="p-4 text-gray-600">{group.created}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => { setEditingGroup(group); setShowAddGroup(true); }}>
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGroup(group.id)}
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
    </div>

    {showAddGroup && (
      <AddGroupModal 
        setShowAddGroup={setShowAddGroup}
        groups={groups}
        setGroups={setGroups}
        editGroup={editingGroup}
        availableRoles={roles}
      />
    )}
    </>
  );
}