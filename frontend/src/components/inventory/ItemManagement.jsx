import { useEffect, useState } from 'react';
import { authGet } from '../../apiClient';
import { Upload, Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import TableContainer from '../common/TableContainer';
import FilterRow from '../common/filters/FilterRow';
import SelectFilter from '../common/filters/SelectFilter';
import StatusBadge from '../common/StatusBadge';
import AddItemModal from './AddItemModal';
import AddCategoryModal from './AddCategoryModal';
import ExportMenu from './ExportMenu';

export default function ItemManagement({ products, setProducts, searchTerm }) {
  const [activeTab, setActiveTab] = useState('items');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [pendingEditCategory, setPendingEditCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('itemFilter_selectedCategory') || 'all');
  const [itemStatusFilter, setItemStatusFilter] = useState(() => localStorage.getItem('itemFilter_itemStatus') || 'all');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState(() => localStorage.getItem('itemFilter_categoryStatus') || 'all');

  useEffect(() => {
    localStorage.setItem('itemFilter_selectedCategory', selectedCategory);
  }, [selectedCategory]);
  useEffect(() => {
    localStorage.setItem('itemFilter_itemStatus', itemStatusFilter);
  }, [itemStatusFilter]);
  useEffect(() => {
    localStorage.setItem('itemFilter_categoryStatus', categoryStatusFilter);
  }, [categoryStatusFilter]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await authGet('/api/categories');
        const mapped = (list || []).map(c => ({ name: c.name, description: c.description, status: c.status }));
        if (!cancelled) setCategories(mapped);
      } catch (e) {
        console.warn('Failed categories fetch', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filterCategories = ['all', ...categories.map(c => c.name)];
  const categoryRows = categories.map(c => ({
    name: c.name,
    description: c.description,
    itemsCount: products.filter(p => p.category === c.name).length,
    status: c.status || 'Active'
  }));

  const getStatusColor = () => '';

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesItemStatus = (() => {
      if (itemStatusFilter === 'all') return true;
      return (product.status || '').toLowerCase() === itemStatusFilter.toLowerCase();
    })();
    return matchesSearch && matchesCategory && matchesItemStatus;
  });

  

  const handleDeleteProduct = (id) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    if (window.confirm(`Set item "${p.name}" inactive?`)) {
      setProducts(products.map(x => x.id === id ? { ...x, status: 'Inactive' } : x));
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
        <div className="px-4 pt-4 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 font-semibold ${activeTab === 'items' ? 'border-b-2 border-blue-600 text-gray-900' : 'text-gray-500'}`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 font-semibold ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-gray-900' : 'text-gray-500'}`}
            >
              Category
            </button>
          </div>
        </div>
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">

            {activeTab === 'items' ? (
              <span className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} items
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                {categoryRows.length} categories
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeTab === 'items' && (
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            )}
            {activeTab === 'items' && <ExportMenu products={products} filteredProducts={filteredProducts} />}
            {activeTab === 'items' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            )}
            {activeTab === 'categories' && (
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
          </div>
        </div>
        {/* Filters row similar to User Management */}
        {activeTab === 'items' && (
          <FilterRow>
            <SelectFilter
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={filterCategories.map(cat => ({ value: cat, label: cat === 'all' ? 'All' : cat }))}
            />
            <SelectFilter
              label="Status"
              value={itemStatusFilter}
              onChange={setItemStatusFilter}
              options={[{value:'all',label:'All'},{value:'In Stock',label:'In Stock'},{value:'Low Stock',label:'Low Stock'},{value:'Out of Stock',label:'Out of Stock'},{value:'Inactive',label:'Inactive'}]}
            />
          </FilterRow>
        )}
        {activeTab === 'categories' && (
          <FilterRow>
            <SelectFilter
              label="Status"
              value={categoryStatusFilter}
              onChange={setCategoryStatusFilter}
              options={[{value:'all',label:'All'},{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]}
            />
          </FilterRow>
        )}
        {activeTab === 'items' ? (
          <TableContainer>
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
                    <td className="p-4"><StatusBadge status={product.status} /></td>
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
          </TableContainer>
        ) : (
          <TableContainer>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-700">Category Name</th>
                  <th className="text-left p-4 font-medium text-gray-700">Description</th>
                  <th className="text-left p-4 font-medium text-gray-700">Items Count</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows
                  .filter(cat => {
                    if (categoryStatusFilter === 'all') return true;
                    return (cat.status || 'Active') === categoryStatusFilter;
                  })
                  .map(cat => (
                  <tr key={cat.name} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium">{cat.name}</p>
                    </td>
                    <td className="p-4 text-gray-600">{cat.description}</td>
                    <td className="p-4 text-gray-600">{cat.itemsCount}</td>
                    <td className="p-4"><StatusBadge status={cat.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded" title="View details">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Edit category" onClick={() => {
                          const existing = categories.find(c => c.name === cat.name);
                          setShowAddCategory(true);
                          // pass editCategory via onSave closure by setting a ref-like state
                          setPendingEditCategory(existing);
                        }}>
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Delete category" onClick={() => {
                          if (window.confirm(`Set category \"${cat.name}\" inactive?`)) {
                            setCategories(prev => prev.map(c => c.name === cat.name ? { ...c, status: 'Inactive' } : c));
                          }
                        }}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        )}
      </div>

      {showAddModal && (
        <AddItemModal 
          setShowAddModal={handleCloseModal}
          products={products}
          setProducts={setProducts}
          categories={categories.map(c => c.name)}
          editProduct={editingProduct}
        />
      )}
      {showAddCategory && (
        <AddCategoryModal 
          setShowAddCategory={setShowAddCategory}
          editCategory={pendingEditCategory || null}
          onSave={(payload) => {
            const name = payload.name;
            const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
            if (pendingEditCategory) {
              setCategories(prev => prev.map(c => c.name === pendingEditCategory.name ? { ...c, name, status: payload.status, description: c.description } : c));
            } else {
              if (exists) {
                alert('Category already exists');
                return;
              }
              setCategories(prev => [...prev, { name, description: '', status: payload.status }]);
            }
            setPendingEditCategory(null);
            setShowAddCategory(false);
          }}
        />
      )}
    </div>
  );
}