import { useState } from 'react';

export default function SystemStatus() {
  const [systemStatus] = useState({
    serverStatus: 'Online',
    dbStatus: 'Connected',
    apiStatus: 'Operational',
    uptime: '99.9%',
    lastBackup: '2024-11-21 03:00',
    activeUsers: 127,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkLatency: '12ms'
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Online':
      case 'Connected':
      case 'Operational': 
        return 'bg-green-100 text-green-800';
      case 'Warning': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Offline':
      case 'Error': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Server Status</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.serverStatus)}`}>
              {systemStatus.serverStatus}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">{systemStatus.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium">{systemStatus.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium">{systemStatus.lastBackup}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Database Status</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.dbStatus)}`}>
              {systemStatus.dbStatus}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connections</span>
              <span className="text-sm font-medium">45/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Queries/sec</span>
              <span className="text-sm font-medium">1,245</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">23ms</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">API Status</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.apiStatus)}`}>
              {systemStatus.apiStatus}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Requests/min</span>
              <span className="text-sm font-medium">3,420</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Latency</span>
              <span className="text-sm font-medium">{systemStatus.networkLatency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-green-600">0.01%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU Usage</span>
              <span>{systemStatus.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${systemStatus.cpuUsage}%`}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory Usage</span>
              <span>{systemStatus.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: `${systemStatus.memoryUsage}%`}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Disk Usage</span>
              <span>{systemStatus.diskUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${systemStatus.diskUsage}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}