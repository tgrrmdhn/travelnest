import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Filter, Loader2, AlertCircle, X, Calendar, Users, Send, Wifi, Coffee, Car } from 'lucide-react';
import { travelerService } from '../../services/traveler.service';
import { useNotification } from '../../contexts/NotificationContext';

const TravelerSearch = () => {
  const notification = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('detail'); // 'detail' or 'request'
  const [selectedHost, setSelectedHost] = useState(null);
  const [loadingHost, setLoadingHost] = useState(false);
  const [hostError, setHostError] = useState('');
  
  // Request form states
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestForm, setRequestForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    message: ''
  });

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await travelerService.searchHosts({});
      
      if (response.success && response.data) {
        // Handle if response.data is an array or object with hosts
        const hostList = Array.isArray(response.data) ? response.data : response.data.hosts || [];
        setHosts(hostList);
      } else {
        setError('Failed to load hosts');
      }
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError(err.message || 'Failed to load hosts');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hostId) => {
    const newFavorites = new Set(favorites);
    const isFavorite = newFavorites.has(hostId);
    
    try {
      if (isFavorite) {
        newFavorites.delete(hostId);
        await travelerService.removeFavorite(hostId);
      } else {
        newFavorites.add(hostId);
        await travelerService.addFavorite(hostId);
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert if failed
      alert('Failed to update favorite');
    }
  };

  const handleViewDetails = async (hostId) => {
    setModalOpen(true);
    setModalMode('detail');
    setLoadingHost(true);
    setHostError('');
    setSelectedHost(null);
    
    try {
      const response = await travelerService.getHostDetails(hostId);
      
      if (response.success && response.data) {
        // Merge host data with rating info
        setSelectedHost({
          ...response.data.host,
          avg_rating: response.data.avg_rating,
          review_count: response.data.total_reviews,
          reviews: response.data.reviews
        });
      } else {
        setHostError('Failed to load host details');
      }
    } catch (err) {
      setHostError(err.message || 'Failed to load host details');
    } finally {
      setLoadingHost(false);
    }
  };

  const handleRequestStay = () => {
    setModalMode('request');
    setRequestForm({
      checkIn: '',
      checkOut: '',
      guests: 1,
      message: ''
    });
    setRequestError('');
    setRequestSuccess(false);
  };

  const handleBackToDetail = () => {
    setModalMode('detail');
    setRequestError('');
    setRequestSuccess(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHost(null);
    setModalMode('detail');
    setRequestForm({
      checkIn: '',
      checkOut: '',
      guests: 1,
      message: ''
    });
    setRequestError('');
    setRequestSuccess(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setRequestError('');
      
      const requestData = {
        host_id: parseInt(selectedHost.id),
        check_in: requestForm.checkIn,
        check_out: requestForm.checkOut,
        guests: parseInt(requestForm.guests),
        message: requestForm.message
      };
      
      const response = await travelerService.sendRequest(requestData);
      
      if (response.success) {
        setRequestSuccess(true);
        notification.success('Request sent successfully! The host will be notified.');
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        setRequestError(response.message || 'Failed to send request');
        notification.error(response.message || 'Failed to send request');
      }
    } catch (err) {
      setRequestError(err.message || 'Failed to send request');
      notification.error(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHosts = hosts.filter(host => 
    searchQuery === '' || 
    (host.title && host.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (host.location && host.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Hosts</h1>
        <p className="text-gray-600 mt-1">Discover amazing places to stay</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Failed to load hosts</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchHosts}
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
            <p className="text-gray-600">Loading hosts...</p>
          </div>
        </div>
      ) : filteredHosts.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hosts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host) => (
            <div key={host.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {host.photos && host.photos.length > 0 ? (
                    <img 
                      src={`http://localhost:3000${host.photos[0]}`} 
                      alt={host.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{ display: host.photos && host.photos.length > 0 ? 'none' : 'flex' }}>
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <button 
                  onClick={() => toggleFavorite(host.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.has(host.id) ? 'text-red-600 fill-red-600' : 'text-gray-600'}`} 
                  />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {host.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">
                      {host.avg_rating ? host.avg_rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{host.city && host.country ? `${host.city}, ${host.country}` : 'Unknown location'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max {host.max_guests || 1} guests</span>
                  <span className="text-gray-500">
                    {host.review_count ? `${host.review_count} ${host.review_count === 1 ? 'review' : 'reviews'}` : 'No reviews'}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(host.id);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Host Details and Request */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div 
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'detail' ? 'Host Details' : 'Request Stay'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingHost ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : hostError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{hostError}</p>
                </div>
              ) : selectedHost ? (
                <>
                  {modalMode === 'detail' ? (
                    // Detail Mode
                    <div className="space-y-6">
                      {/* Photos Gallery */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedHost.photos && selectedHost.photos.length > 0 ? (
                          selectedHost.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={`http://localhost:3000${photo}`}
                              alt={`${selectedHost.title} ${index + 1}`}
                              className="w-full aspect-video object-cover rounded-lg"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                            />
                          ))
                        ) : (
                          <div className="col-span-3 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Host Info */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedHost.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <MapPin className="w-5 h-5" />
                          <span>{selectedHost.city}, {selectedHost.country}</span>
                        </div>
                        
                        {selectedHost.description && (
                          <p className="text-gray-700 mb-4">{selectedHost.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Users className="w-5 h-5" />
                              <span className="text-sm">Max Guests</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{selectedHost.max_guests || 1}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm">Rating</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedHost.avg_rating ? (
                                <>
                                  {selectedHost.avg_rating.toFixed(1)} 
                                  <span className="text-sm font-normal text-gray-600 ml-1">
                                    ({selectedHost.review_count} {selectedHost.review_count === 1 ? 'review' : 'reviews'})
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">No reviews yet</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Amenities */}
                        {selectedHost.amenities && selectedHost.amenities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedHost.amenities.map((amenity, index) => {
                                const icons = { wifi: Wifi, kitchen: Coffee, parking: Car };
                                const Icon = icons[amenity.toLowerCase()] || Star;
                                return (
                                  <div key={index} className="flex items-center gap-2 text-gray-700">
                                    <Icon className="w-5 h-5 text-blue-600" />
                                    <span className="capitalize">{amenity}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        {selectedHost.address && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                            <p className="text-gray-700">{selectedHost.address}</p>
                          </div>
                        )}
                      </div>

                      {/* Request Button */}
                      <button
                        onClick={handleRequestStay}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        Request Stay
                      </button>
                    </div>
                  ) : (
                    // Request Mode
                    <div className="space-y-6">
                      {/* Host Summary */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex gap-4">
                          {selectedHost.photos && selectedHost.photos.length > 0 && (
                            <img
                              src={`http://localhost:3000${selectedHost.photos[0]}`}
                              alt={selectedHost.title}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{selectedHost.title}</h4>
                            <p className="text-sm text-gray-600">{selectedHost.city}, {selectedHost.country}</p>
                            <p className="text-sm text-gray-600 mt-1">Max {selectedHost.max_guests} guests</p>
                          </div>
                        </div>
                      </div>

                      {/* Request Form */}
                      {requestSuccess ? (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                          <p className="text-green-700 font-medium mb-2">Request Sent Successfully!</p>
                          <p className="text-green-600 text-sm">The host will review your request shortly.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                          {requestError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-700 text-sm">{requestError}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Check-in Date
                              </label>
                              <input
                                type="date"
                                value={requestForm.checkIn}
                                onChange={(e) => setRequestForm({ ...requestForm, checkIn: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Check-out Date
                              </label>
                              <input
                                type="date"
                                value={requestForm.checkOut}
                                onChange={(e) => setRequestForm({ ...requestForm, checkOut: e.target.value })}
                                min={requestForm.checkIn || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Users className="w-4 h-4 inline mr-1" />
                              Number of Guests
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={selectedHost.max_guests || 10}
                              value={requestForm.guests}
                              onChange={(e) => setRequestForm({ ...requestForm, guests: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Message to Host
                            </label>
                            <textarea
                              value={requestForm.message}
                              onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                              rows={4}
                              placeholder="Tell the host about yourself and why you'd like to stay..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={handleBackToDetail}
                              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5" />
                                  Send Request
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerSearch;