import React, { useState, useEffect } from 'react';
import { Users, Home, FileText, MessageSquare, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStatistics();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchStatistics}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const statsDisplay = [
    { label: 'Total Users', value: stats?.totalUsers || 0, change: '+12%', icon: Users, color: 'blue' },
    { label: 'Active Hosts', value: stats?.totalHosts || 0, change: '+8%', icon: Home, color: 'green' },
    { label: 'Travelers', value: stats?.totalTravelers || 0, change: '+15%', icon: Users, color: 'purple' },
    { label: 'Total Requests', value: stats?.totalRequests || 0, change: '+5%', icon: TrendingUp, color: 'orange' },
    { label: 'Pending KYC', value: stats?.pendingKyc || 0, change: '-3%', icon: FileText, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Statistik</h1>
        <p className="text-gray-600 mt-1">Overview of TravelNest platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsDisplay.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">No recent activities</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Review KYC', icon: FileText, color: 'blue' },
              { label: 'Check Reports', icon: AlertCircle, color: 'red' },
              { label: 'Send Broadcast', icon: MessageSquare, color: 'green' },
              { label: 'View Analytics', icon: TrendingUp, color: 'purple' },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  className={`p-4 border-2 border-gray-200 rounded-lg hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all group`}
                >
                  <Icon className={`w-6 h-6 text-gray-600 group-hover:text-${action.color}-600 mx-auto mb-2`} />
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
