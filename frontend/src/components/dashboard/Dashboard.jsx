import { Package, DollarSign, AlertCircle, Users } from 'lucide-react';
import StatsCard from './StatsCard';

export default function Dashboard({ products, users }) {
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

  const departments = [
    { id: 1, name: 'Information Technology', employees: 15 },
    { id: 2, name: 'Sales', employees: 25 },
    { id: 3, name: 'Human Resources', employees: 8 },
    { id: 4, name: 'Finance', employees: 12 },
  ];

  const companies = [
    { id: 1, name: 'Tech Corp' },
    { id: 2, name: 'Sales Partners Inc' },
    { id: 3, name: 'Global Solutions' },
  ];

  const routes = [
    { id: 1, status: 'Active' },
    { id: 2, status: 'Active' },
    { id: 3, status: 'Active' },
    { id: 4, status: 'Active' },
  ];

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
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New stock received</p>
                  <p className="text-xs text-gray-500">USB-C Cable - 100 units</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">Sarah Wilson - Marketing</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-gray-500">Wireless Mouse - 45 units left</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
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
              <span className="text-sm font-semibold">{departments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Companies</span>
              <span className="text-sm font-semibold">{companies.length}</span>
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