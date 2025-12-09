import { Package, DollarSign, AlertCircle, Users } from 'lucide-react';
import StatsCard from './StatsCard';

export default function Dashboard({ products, users, departments = [], companies = [] }) {
  const stats = [
    { 
      title: 'Total Products', 
      value: products.length, 
      icon: Package, 
      change: '+12%', 
      color: 'bg-blue-500',
      changeType: 'positive'
    },
    { 
      title: 'Total Stock Value', 
      value: `$${products.reduce((acc, p) => acc + (p.stock * p.price), 0).toFixed(2)}`, 
      icon: DollarSign, 
      change: '+8%', 
      color: 'bg-green-500',
      changeType: 'positive'
    },
    { 
      title: 'Low Stock Items', 
      value: products.filter(p => p.stock < p.reorderPoint && p.stock > 0).length, 
      icon: AlertCircle, 
      change: '-5%', 
      color: 'bg-yellow-500',
      changeType: 'negative'
    },
    { 
      title: 'Active Users', 
      value: users.filter(u => u.status === 'Active').length, 
      icon: Users, 
      change: '+3%', 
      color: 'bg-purple-500',
      changeType: 'positive'
    },
  ];

  const routes = [
    { id: 1, status: 'Active' },
    { id: 2, status: 'Active' },
    { id: 3, status: 'Active' },
    { id: 4, status: 'Active' },
  ];

  const toRelative = (d) => {
    const ts = Date.parse(d || '');
    if (!ts) return 'just now';
    const diffMs = Date.now() - ts;
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const lowStock = products.filter(p => p.stock > 0 && p.stock < p.reorderPoint).sort((a,b) => a.stock - b.stock)[0];
  const outOfStock = products.find(p => p.stock === 0);
  const newestUser = [...users].sort((a,b) => Date.parse(b.lastLogin || '') - Date.parse(a.lastLogin || ''))[0];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {newestUser && (
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New user activity</p>
                    <p className="text-xs text-gray-500">{newestUser.name || newestUser.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{toRelative(newestUser.lastLogin)}</span>
              </div>
            )}
            {outOfStock && (
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Out of stock</p>
                    <p className="text-xs text-gray-500">{outOfStock.name}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{toRelative(outOfStock.lastUpdated)}</span>
              </div>
            )}
            {lowStock && (
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-gray-500">{lowStock.name} - {lowStock.stock} units left</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{toRelative(lowStock.lastUpdated)}</span>
              </div>
            )}
            {!newestUser && !outOfStock && !lowStock && (
              <div className="text-sm text-gray-500 p-3">No recent activity</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-semibold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-semibold">127 users</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Departments</span>
              <span className="text-sm font-semibold">{(departments || []).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Companies</span>
              <span className="text-sm font-semibold">{(companies || []).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Routes</span>
              <span className="text-sm font-semibold">{routes.filter(r => r.status === 'Active').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}