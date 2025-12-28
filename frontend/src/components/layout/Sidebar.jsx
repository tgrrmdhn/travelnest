import React from 'react';
import { 
  Home, Users, FileText, MessageSquare, Bell, BarChart3, 
  Settings, LogOut, X, Menu, Calendar, Search, Star 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, currentPage, setCurrentPage, userRole }) => {
  const { user, logout } = useAuth();

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard Statistik', icon: BarChart3 },
      { id: 'users', label: 'Manajemen User', icon: Users },
      { id: 'kyc', label: 'Verifikasi KYC', icon: FileText },
      { id: 'moderation', label: 'Moderasi Report', icon: MessageSquare },
      { id: 'content', label: 'Manajemen Konten', icon: FileText },
      { id: 'activities', label: 'Log Aktivitas', icon: Bell },
      { id: 'broadcast', label: 'Broadcast', icon: Bell },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
    host: [
      { id: 'profile', label: 'Kelola Profil', icon: Home },
      { id: 'calendar', label: 'Ketersediaan', icon: Calendar },
      { id: 'requests', label: 'Request Stay', icon: Bell },
      { id: 'chat-host', label: 'Chat', icon: MessageSquare },
      { id: 'review-host', label: 'Review', icon: Star },
      { id: 'history', label: 'Riwayat', icon: FileText },
    ],
    traveler: [
      { id: 'search', label: 'Cari Host', icon: Search },
      { id: 'filter', label: 'Filter', icon: Settings },
      { id: 'request', label: 'Request Stay', icon: Bell },
      { id: 'chat-traveler', label: 'Chat', icon: MessageSquare },
      { id: 'review-traveler', label: 'Review', icon: Star },
      { id: 'status', label: 'Status Request', icon: Bell },
      { id: 'journey', label: 'Riwayat Perjalanan', icon: FileText },
    ],
  };

  const items = menuItems[userRole] || [];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={toggleSidebar} 
      />
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">TravelNest</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;