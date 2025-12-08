import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddCompanyModal from './AddCompanyModal';
import FilterRow from '../common/filters/FilterRow';
import SelectFilter from '../common/filters/SelectFilter';
import StatusBadge from '../common/StatusBadge';
import TableContainer from '../common/TableContainer';

export default function CompaniesTab({ companies, setCompanies }) {
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('companiesFilter_status') || 'all');
  useEffect(() => { localStorage.setItem('companiesFilter_status', statusFilter); }, [statusFilter]);
  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleDeleteCompany = (id) => {
    const c = companies.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`Set company "${c.name}" inactive?`)) return;
    setCompanies(companies.map(x => x.id === id ? { ...x, status: 'Inactive' } : x));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Companies</h3>
        <button onClick={() => { setEditingCompany(null); setShowAddCompany(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
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
            {companies.filter(c => statusFilter === 'all' || c.status === statusFilter).map(company => (
              <tr key={company.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{company.name}</td>
                <td className="p-4 text-gray-600">{company.industry}</td>
                <td className="p-4 text-gray-600">{company.employees}</td>
                <td className="p-4 text-gray-600">{company.revenue}</td>
                <td className="p-4 text-gray-600">{company.location}</td>
                <td className="p-4 text-gray-600">{company.established}</td>
                <td className="p-4"><StatusBadge status={company.status} /></td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => { setEditingCompany(company); setShowAddCompany(true); }}>
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
      </TableContainer>

      {showAddCompany && (
        <AddCompanyModal
          setShowAddCompany={setShowAddCompany}
          companies={companies}
          setCompanies={setCompanies}
          editCompany={editingCompany}
        />
      )}
    </div>
  );
}