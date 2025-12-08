import React from 'react';

export default function CategoriesTable({ categories }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={th}>Category Name</th>
            <th style={th}>Description</th>
            <th style={th}>Items Count</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.name}>
              <td style={td}>{cat.name}</td>
              <td style={td}>{cat.description || '-'}</td>
              <td style={td}>{cat.itemsCount ?? 0}</td>
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
