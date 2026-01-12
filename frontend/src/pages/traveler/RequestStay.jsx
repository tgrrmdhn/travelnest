import React, { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { travelerService } from '../../services/traveler.service';

const RequestStay = () => {
  const hostId = localStorage.getItem('selectedHostId');
  
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    message: ''
  });

  useEffect(() => {
    if (hostId) {
      loadHostDetails();
    } else {
      setError('No host selected');
      setLoading(false);
    }
  }, [hostId]);

  const loadHostDetails = async () => {
    try {
      setLoading(true);
      const response = await travelerService.getHostDetails(hostId);
      
      if (response.success && response.data) {
        setHost(response.data.host);
      } else {
        setError('Failed to load host details');
      }
    } catch (err) {
      setError(err.message || 'Failed to load host details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      const requestData = {
        host_id: parseInt(hostId),
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        guests: parseInt(formData.guests),
        message: formData.message
      };
      
      const response = await travelerService.sendRequest(requestData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/traveler/requests';
        }, 2000);
      } else {
        setError(response.message || 'Failed to send request');
      }
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading host details...</p>
        </div>
      </div>
    );
  }

  if (error && !host) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kirim Request Stay</h1>
        <p className="text-gray-600 mt-1">Ajukan permintaan menginap ke host</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">Request sent successfully! Redirecting...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Stay Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message to Host</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  placeholder="Tell the host about yourself and why you'd like to stay..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Host Information</h3>
            
            {host ? (
              <div className="space-y-4">
                <div>
                  {host.photos && host.photos.length > 0 ? (
                    <img 
                      src={`http://localhost:3000${host.photos[0]}`}
                      alt={host.title}
                      className="w-full aspect-video object-cover rounded-lg mb-3"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-medium text-gray-900 text-lg">{host.title}</h4>
                  <p className="text-sm text-gray-600">{host.city}, {host.country}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Guests</span>
                    <span className="font-medium">{host.max_guests || 1}</span>
                  </div>
                  {host.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{host.description}</p>
                    </div>
                  )}
                  {host.amenities && host.amenities.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {host.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Loading host information...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestStay;