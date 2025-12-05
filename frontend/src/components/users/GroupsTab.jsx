import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function GroupsTab({ groups, setGroups }) {
  const handleDeleteGroup = (id) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Groups</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Group</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700">Group Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Description</th>
              <th className="text-left p-4 font-medium text-gray-700">Members</th>
              <th className="text-left p-4 font-medium text-gray-700">Permissions</th>
              <th className="text-left p-4 font-medium text-gray-700">Created</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{group.name}</td>
                <td className="p-4 text-gray-600">{group.description}</td>
                <td className="p-4 text-gray-600">{group.members}</td>
                <td className="p-4 text-gray-600">{group.permissions}</td>
                <td className="p-4 text-gray-600">{group.created}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
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
      </div>
    </div>
  );
}