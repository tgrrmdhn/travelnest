import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Users, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { hostService } from '../../services/host.service';
import { useNotification } from '../../contexts/NotificationContext';

const HostRequests = () => {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(null);
  const [requestList, setRequestList] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hostService.getRequests();
      
      if (response.success && response.data) {
        // Only show pending requests
        const pendingRequests = (response.data.requests || []).filter(req => req.status === 'pending');
        setRequestList(pendingRequests);
      } else {
        setError('Failed to load requests');
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoadingRequest(requestId);
      const response = await hostService.acceptRequest(requestId);
      
      if (response.success) {
        notification.success('Request accepted! The traveler has been notified.');
        // Reload requests to get updated list
        await loadRequests();
      } else {
        notification.error(response.message || 'Failed to accept request');
      }
    } catch (err) {
      notification.error(err.message || 'An error occurred');
    } finally {
      setLoadingRequest(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoadingRequest(requestId);
      const response = await hostService.rejectRequest(requestId);
      
      if (response.success) {
        notification.info('Request rejected. The traveler has been notified.');
        // Reload requests to get updated list
        await loadRequests();
      } else {
        notification.error(response.message || 'Failed to reject request');
      }
    } catch (err) {
      notification.error(err.message || 'An error occurred');
    } finally {
      setLoadingRequest(null);
    }
  };

  // Chat feature removed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Terima/Tolak Request</h1>
        <p className="text-gray-600 mt-1">Kelola permintaan menginap dari traveler</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Failed to load requests</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadRequests}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      ) : requestList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">You don't have any pending stay requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requestList.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{request.traveler_name || 'Traveler'}</h3>
                  <p className="text-sm text-gray-600">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Check-in</p>
                    <p className="font-medium text-gray-900">{new Date(request.check_in).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Check-out</p>
                    <p className="font-medium text-gray-900">{new Date(request.check_out).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Guests</p>
                    <p className="font-medium text-gray-900">{request.guests}</p>
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Message from traveler</p>
                      <p className="text-sm text-gray-900">{request.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAccept(request.id)}
                  disabled={loadingRequest === request.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {loadingRequest === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Accept
                </button>
                <button 
                  onClick={() => handleReject(request.id)}
                  disabled={loadingRequest === request.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {loadingRequest === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
                {/* Chat button removed */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostRequests;
