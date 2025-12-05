import { useState } from 'react';
import { Filter, ChevronDown, Upload, Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import AddItemModal from './AddItemModal';
import ExportMenu from './ExportMenu';

export default function ItemManagement({ products, setProducts, searchTerm }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Electronics', 'Stationery', 'Furniture', 'Appliances'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  return (
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
                    <span className="text-sm capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            )}

            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} items
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            
            <ExportMenu products={products} filteredProducts={filteredProducts} />
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Item Name</th>
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
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit item"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete item"
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

      {showAddModal && (
        <AddItemModal 
          setShowAddModal={handleCloseModal}
          products={products}
          setProducts={setProducts}
          editProduct={editingProduct}
        />
      )}
    </div>
  );
}