export default function StatsCard({ stat }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${stat.color} p-3 rounded-lg`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-sm font-medium ${
          stat.changeType === 'positive' ? 'text-green-600' : 
          stat.changeType === 'negative' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {stat.change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
      <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
    </div>
  );
}