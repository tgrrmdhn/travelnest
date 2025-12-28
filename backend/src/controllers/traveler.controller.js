import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';
import { ReviewModel } from '../models/review.model.js';

export const searchHosts = async (req, res, next) => {
  try {
    const { city, country, max_guests } = req.query;

    const hosts = HostModel.search({ city, country, max_guests });

    res.json({
      success: true,
      data: { hosts },
    });
  } catch (error) {
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
    const { host_id, check_in, check_out, guests, message } = req.body;

    const host = HostModel.findById(host_id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found',
      });
    }

    const result = RequestModel.create({
      traveler_id: req.user.id,
      host_id,
      check_in,
      check_out,
      guests,
      message,
    });

    const request = RequestModel.findById(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const status = req.query.status;
    const requests = RequestModel.findByTravelerId(req.user.id, status);

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