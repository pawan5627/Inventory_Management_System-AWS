import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, Search, Plus, Edit2, Trash2, Eye, Download, Upload, Filter, ChevronDown, X, Check, BarChart3, ShoppingCart, Users, DollarSign, ArrowUp, ArrowDown, Calendar, Bell, Settings, LogOut, Menu, Home, Box, FileText, User } from 'lucide-react';

const InventoryManagementSystem = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState(3);
  
  // Sample data
  const [products, setProducts] = useState([
    { id: 1, name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', stock: 145, reorderPoint: 50, price: 29.99, status: 'In Stock', lastUpdated: '2024-11-20' },
    { id: 2, name: 'USB-C Cable', sku: 'UC-002', category: 'Electronics', stock: 42, reorderPoint: 50, price: 12.99, status: 'Low Stock', lastUpdated: '2024-11-19' },
    { id: 3, name: 'Notebook A5', sku: 'NB-003', category: 'Stationery', stock: 0, reorderPoint: 100, price: 8.99, status: 'Out of Stock', lastUpdated: '2024-11-21' },
    { id: 4, name: 'Desk Lamp', sku: 'DL-004', category: 'Furniture', stock: 67, reorderPoint: 20, price: 45.99, status: 'In Stock', lastUpdated: '2024-11-18' },
    { id: 5, name: 'Coffee Maker', sku: 'CM-005', category: 'Appliances', stock: 23, reorderPoint: 10, price: 89.99, status: 'In Stock', lastUpdated: '2024-11-20' },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', stock: '', reorderPoint: '', price: ''
  });

  const categories = ['all', 'Electronics', 'Stationery', 'Furniture', 'Appliances'];

  const stats = [
    { title: 'Total Products', value: products.length, icon: Package, change: '+12%', color: 'bg-blue-500' },
    { title: 'Total Stock Value', value: `$${products.reduce((acc, p) => acc + (p.stock * p.price), 0).toFixed(2)}`, icon: DollarSign, change: '+8%', color: 'bg-green-500' },
    { title: 'Low Stock Items', value: products.filter(p => p.stock < p.reorderPoint && p.stock > 0).length, icon: AlertCircle, change: '-5%', color: 'bg-yellow-500' },
    { title: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: TrendingUp, change: '0%', color: 'bg-red-500' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category || 'Uncategorized',
        stock: parseInt(newProduct.stock) || 0,
        reorderPoint: parseInt(newProduct.reorderPoint) || 0,
        price: parseFloat(newProduct.price) || 0,
        status: parseInt(newProduct.stock) === 0 ? 'Out of Stock' : 
                parseInt(newProduct.stock) < parseInt(newProduct.reorderPoint) ? 'Low Stock' : 'In Stock',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', sku: '', category: '', stock: '', reorderPoint: '', price: '' });
      setShowAddModal(false);
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Inventory Pro</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-gray-800 p-2 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'dashboard' && 'bg-gray-800'}`}>
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button onClick={() => setActiveView('products')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'products' && 'bg-gray-800'}`}>
            <Package className="w-5 h-5" />
            {sidebarOpen && <span>Products</span>}
          </button>
          <button onClick={() => setActiveView('orders')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'orders' && 'bg-gray-800'}`}>
            <ShoppingCart className="w-5 h-5" />
            {sidebarOpen && <span>Orders</span>}
          </button>
          <button onClick={() => setActiveView('reports')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'reports' && 'bg-gray-800'}`}>
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Reports</span>}
          </button>
          <button onClick={() => setActiveView('suppliers')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'suppliers' && 'bg-gray-800'}`}>
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Suppliers</span>}
          </button>
        </nav>
        
        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 text-red-400">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </div>
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
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-gray-500">Wireless Mouse - 45 units left</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Out of stock</p>
                  <p className="text-xs text-gray-500">Notebook A5</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Stock Levels by Category</h3>
          <div className="space-y-4">
            {categories.filter(c => c !== 'all').map(category => {
              const categoryProducts = products.filter(p => p.category === category);
              const totalStock = categoryProducts.reduce((acc, p) => acc + p.stock, 0);
              const maxStock = 500;
              const percentage = (totalStock / maxStock) * 100;
              
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-500">{totalStock} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsView = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilterMenu && (
              <div className="absolute top-16 bg-white border rounded-lg shadow-lg p-4 z-10">
                <h4 className="font-medium mb-2">Category</h4>
                {categories.map(cat => (
                  <label key={cat} className="flex items-center space-x-2 mb-2">
                    <input
                      type="radio"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="text-blue-500"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Product</th>
                <th className="text-left p-4 font-medium text-gray-700">SKU</th>
                <th className="text-left p-4 font-medium text-gray-700">Category</th>
                <th className="text-left p-4 font-medium text-gray-700">Stock</th>
                <th className="text-left p-4 font-medium text-gray-700">Price</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Last updated: {product.lastUpdated}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.sku}</td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${product.stock < product.reorderPoint ? 'text-red-600' : 'text-gray-800'}`}>
                        {product.stock}
                      </span>
                      {product.stock < product.reorderPoint && product.stock > 0 && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
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
    </div>
  );

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Product</h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
              <input
                type="number"
                value={newProduct.reorderPoint}
                onChange={(e) => setNewProduct({...newProduct, reorderPoint: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'products' && <ProductsView />}
        {activeView === 'orders' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Orders Management</h3>
              <p className="text-gray-500 mt-2">Order tracking and management features coming soon</p>
            </div>
          </div>
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
        {activeView === 'suppliers' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Supplier Management</h3>
              <p className="text-gray-500 mt-2">Supplier relationship management features coming soon</p>
            </div>
          </div>
        )}
      </div>
      
      {showAddModal && <AddProductModal />}
    </div>
  );
};

export default InventoryManagementSystem;