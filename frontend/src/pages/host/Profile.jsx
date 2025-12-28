import React, { useState } from 'react';
import { Camera, MapPin, Home, Users, Wifi, Coffee, Car } from 'lucide-react';

const HostProfile = () => {
  const [profile, setProfile] = useState({
    title: 'Cozy Apartment in Jakarta',
    description: 'Beautiful apartment with city view',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    country: 'Indonesia',
    maxGuests: 2,
    amenities: ['wifi', 'kitchen', 'parking']
  });

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'kitchen', label: 'Kitchen', icon: Coffee },
    { id: 'parking', label: 'Parking', icon: Car },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Profil & Rumah</h1>
        <p className="text-gray-600 mt-1">Update informasi properti Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Upload Photos
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
              <input
                type="number"
                value={profile.maxGuests}
                onChange={(e) => setProfile({ ...profile, maxGuests: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = profile.amenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => {
                        const newAmenities = isSelected
                          ? profile.amenities.filter(a => a !== amenity.id)
                          : [...profile.amenities, amenity.id];
                        setProfile({ ...profile, amenities: newAmenities });
                      }}
                      className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className="text-sm font-medium">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
