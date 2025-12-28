import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Filter, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const TravelerSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/traveler/available-hosts');
      
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

  const toggleFavorite = (hostId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(hostId)) {
      newFavorites.delete(hostId);
    } else {
      newFavorites.add(hostId);
    }
    setFavorites(newFavorites);
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
                  {host.image ? (
                    <img src={host.image} alt={host.title} className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="w-12 h-12 text-gray-400" />
                  )}
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
                    <span className="text-sm font-medium">{host.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{host.location || 'Unknown location'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max {host.maxGuests || 1} guests</span>
                  <span className="text-gray-500">{host.reviews?.length || 0} reviews</span>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelerSearch;