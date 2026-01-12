import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, MessageSquare, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Award, Star } from 'lucide-react';
import { travelerService } from '../../services/traveler.service';
import ReviewModal from '../../components/common/ReviewModal';

const TravelerJourney = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'accepted', 'rejected', 'completed'
  const [checkoutingId, setCheckoutingId] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await travelerService.getRequests();
      
      if (response.success && response.data) {
        setRequests(response.data.requests || []);
      } else {
        setError('Failed to load journey');
      }
    } catch (err) {
      console.error('Error loading journey:', err);
      setError(err.message || 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCheckout = async (requestId) => {
    try {
      setCheckoutingId(requestId);
      const response = await travelerService.requestCheckout(requestId);
      
      if (response.success) {
        await loadJourney();
      } else {
        setError(response.message || 'Failed to request checkout');
      }
    } catch (err) {
      console.error('Error requesting checkout:', err);
      setError(err.message || 'Failed to request checkout');
    } finally {
      setCheckoutingId(null);
    }
  };

  const handleOpenReviewModal = (request) => {
    setSelectedRequest(request);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
    loadJourney();
  };

  const getStatusConfig = (status, checkoutRequested, checkoutVerified, hasReview) => {
    if (status === 'completed') {
      if (hasReview) {
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: Award,
          label: 'Reviewed',
        };
      }
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircle,
        label: 'Completed',
      };
    }
    
    if (status === 'accepted') {
      if (checkoutVerified) {
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
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
        bg: 'bg-blue-100',
        text: 'text-blue-800',
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
    
    if (status === 'pending') {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending',
      };
    }
    
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: Clock,
      label: status,
    };
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journey History</h1>
        <p className="text-gray-600 mt-1">View all your stay requests and bookings</p>
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-yellow-600 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filter === 'accepted'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Accepted
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
            <p className="text-red-700 font-medium">Failed to load journey</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadJourney}
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
            <p className="text-gray-600">Loading journey...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Journey Yet</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't made any stay requests yet."
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusConfig = getStatusConfig(
              request.status,
              request.checkout_requested,
              request.checkout_verified,
              request.has_review
            );
            const StatusIcon = statusConfig.icon;
            const showCheckoutButton = request.status === 'accepted' && !request.checkout_requested;
            const showReviewButton = request.status === 'completed' && !request.has_review;

            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{request.property_title || 'Property'}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {request.city}, {request.country}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </p>
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
                        <p className="text-xs text-gray-600 mb-1">Your message</p>
                        <p className="text-sm text-gray-900">{request.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {(showCheckoutButton || showReviewButton) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                    {showCheckoutButton && (
                      <button
                        onClick={() => handleRequestCheckout(request.id)}
                        disabled={checkoutingId === request.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                        {checkoutingId === request.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Request Checkout
                          </>
                        )}
                      </button>
                    )}
                    
                    {showReviewButton && (
                      <button
                        onClick={() => handleOpenReviewModal(request)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Write Review
                      </button>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                {request.checkout_requested && !request.checkout_verified && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800 text-sm">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Waiting for host to verify your checkout</span>
                  </div>
                )}

                {request.has_review && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-purple-800 text-sm">
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span>Thank you for your review!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <ReviewModal
          requestId={selectedRequest.id}
          hostName={selectedRequest.host_name || 'Host'}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedRequest(null);
          }}
          onSubmit={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default TravelerJourney;
