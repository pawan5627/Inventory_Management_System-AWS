import { Home, Package, Users, BarChart3, Activity, Settings, LogOut, Menu } from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeView, setActiveView, onLogout }) {
  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Inventory Pro</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-gray-800 p-2 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'dashboard' && 'bg-gray-800'}`}
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          
          <button 
            onClick={() => setActiveView('system-status')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'system-status' && 'bg-gray-800'}`}
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span>System Status</span>}
          </button>
          
          <button 
            onClick={() => setActiveView('items')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'items' && 'bg-gray-800'}`}
          >
            <Package className="w-5 h-5" />
            {sidebarOpen && <span>Item Management</span>}
          </button>
          
          <button 
            onClick={() => setActiveView('user-management')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'user-management' && 'bg-gray-800'}`}
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>User Management</span>}
          </button>
          
          <button 
            onClick={() => setActiveView('reports')} 
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 ${activeView === 'reports' && 'bg-gray-800'}`}
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Reports</span>}
          </button>
        </nav>
        
        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}