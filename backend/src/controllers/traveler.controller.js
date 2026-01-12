import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';
import { ReviewModel } from '../models/review.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { sanitizeObject, sanitizeString, sanitizeNumber, sanitizeDate } from '../utils/sanitizer.js';

export const searchHosts = async (req, res, next) => {
  try {
    // Sanitize search parameters
    const city = req.query.city ? sanitizeString(req.query.city) : null;
    const country = req.query.country ? sanitizeString(req.query.country) : null;
    const max_guests = req.query.max_guests ? sanitizeNumber(req.query.max_guests, { min: 1 }) : null;

    const hosts = HostModel.search({ city, country, max_guests });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Host search - User ID: ${req.user.id}, Filters: city=${city}, country=${country}, max_guests=${max_guests}, Results: ${hosts.length}`);

    res.json({
      success: true,
      data: { hosts },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error searching hosts - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const getHostDetails = async (req, res, next) => {
  try {
    const { hostId } = req.params;

    const host = HostModel.findById(hostId);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found',
      });
    }

    // Get reviews
    const reviews = ReviewModel.findByUserId(host.user_id);
    const ratingData = ReviewModel.getAverageRating(host.user_id);

    console.log(`📊 Host ${hostId} rating data:`, ratingData);
    console.log(`📝 Reviews count:`, reviews.length);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json({
      success: true,
      data: { 
        host,
        reviews,
        avg_rating: ratingData.avg_rating,
        total_reviews: ratingData.total_reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    // Sanitize inputs
    const sanitizedBody = sanitizeObject(req.body);
    const { host_id, check_in, check_out, guests, message } = sanitizedBody;

    const host = HostModel.findById(host_id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found',
      });
    }

    // Sanitize and validate dates
    const sanitizedCheckIn = sanitizeDate(check_in);
    const sanitizedCheckOut = sanitizeDate(check_out);
    
    if (!sanitizedCheckIn || !sanitizedCheckOut) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date',
      });
    }

    const result = RequestModel.create({
      traveler_id: req.user.id,
      host_id: sanitizeNumber(host_id, { min: 1 }),
      check_in: sanitizedCheckIn,
      check_out: sanitizedCheckOut,
      guests: sanitizeNumber(guests, { min: 1 }),
      message: message ? sanitizeString(message) : null,
    });

    const request = RequestModel.findById(result.lastInsertRowid);

    // Create notification for host
    NotificationModel.create({
      user_id: host.user_id,
      title: 'New Booking Request',
      message: `You have a new stay request from ${req.user.name} for ${guests} guest(s)`,
      type: 'new_request',
      is_read: 0
    });

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Request created - Request ID: ${request.id}, Traveler ID: ${req.user.id}, Host ID: ${host_id}, Check-in: ${sanitizedCheckIn}, Check-out: ${sanitizedCheckOut}`);

    res.status(201).json({
      success: true,
      message: 'Request sent successfully. Host will be notified.',
      data: { request },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error creating request - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const status = req.query.status;
    const requests = RequestModel.findByTravelerId(req.user.id, status);

    console.log(`📋 Traveler ${req.user.id} requests:`, JSON.stringify(requests, null, 2));

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = RequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.traveler_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    RequestModel.updateStatus(requestId, 'cancelled');

    res.json({
      success: true,
      message: 'Request cancelled',
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { request_id, rating, comment } = req.body;

    const request = RequestModel.findById(request_id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.traveler_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed stays',
      });
    }

    // Check if review already exists
    const existingReview = ReviewModel.existsForRequest(request_id, req.user.id);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted',
      });
    }

    // Get host user_id
    const host = HostModel.findById(request.host_id);

    const result = ReviewModel.create({
      reviewer_id: req.user.id,
      reviewee_id: host.user_id,
      request_id,
      rating,
      comment,
    });

    const review = ReviewModel.findById(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    // Get reviews written by this traveler (as reviewer)
    const reviews = ReviewModel.findByReviewerId(req.user.id);

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};