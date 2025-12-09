import { useEffect, useState } from 'react';
import { authGet, withUnauthorizedHandler } from '../../apiClient';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import SystemStatus from '../dashboard/SystemStatus';
import ItemManagement from '../inventory/ItemManagement';
import UserManagement from '../users/UserManagement';
import Profile from '../profile/Profile';
import { BarChart3 } from 'lucide-react';

export default function MainApp({ onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifs, setDismissedNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedNotifications') || '[]'); } catch { return []; }
  });

  // Sample data for products/items
  const [products, setProducts] = useState([]);

  // Fetch live items from backend with polling and 401 handling
  useEffect(() => {
    let cancelled = false;
    const client = withUnauthorizedHandler(() => onLogout?.());
    const fetchItems = async () => {
      try {
        const items = await client.get('/api/items');
        if (!cancelled) setProducts(items || []);
      } catch (e) {
        if (e.status !== 401) console.warn('Failed to fetch items', e);
      }
    };
    fetchItems();
    const interval = setInterval(fetchItems, 30000); // 30s polling
    return () => { cancelled = true; clearInterval(interval); };
  }, [onLogout]);
  
  // Build notifications from products (low/out of stock) and exclude dismissed
  useEffect(() => {
    const notes = [];
    for (const p of products) {
      if (p.stock === 0 || (p.status || '').toLowerCase() === 'out of stock') {
        notes.push({ id: `stock-${p.id}-out`, type: 'critical', message: `Out of stock: ${p.name}`, productId: p.id });
      } else if (p.stock < p.reorderPoint || (p.status || '').toLowerCase() === 'low stock') {
        notes.push({ id: `stock-${p.id}-low`, type: 'warning', message: `Low stock: ${p.name} (${p.stock})`, productId: p.id });
      }
    }
    const filtered = notes.filter(n => !dismissedNotifs.includes(n.id));
    setNotifications(filtered);
  }, [products, dismissedNotifs]);

  const dismissNotification = (id) => {
    setDismissedNotifs(prev => {
      const next = Array.from(new Set([...(prev || []), id]));
      localStorage.setItem('dismissedNotifications', JSON.stringify(next));
      return next;
    });
  };

  // Sample data for users
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const client = withUnauthorizedHandler(() => onLogout?.());
    const fetchUsers = async () => {
      try {
        const data = await client.get('/api/users');
        if (!cancelled) setUsers(data || []);
      } catch (e) {
        if (e.status !== 401) console.warn('Failed to fetch users', e);
      }
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000); // 60s polling
    return () => { cancelled = true; clearInterval(interval); };
  }, [onLogout]);

  // Fetch departments and companies for dashboard quick stats
  useEffect(() => {
    let cancelled = false;
    const client = withUnauthorizedHandler(() => onLogout?.());
    const fetchMeta = async () => {
      try {
        const d = await client.get('/api/departments');
        const c = await client.get('/api/companies');
        if (!cancelled) {
          setDepartments(d || []);
          setCompanies(c || []);
        }
      } catch (e) {
        if (e.status !== 401) console.warn('Failed to fetch departments/companies', e);
      }
    };
    fetchMeta();
    const interval = setInterval(fetchMeta, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [onLogout]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={onLogout}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header 
          activeView={activeView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifications={notifications}
          onDismissNotification={dismissNotification}
          onLogout={onLogout}
          setActiveView={setActiveView}
        />
        
        {activeView === 'dashboard' && <Dashboard products={products} users={users} departments={departments} companies={companies} />}
        {activeView === 'system-status' && <SystemStatus />}
        {activeView === 'items' && <ItemManagement products={products} setProducts={setProducts} searchTerm={searchTerm} />}
        {activeView === 'user-management' && <UserManagement />}
        {activeView === 'profile' && (
          <Profile initialUser={(function(){
            try {
              const raw = localStorage.getItem('user');
              if (!raw) return { firstName: 'Admin', lastName: '', email: 'admin@example.com' };
              const u = JSON.parse(raw);
              const name = (u.name || '').split(' ');
              return { firstName: name[0] || 'Admin', lastName: name[1] || '', email: u.email || 'admin@example.com' };
            } catch {
              return { firstName: 'Admin', lastName: '', email: 'admin@example.com' };
            }
          })()} />
        )}
        {activeView === 'reports' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Analytics & Reports</h3>
              <p className="text-gray-500 mt-2">Detailed analytics and reporting features coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}