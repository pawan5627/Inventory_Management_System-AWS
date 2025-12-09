import { useEffect, useState } from 'react';
import { authGet } from '../../apiClient';
import { User, Shield, Briefcase, Building2, MapPin } from 'lucide-react';
import UsersTab from './UsersTab';
import GroupsTab from './GroupsTab';
import RolesTab from './RolesTab';
import DepartmentsTab from './DepartmentsTab';
import CompaniesTab from './CompaniesTab';

export default function UserManagement() {
  const [activeUserTab, setActiveUserTab] = useState('users');

  // Sample data for users
  const [users, setUsers] = useState([]);

  // Sample data for groups
  const [groups, setGroups] = useState([]);

  // Sample data for roles
  const [roles, setRoles] = useState([]);

  // Sample data for departments
  const [departments, setDepartments] = useState([]);

  // Sample data for companies
  const [companies, setCompanies] = useState([]);

  // Load live data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await authGet('/api/users');
        if (!cancelled) setUsers(u || []);
      } catch (e) { console.warn('Failed users fetch', e); }
      try {
        const d = await authGet('/api/departments');
        if (!cancelled) setDepartments(d || []);
      } catch (e) { console.warn('Failed departments fetch', e); }
      try {
        const c = await authGet('/api/companies');
        if (!cancelled) setCompanies(c || []);
      } catch (e) { console.warn('Failed companies fetch', e); }
      try {
        const g = await authGet('/api/groups');
        const mapped = (g || []).map((grp) => ({
          id: grp.id || grp.group_id || grp.name,
          name: grp.name,
          description: grp.description || '',
          members: Array.isArray(grp.members) ? grp.members.length : (grp.membersCount || grp.usersCount || 0),
          permissions: Array.isArray(grp.permissions) ? grp.permissions.join(', ') : (grp.permissions || 'Read'),
          created: grp.createdAt || grp.created || '',
        }));
        if (!cancelled) setGroups(mapped);
      } catch (e) { console.warn('Failed groups fetch', e); }
      try {
        const r = await authGet('/api/roles');
        const mapped = (r || []).map((role) => ({
          id: role.id || role.role_id || role.name,
          name: role.name,
          description: role.description || '',
          permissions: role.permissions || [],
          users: role.usersCount || 0,
          created: role.createdAt || role.created || '',
        }));
        if (!cancelled) setRoles(mapped);
      } catch (e) { console.warn('Failed roles fetch', e); }
    })();
    return () => { cancelled = true; };
  }, []);

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
      {/* Routes page removed */}
    </div>
  );
}