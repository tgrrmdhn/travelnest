import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';
import { ReviewModel } from '../models/review.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { sanitizeObject, sanitizeString, sanitizeNumber } from '../utils/sanitizer.js';

export const getProfile = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    res.json({
      success: true,
      data: { host },
    });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    // Sanitize all inputs to prevent XSS and injection attacks
    const sanitizedBody = sanitizeObject(req.body);
    const { title, description, address, city, country, max_guests, amenities, house_rules } = sanitizedBody;

    // Check if profile already exists
    const existingProfile = HostModel.findByUserId(req.user.id);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Host profile already exists',
      });
    }

    // Additional validation
    const sanitizedMaxGuests = sanitizeNumber(max_guests, { min: 1, max: 100, defaultValue: 1 });

    const result = HostModel.create({
      user_id: req.user.id,
      title: sanitizeString(title),
      description: sanitizeString(description),
      address: address ? sanitizeString(address) : null,
      city: sanitizeString(city),
      country: sanitizeString(country),
      max_guests: sanitizedMaxGuests,
      amenities: Array.isArray(amenities) ? amenities.map(a => sanitizeString(a)) : [],
      house_rules: house_rules ? sanitizeString(house_rules) : null,
    });

    const host = HostModel.findById(result.lastInsertRowid);

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Host profile created - User ID: ${req.user.id}, Host ID: ${host.id}, City: ${city}, Country: ${country}`);

    res.status(201).json({
      success: true,
      message: 'Host profile created successfully',
      data: { host },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error creating host profile - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    // Sanitize all inputs
    const sanitizedBody = sanitizeObject(req.body);
    
    const updates = {};
    const allowedFields = ['title', 'description', 'address', 'city', 'country', 'max_guests', 'amenities', 'house_rules', 'availability'];

    allowedFields.forEach((field) => {
      if (sanitizedBody[field] !== undefined) {
        if (field === 'max_guests') {
          updates[field] = sanitizeNumber(sanitizedBody[field], { min: 1, max: 100 });
        } else if (field === 'amenities' && Array.isArray(sanitizedBody[field])) {
          updates[field] = sanitizedBody[field].map(a => sanitizeString(a));
        } else if (typeof sanitizedBody[field] === 'string') {
          updates[field] = sanitizeString(sanitizedBody[field]);
        } else {
          updates[field] = sanitizedBody[field];
        }
      }
    });

    HostModel.update(host.id, updates);

    const updatedHost = HostModel.findById(host.id);

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Host profile updated - User ID: ${req.user.id}, Host ID: ${host.id}, Fields: ${Object.keys(updates).join(', ')}`);

    res.json({
      success: true,
      message: 'Host profile updated successfully',
      data: { host: updatedHost },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error updating host profile - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const uploadPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found. Please create a profile first.',
      });
    }

    // Validate file types and sizes
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    for (const file of req.files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${file.originalname}. Only JPEG, PNG, and WebP images are allowed.`,
        });
      }
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          message: `File too large: ${file.originalname}. Maximum size is 5MB.`,
        });
      }
    }

    const photoPaths = req.files.map((file) => `/uploads/properties/${file.filename}`);
    const existingPhotos = host.photos || [];
    const allPhotos = [...existingPhotos, ...photoPaths];

    // Limit total photos
    const MAX_PHOTOS = 10;
    if (allPhotos.length > MAX_PHOTOS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_PHOTOS} photos allowed. Please delete some photos first.`,
      });
    }

    HostModel.update(host.id, { photos: allPhotos });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Photos uploaded - User ID: ${req.user.id}, Host ID: ${host.id}, Photos count: ${req.files.length}, Total: ${allPhotos.length}`);

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: { 
        photos: allPhotos,
        uploadedCount: req.files.length,
        totalCount: allPhotos.length
      },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error uploading photos - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    const status = req.query.status;
    const requests = RequestModel.findByHostId(host.id, status);

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    // Get only accepted requests for chat
    const conversations = RequestModel.findByHostId(host.id, 'accepted');

    res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = RequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify host owns this request
    const host = HostModel.findByUserId(req.user.id);
    if (request.host_id !== host.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update request status
    RequestModel.updateStatus(requestId, 'accepted');

    // Create notification for traveler
    NotificationModel.create({
      user_id: request.traveler_id,
      title: 'Request Accepted',
      message: `Your stay request at ${request.property_title} has been accepted!`,
      type: 'request_accepted',
      is_read: 0
    });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Request accepted - Request ID: ${requestId}, Host ID: ${host.id}, Traveler ID: ${request.traveler_id}`);

    res.json({
      success: true,
      message: 'Request accepted. Traveler has been notified.',
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error accepting request - Request ID: ${req.params.requestId}, User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};
export const getBookings = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    // Get accepted requests with date range
    const bookings = RequestModel.getBookingsByHostId(host.id);

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};
export const deletePhoto = async (req, res, next) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required',
      });
    }

    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    const existingPhotos = host.photos || [];
    const updatedPhotos = existingPhotos.filter(photo => photo !== photoUrl);

    if (existingPhotos.length === updatedPhotos.length) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found in your profile',
      });
    }

    HostModel.update(host.id, { photos: updatedPhotos });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Photo deleted - User ID: ${req.user.id}, Host ID: ${host.id}, Photo: ${photoUrl}`);

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { photos: updatedPhotos },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error deleting photo - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const host = HostModel.findByUserId(req.user.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found',
      });
    }

    // Get reviews for this host (as reviewee)
    const reviews = ReviewModel.findByUserId(req.user.id);

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = RequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify host owns this request
    const host = HostModel.findByUserId(req.user.id);
    if (request.host_id !== host.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update request status
    RequestModel.updateStatus(requestId, 'rejected');

    // Create notification for traveler
    NotificationModel.create({
      user_id: request.traveler_id,
      title: 'Request Rejected',
      message: `Your stay request at ${request.property_title} has been rejected.`,
      type: 'request_rejected',
      is_read: 0
    });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Request rejected - Request ID: ${requestId}, Host ID: ${host.id}, Traveler ID: ${request.traveler_id}`);

    res.json({
      success: true,
      message: 'Request rejected. Traveler has been notified.',
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error rejecting request - Request ID: ${req.params.requestId}, User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};