import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import KYCVerification from './pages/admin/KYCVerification';

// Host Pages
import HostProfile from './pages/host/Profile';
import HostRequests from './pages/host/Requests';
import HostChat from './pages/host/Chat';

// Traveler Pages
import TravelerSearch from './pages/traveler/Search';
import RequestStay from './pages/traveler/RequestStay';

// Other Pages
import NotFound from './pages/NotFound';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'
  const [currentPage, setCurrentPage] = useState(() => {
    // Set default page based on role
    if (!user) return 'dashboard';
    return user.role === 'admin' ? 'dashboard' : 
           user.role === 'host' ? 'profile' : 'search';
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'register') {
      return <Register onNavigate={setAuthPage} />;
    }
    return <Login onNavigate={setAuthPage} />;
  }

  // Page mapping based on role
  const pageComponents = {
    // Admin pages
    dashboard: <Dashboard />,
    users: <UserManagement />,
    kyc: <KYCVerification />,
    moderation: <div className="text-center py-12">Moderation Page - Coming Soon</div>,
    content: <div className="text-center py-12">Content Management - Coming Soon</div>,
    activities: <div className="text-center py-12">Activity Logs - Coming Soon</div>,
    broadcast: <div className="text-center py-12">Broadcast - Coming Soon</div>,
    analytics: <div className="text-center py-12">Analytics - Coming Soon</div>,
    
    // Host pages
    profile: <HostProfile />,
    calendar: <div className="text-center py-12">Calendar - Coming Soon</div>,
    requests: <HostRequests />,
    'chat-host': <HostChat />,
    'review-host': <div className="text-center py-12">Reviews - Coming Soon</div>,
    history: <div className="text-center py-12">History - Coming Soon</div>,
    
    // Traveler pages
    search: <TravelerSearch />,
    filter: <div className="text-center py-12">Filters - Coming Soon</div>,
    request: <RequestStay />,
    'chat-traveler': <HostChat />,
    'review-traveler': <div className="text-center py-12">Reviews - Coming Soon</div>,
    status: <div className="text-center py-12">Request Status - Coming Soon</div>,
    journey: <div className="text-center py-12">Journey History - Coming Soon</div>,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userRole={user?.role || 'traveler'}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} showSearch={false} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {pageComponents[currentPage] || <Dashboard />}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
