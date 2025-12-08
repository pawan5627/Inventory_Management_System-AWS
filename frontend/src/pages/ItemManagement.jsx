import React, { useState } from 'react';
import Tabs from '../components/Tabs';
import ItemsTable from '../components/ItemsTable';
import CategoriesTable from '../components/CategoriesTable';

export default function ItemManagement() {
  const [active, setActive] = useState('items');

  const tabs = [
    { key: 'items', label: 'Items' },
    { key: 'categories', label: 'Category' },
  ];

  // Placeholder data; later replace with backend fetch
  const items = [
    { name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', stock: 145, price: '$29.99' },
    { name: 'USB-C Cable', sku: 'UC-002', category: 'Electronics', stock: 42, price: '$12.99' },
    { name: 'Notebook A5', sku: 'NB-003', category: 'Stationery', stock: 0, price: '$8.99' },
    { name: 'Desk Lamp', sku: 'DL-004', category: 'Furniture', stock: 67, price: '$45.99' },
    { name: 'Coffee Maker', sku: 'CM-005', category: 'Appliances', stock: 23, price: '$89.99' },
  ];

  const categories = [
    { name: 'Electronics', description: 'Devices and accessories', itemsCount: 2 },
    { name: 'Stationery', description: 'Office supplies', itemsCount: 1 },
    { name: 'Furniture', description: 'Home and office furniture', itemsCount: 1 },
    { name: 'Appliances', description: 'Kitchen and home appliances', itemsCount: 1 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Item Management</h2>
      <Tabs tabs={tabs} active={active} onChange={setActive} />
      {active === 'items' ? (
        <ItemsTable items={items} />
      ) : (
        <CategoriesTable categories={categories} />
      )}
    </div>
  );
}
