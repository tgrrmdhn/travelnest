export const USER_ROLES = {
  ADMIN: 'admin',
  HOST: 'host',
  TRAVELER: 'traveler',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
  SUSPENDED: 'suspended',
};

export const AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Parking' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'heating', label: 'Heating' },
  { id: 'tv', label: 'TV' },
  { id: 'washer', label: 'Washer' },
  { id: 'pool', label: 'Pool' },
];
