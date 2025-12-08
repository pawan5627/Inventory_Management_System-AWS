import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddItemModal({ setShowAddModal, products, setProducts, categories = [], editProduct = null }) {
  const isEditMode = editProduct !== null;
  
  const [newProduct, setNewProduct] = useState(
    isEditMode ? {
      name: editProduct.name,
      sku: editProduct.sku,
      category: editProduct.category,
      stock: editProduct.stock.toString(),
      reorderPoint: editProduct.reorderPoint.toString(),
      price: editProduct.price.toString()
    } : {
      name: '', 
      sku: '', 
      category: '', 
      stock: '', 
      reorderPoint: '', 
      price: ''
    }
  );

  const [errors, setErrors] = useState({});

  const categoryOptions = categories && categories.length ? categories : ['Electronics', 'Stationery', 'Furniture', 'Appliances'];

  const validateForm = () => {
    const newErrors = {};
    
    if (!newProduct.name) {
      newErrors.name = 'Item name is required';
    }
    
    if (!newProduct.sku) {
      newErrors.sku = 'SKU is required';
    } else if (!isEditMode || editProduct.sku !== newProduct.sku) {
      // Check for duplicate SKU only if it's a new product or SKU has changed
      const skuExists = products.some(p => p.sku === newProduct.sku);
      if (skuExists) {
        newErrors.sku = 'SKU already exists';
      }
    }
    
    if (!newProduct.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!newProduct.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (parseInt(newProduct.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    if (!newProduct.reorderPoint) {
      newErrors.reorderPoint = 'Reorder point is required';
    } else if (parseInt(newProduct.reorderPoint) < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative';
    }
    
    if (!newProduct.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(newProduct.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddProduct = () => {
    if (!validateForm()) return;
    
    const stock = parseInt(newProduct.stock) || 0;
    const reorderPoint = parseInt(newProduct.reorderPoint) || 0;
    
    if (isEditMode) {
      // Update existing product
      const updatedProduct = {
        ...editProduct,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        stock: stock,
        reorderPoint: reorderPoint,
        price: parseFloat(newProduct.price) || 0,
        status: stock === 0 ? 'Out of Stock' : 
                stock < reorderPoint ? 'Low Stock' : 'In Stock',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setProducts(products.map(p => p.id === editProduct.id ? updatedProduct : p));
    } else {
      // Add new product
      const product = {
        id: products.length + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        stock: stock,
        reorderPoint: reorderPoint,
        price: parseFloat(newProduct.price) || 0,
        status: stock === 0 ? 'Out of Stock' : 
                stock < reorderPoint ? 'Low Stock' : 'In Stock',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, product]);
    }
    
    setNewProduct({ name: '', sku: '', category: '', stock: '', reorderPoint: '', price: '' });
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEditMode ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter item name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={newProduct.sku}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.sku ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter SKU"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={newProduct.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select category</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Point <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="reorderPoint"
                value={newProduct.reorderPoint}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border ${errors.reorderPoint ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0"
              />
              {errors.reorderPoint && <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                min="0"
                className={`w-full pl-7 pr-3 py-2 border ${errors.price ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
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
            {isEditMode ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}