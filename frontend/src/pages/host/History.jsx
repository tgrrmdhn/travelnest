import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Users, MessageSquare, Loader2, AlertCircle, Clock, Award } from 'lucide-react';
import { hostService } from '../../services/host.service';

const HostHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestList, setRequestList] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'accepted', 'rejected', 'completed'
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hostService.getRequests();
      
      if (response.success && response.data) {
        // Show accepted, rejected, and completed requests (not pending)
        const historyRequests = (response.data.requests || []).filter(
          req => req.status === 'accepted' || req.status === 'rejected' || req.status === 'completed'
        );
        setRequestList(historyRequests);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCheckout = async (requestId) => {
    try {
      setVerifyingId(requestId);
      const response = await hostService.verifyCheckout(requestId);
      
      if (response.success) {
        // Refresh the list
        await loadHistory();
      } else {
        setError(response.message || 'Failed to verify checkout');
      }
    } catch (err) {
      console.error('Error verifying checkout:', err);
      setError(err.message || 'Failed to verify checkout');
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusConfig = (status, checkoutRequested, checkoutVerified) => {
    if (status === 'completed') {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: Award,
        label: 'Completed',
      };
    }
    
    if (status === 'accepted') {
      if (checkoutVerified) {
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: CheckCircle,
          label: 'Checkout Verified',
        };
      }
      if (checkoutRequested) {
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: Clock,
          label: 'Checkout Pending',
        };
      }
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Active',
      };
    }
    
    if (status === 'rejected') {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Rejected',
      };
    }
    
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: Clock,
      label: status,
    };
  };

  const filteredRequests = requestList.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request History</h1>
        <p className="text-gray-600 mt-1">View all accepted and rejected requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'accepted'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'rejected'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Failed to load history</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadHistory}
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
            <p className="text-gray-600">Loading history...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No History</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You don't have any request history yet."
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusConfig = getStatusConfig(request.status, request.checkout_requested, request.checkout_verified);
            const StatusIcon = statusConfig.icon;
            const showVerifyButton = request.status === 'accepted' && request.checkout_requested && !request.checkout_verified;

            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{request.traveler_name || 'Traveler'}</h3>
                    <p className="text-sm text-gray-600">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
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
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Message from traveler</p>
                        <p className="text-sm text-gray-900">{request.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {showVerifyButton && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Traveler requested checkout verification</span>
                      </div>
                      <button
                        onClick={() => handleVerifyCheckout(request.id)}
                        disabled={verifyingId === request.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        {verifyingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Verify Checkout
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HostHistory;
