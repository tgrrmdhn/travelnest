import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';

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
    const { title, description, address, city, country, max_guests, amenities, house_rules } = req.body;

    // Check if profile already exists
    const existingProfile = HostModel.findByUserId(req.user.id);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Host profile already exists',
      });
    }

    const result = HostModel.create({
      user_id: req.user.id,
      title,
      description,
      address,
      city,
      country,
      max_guests,
      amenities,
      house_rules,
    });

    const host = HostModel.findById(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Host profile created successfully',
      data: { host },
    });
  } catch (error) {
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

    const updates = {};
    const allowedFields = ['title', 'description', 'address', 'city', 'country', 'max_guests', 'amenities', 'house_rules', 'availability'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    HostModel.update(host.id, updates);

    const updatedHost = HostModel.findById(host.id);

    res.json({
      success: true,
      message: 'Host profile updated successfully',
      data: { host: updatedHost },
    });
  } catch (error) {
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
        message: 'Host profile not found',
      });
    }

    const photoPaths = req.files.map((file) => `/uploads/properties/${file.filename}`);
    const existingPhotos = host.photos || [];
    const allPhotos = [...existingPhotos, ...photoPaths];

    HostModel.update(host.id, { photos: allPhotos });

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: { photos: allPhotos },
    });
  } catch (error) {
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

    RequestModel.updateStatus(requestId, 'accepted');

    res.json({
      success: true,
      message: 'Request accepted',
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

    RequestModel.updateStatus(requestId, 'rejected');

    res.json({
      success: true,
      message: 'Request rejected',
    });
  } catch (error) {
    next(error);
  }
};