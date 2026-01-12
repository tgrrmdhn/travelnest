import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';

// Host Pages
import HostProfile from './pages/host/Profile';
import HostRequests from './pages/host/Requests';
import HostCalendar from './pages/host/Calendar';
import HostHistory from './pages/host/History';
import HostReviews from './pages/host/Reviews';

// Traveler Pages
import TravelerSearch from './pages/traveler/Search';
import TravelerStatus from './pages/traveler/Status';
import TravelerJourney from './pages/traveler/Journey';
import TravelerReviews from './pages/traveler/Reviews';
// Chat feature removed

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
  const [currentPage, setCurrentPage] = useState(null); // Start with null

  // Redirect to appropriate page when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      let defaultPage = 'dashboard';
      
      console.log('User logged in with role:', user.role);
      
      switch (user.role) {
        case 'admin':
          defaultPage = 'dashboard';
          break;
        case 'host':
          defaultPage = 'profile'; // Host goes to Profile Management
          break;
        case 'traveler':
          defaultPage = 'search'; // Traveler goes to Search
          break;
        default:
          defaultPage = 'search';
      }
      
      console.log('Redirecting to page:', defaultPage);
      setCurrentPage(defaultPage);
    }
  }, [isAuthenticated, user]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show loading screen while checking authentication
  if (loading) {
    console.log('App: Loading authentication...');
    return <LoadingScreen />;
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    console.log('App: Not authenticated, showing login/register');
    if (authPage === 'register') {
      return <Register onNavigate={setAuthPage} />;
    }
    return <Login onNavigate={setAuthPage} />;
  }

  console.log('App: Authenticated, showing main app. Current page:', currentPage);

  // Page mapping based on role
  const pageComponents = {
    // Admin pages
    dashboard: <Dashboard />,
    users: <UserManagement />,
    
    // Host pages
    profile: <HostProfile />,
    calendar: <HostCalendar />,
    requests: <HostRequests />,
    'review-host': <HostReviews />,
    history: <HostHistory />,
    
    // Traveler pages
    search: <TravelerSearch />,
    filter: <div className="text-center py-12">Filters - Coming Soon</div>,
    'review-traveler': <TravelerReviews />,
    status: <TravelerStatus />,
    journey: <TravelerJourney />,
    // Chat pages removed
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
          {currentPage && pageComponents[currentPage] ? (
            pageComponents[currentPage]
          ) : (
            <LoadingScreen />
          )}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationContainer />
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
