import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import SystemStatus from '../dashboard/SystemStatus';
import ItemManagement from '../inventory/ItemManagement';
import UserManagement from '../users/UserManagement';
import { BarChart3 } from 'lucide-react';

export default function MainApp({ onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications] = useState(3);

  // Sample data for products/items
  const [products, setProducts] = useState([
    { id: 1, name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', stock: 145, reorderPoint: 50, price: 29.99, status: 'In Stock', lastUpdated: '2024-11-20' },
    { id: 2, name: 'USB-C Cable', sku: 'UC-002', category: 'Electronics', stock: 42, reorderPoint: 50, price: 12.99, status: 'Low Stock', lastUpdated: '2024-11-19' },
    { id: 3, name: 'Notebook A5', sku: 'NB-003', category: 'Stationery', stock: 0, reorderPoint: 100, price: 8.99, status: 'Out of Stock', lastUpdated: '2024-11-21' },
    { id: 4, name: 'Desk Lamp', sku: 'DL-004', category: 'Furniture', stock: 67, reorderPoint: 20, price: 45.99, status: 'In Stock', lastUpdated: '2024-11-18' },
    { id: 5, name: 'Coffee Maker', sku: 'CM-005', category: 'Appliances', stock: 23, reorderPoint: 10, price: 89.99, status: 'In Stock', lastUpdated: '2024-11-20' },
  ]);

  // Sample data for users
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', department: 'IT', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-21 09:30' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', department: 'Sales', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-21 08:15' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', department: 'HR', company: 'Tech Corp', status: 'Inactive', lastLogin: '2024-11-19 14:20' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', department: 'Finance', company: 'Tech Corp', status: 'Active', lastLogin: '2024-11-20 16:45' },
  ]);

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
        />
        
        {activeView === 'dashboard' && <Dashboard products={products} users={users} />}
        {activeView === 'system-status' && <SystemStatus />}
        {activeView === 'items' && <ItemManagement products={products} setProducts={setProducts} searchTerm={searchTerm} />}
        {activeView === 'user-management' && <UserManagement />}
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