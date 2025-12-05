import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CompaniesTab({ companies, setCompanies }) {
  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Companies</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-700">Company Name</th>
              <th className="text-left p-4 font-medium text-gray-700">Industry</th>
              <th className="text-left p-4 font-medium text-gray-700">Employees</th>
              <th className="text-left p-4 font-medium text-gray-700">Revenue</th>
              <th className="text-left p-4 font-medium text-gray-700">Location</th>
              <th className="text-left p-4 font-medium text-gray-700">Established</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{company.name}</td>
                <td className="p-4 text-gray-600">{company.industry}</td>
                <td className="p-4 text-gray-600">{company.employees}</td>
                <td className="p-4 text-gray-600">{company.revenue}</td>
                <td className="p-4 text-gray-600">{company.location}</td>
                <td className="p-4 text-gray-600">{company.established}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCompany(company.id)}
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