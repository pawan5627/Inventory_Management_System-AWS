import { useState } from 'react';
import { User, Shield, Briefcase, Building2, MapPin } from 'lucide-react';
import UsersTab from './UsersTab';
import GroupsTab from './GroupsTab';
import RolesTab from './RolesTab';
import DepartmentsTab from './DepartmentsTab';
import CompaniesTab from './CompaniesTab';
import RoutesTab from './RoutesTab';

export default function UserManagement() {
  const [activeUserTab, setActiveUserTab] = useState('users');

  // Sample data for users
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', department: 'IT', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-21 09:30' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', department: 'Sales', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-21 08:15' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', department: 'HR', company: 'Tech Corp', status: 'Inactive', lastLogin: '2024-11-19 14:20' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', department: 'Finance', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-20 16:45' },
  ]);

  // Sample data for groups
  const [groups, setGroups] = useState([
    { id: 1, name: 'Administrators', description: 'Full system access', members: 5, permissions: 'All', created: '2024-01-15' },
    { id: 2, name: 'Managers', description: 'Department management access', members: 12, permissions: 'Read, Write, Approve', created: '2024-01-20' },
    { id: 3, name: 'Employees', description: 'Basic user access', members: 45, permissions: 'Read, Write', created: '2024-01-22' },
    { id: 4, name: 'Guests', description: 'Limited read-only access', members: 8, permissions: 'Read', created: '2024-02-10' },
  ]);

  // Sample data for roles
  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', description: 'System administrator', permissions: ['All'], users: 5, created: '2024-01-10' },
    { id: 2, name: 'Manager', description: 'Department manager', permissions: ['Read', 'Write', 'Approve'], users: 12, created: '2024-01-12' },
    { id: 3, name: 'User', description: 'Standard user', permissions: ['Read', 'Write'], users: 35, created: '2024-01-14' },
    { id: 4, name: 'Viewer', description: 'Read-only access', permissions: ['Read'], users: 8, created: '2024-01-16' },
  ]);

  // Sample data for departments
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Information Technology', head: 'John Doe', employees: 15, location: 'Building A', budget: '$500,000', status: 'Active' },
    { id: 2, name: 'Sales', head: 'Jane Smith', employees: 25, location: 'Building B', budget: '$1,200,000', status: 'Active' },
    { id: 3, name: 'Human Resources', head: 'Bob Johnson', employees: 8, location: 'Building A', budget: '$300,000', status: 'Active' },
    { id: 4, name: 'Finance', head: 'Alice Brown', employees: 12, location: 'Building C', budget: '$400,000', status: 'Active' },
  ]);

  // Sample data for companies
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Tech Corp', industry: 'Technology', employees: 500, revenue: '$50M', location: 'New York', status: 'Active', established: '2010' },
    { id: 2, name: 'Sales Partners Inc', industry: 'Sales', employees: 150, revenue: '$15M', location: 'Chicago', status: 'Active', established: '2015' },
    { id: 3, name: 'Global Solutions', industry: 'Consulting', employees: 200, revenue: '$25M', location: 'Los Angeles', status: 'Active', established: '2012' },
  ]);

  // Sample data for routes
  const [routes, setRoutes] = useState([
    { id: 1, path: '/dashboard', name: 'Dashboard', component: 'DashboardView', permissions: ['All'], status: 'Active', method: 'GET' },
    { id: 2, path: '/items', name: 'Item Management', component: 'ItemsView', permissions: ['Admin', 'Manager'], status: 'Active', method: 'GET' },
    { id: 3, path: '/users', name: 'User Management', component: 'UsersView', permissions: ['Admin'], status: 'Active', method: 'GET' },
    { id: 4, path: '/reports', name: 'Reports', component: 'ReportsView', permissions: ['Admin', 'Manager'], status: 'Active', method: 'GET' },
  ]);

  const tabs = [
    { id: 'users', label: 'Users', icon: User },
    { id: 'groups', label: 'Groups', icon: User },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'routes', label: 'Routes', icon: MapPin },
  ];

  return (
    <div className="p-6">
      {/* Sub-navigation for User Management */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex space-x-1 p-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveUserTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeUserTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeUserTab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
      {activeUserTab === 'groups' && <GroupsTab groups={groups} setGroups={setGroups} roles={roles} />}
      {activeUserTab === 'roles' && <RolesTab roles={roles} setRoles={setRoles} />}
      {activeUserTab === 'departments' && <DepartmentsTab departments={departments} setDepartments={setDepartments} />}
      {activeUserTab === 'companies' && <CompaniesTab companies={companies} setCompanies={setCompanies} />}
      {activeUserTab === 'routes' && <RoutesTab routes={routes} setRoutes={setRoutes} />}
    </div>
  );
}