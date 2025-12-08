export default function SelectFilter({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
