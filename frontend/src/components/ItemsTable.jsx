import React from 'react';

export default function ItemsTable({ items }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={th}>Item Name</th>
            <th style={th}>SKU</th>
            <th style={th}>Category</th>
            <th style={th}>Stock</th>
            <th style={th}>Price</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.sku}>
              <td style={td}>{it.name}</td>
              <td style={td}>{it.sku}</td>
              <td style={td}>{it.category}</td>
              <td style={td}>{it.stock}</td>
              <td style={td}>{it.price}</td>
              <td style={td}>{renderStatus(it.stock)}</td>
              <td style={td}>
                <button style={iconBtn} title="View">👁️</button>
                <button style={iconBtn} title="Edit">✏️</button>
                <button style={iconBtn} title="Delete">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { textAlign: 'left', padding: '10px 12px', fontSize: 14, color: '#374151', borderBottom: '1px solid #e5e7eb' };
const td = { padding: '10px 12px', fontSize: 14, color: '#111827', borderBottom: '1px solid #f3f4f6' };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', marginRight: 8 };

function renderStatus(stock) {
  const label = stock <= 0 ? 'Out of Stock' : stock < 50 ? 'Low Stock' : 'In Stock';
  const color = stock <= 0 ? '#ef4444' : stock < 50 ? '#f59e0b' : '#10b981';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 9999,
      background: `${color}22`,
      color,
      fontWeight: 600,
      fontSize: 12
    }}>
      {label}
    </span>
  );
}
