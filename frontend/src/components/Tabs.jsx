import React from 'react';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 16, display: 'flex', gap: 8 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderBottom: active === t.key ? '2px solid #2563eb' : '2px solid transparent',
            background: 'transparent',
            color: active === t.key ? '#111827' : '#6b7280',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
