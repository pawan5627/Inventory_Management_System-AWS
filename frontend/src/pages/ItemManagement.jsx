import React, { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import ItemsTable from '../components/ItemsTable';
import CategoriesTable from '../components/CategoriesTable';
import { apiGet } from '../apiClient';

export default function ItemManagement() {
  const [active, setActive] = useState('items');

  const tabs = [
    { key: 'items', label: 'Items' },
    { key: 'categories', label: 'Category' },
  ];

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          apiGet('/api/items'),
          apiGet('/api/categories', true)
        ]);
        if (!mounted) return;
        setItems(itemsRes.map(it => ({
          name: it.name,
          sku: it.sku,
          category: it.category,
          stock: it.stock,
          price: `$${Number(it.price).toFixed(2)}`
        })));
        setCategories(categoriesRes.map(c => ({
          name: c.name,
          description: c.description,
          itemsCount: c.itemsCount
        })));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Item Management</h2>
      {error && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: '#fee2e2', color: '#b91c1c' }}>
          {error}
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
      <Tabs tabs={tabs} active={active} onChange={setActive} />
      {active === 'items' ? (
        <ItemsTable items={items} />
      ) : (
        <CategoriesTable categories={categories} />
      )}
      )}
    </div>
  );
}
