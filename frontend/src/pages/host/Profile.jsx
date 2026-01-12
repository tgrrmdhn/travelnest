import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Home, Users, Wifi, Coffee, Car, Loader2, CheckCircle, AlertCircle, X, Upload } from 'lucide-react';
import { hostService } from '../../services/host.service';

const HostProfile = () => {
  const [profile, setProfile] = useState({
    title: 'Cozy Apartment in Jakarta',
    description: 'Beautiful apartment with city view',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    country: 'Indonesia',
    maxGuests: 2,
    amenities: ['wifi', 'kitchen', 'parking'],
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const fileInputRef = useRef(null);

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'kitchen', label: 'Kitchen', icon: Coffee },
    { id: 'parking', label: 'Parking', icon: Car },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await hostService.getProfile();
      if (response.success && response.data?.host) {
        setProfileExists(true);
        setProfile({
          title: response.data.host.title || '',
          description: response.data.host.description || '',
          address: response.data.host.address || '',
          city: response.data.host.city || '',
          country: response.data.host.country || '',
          maxGuests: response.data.host.max_guests || 2,
          amenities: response.data.host.amenities || [],
          photos: response.data.host.photos || []
        });
      } else {
        setProfileExists(false);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfileExists(false);
    }
  };

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    const totalPhotos = (profile.photos?.length || 0) + files.length;
    if (totalPhotos > 10) {
      setPhotoError(`You can only upload up to 10 photos. You currently have ${profile.photos?.length || 0} photo(s).`);
      return;
    }

    // Validate file size and type
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setPhotoError(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setPhotoError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
    }

    try {
      setUploadingPhotos(true);
      setPhotoError('');
      
      const response = await hostService.uploadPhotos(files);
      
      if (response.success) {
        setProfile({ ...profile, photos: response.data.photos });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setPhotoError(response.message || 'Failed to upload photos');
      }
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      setPhotoError('');
      const response = await hostService.deletePhoto(photoUrl);
      
      if (response.success) {
        setProfile({ ...profile, photos: response.data.photos });
      } else {
        setPhotoError(response.message || 'Failed to delete photo');
      }
    } catch (err) {
      setPhotoError(err.message || 'Failed to delete photo');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Validate required fields
      if (!profile.title?.trim()) {
        setError('Title is required');
        return;
      }
      if (!profile.description?.trim()) {
        setError('Description is required');
        return;
      }
      if (!profile.city?.trim()) {
        setError('City is required');
        return;
      }
      if (!profile.country?.trim()) {
        setError('Country is required');
        return;
      }
      if (!profile.maxGuests || profile.maxGuests < 1) {
        setError('Max guests must be at least 1');
        return;
      }

      const profileData = {
        title: profile.title,
        description: profile.description,
        address: profile.address || '',
        city: profile.city,
        country: profile.country,
        max_guests: parseInt(profile.maxGuests),
        amenities: profile.amenities
      };

      let response;
      if (profileExists) {
        response = await hostService.updateProfile(profileData);
      } else {
        response = await hostService.createProfile(profileData);
      }

      if (response.success) {
        setSuccess(true);
        setProfileExists(true);
        setTimeout(() => setSuccess(false), 3000);
        // Reload profile to get the latest data
        await loadProfile();
      } else {
        setError(response.message || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Profil & Rumah</h1>
        <p className="text-gray-600 mt-1">Update informasi properti Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {/* Photo Gallery */}
            <div className="space-y-4">
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {profile.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={`http://localhost:3000${photo}`}
                        alt={`Property ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No photos yet</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              
              <button 
                onClick={handleUploadPhoto}
                disabled={!profileExists || uploadingPhotos || (profile.photos?.length >= 10)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={!profileExists ? 'Please save profile first' : ''}
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Photos ({profile.photos?.length || 0}/10)
                  </>
                )}
              </button>
              
              {!profileExists && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">Save your profile first before uploading photos</p>
                </div>
              )}
              
              {photoError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{photoError}</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Upload up to 10 photos. Max 5MB each. JPEG, PNG, or WebP format.
              </p>
            </div>
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

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Profile saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
