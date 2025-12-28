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

export const NOTIFICATION_TYPES = {
  REQUEST: 'request',
  ACCEPTANCE: 'acceptance',
  REJECTION: 'rejection',
  MESSAGE: 'message',
  REVIEW: 'review',
  SYSTEM: 'system',
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
};

export const AMENITIES = [
  'wifi',
  'kitchen',
  'parking',
  'ac',
  'heating',
  'tv',
  'washer',
  'pool',
];