export default function StatusBadge({ status = '' }) {
  const s = (status || '').toString();
  const map = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800',
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };
  const cls = map[s] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{s || '—'}</span>
  );
}
