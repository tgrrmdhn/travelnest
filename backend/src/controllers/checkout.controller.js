import { RequestModel } from '../models/request.model.js';
import { HostModel } from '../models/host.model.js';
import { NotificationModel } from '../models/notification.model.js';

// Traveler requests checkout
export const requestCheckout = async (req, res, next) => {
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
        message: 'Unauthorized',
      });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted bookings can request checkout',
      });
    }

    if (request.checkout_requested) {
      return res.status(400).json({
        success: false,
        message: 'Checkout already requested',
      });
    }

    // Request checkout
    RequestModel.requestCheckout(requestId);

    // Get host info
    const host = HostModel.findById(request.host_id);

    // Create notification
    NotificationModel.create({
      user_id: host.user_id,
      title: 'Checkout Request',
      message: `Traveler requested checkout verification`,
      type: 'checkout_request',
      is_read: 0
    });

    console.log(`[ADMIN LOG] Checkout requested - Request ID: ${requestId}, Traveler ID: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Checkout request sent to host',
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error requesting checkout - Request ID: ${req.params.requestId}, User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

// Host verifies checkout
export const verifyCheckout = async (req, res, next) => {
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
    if (!host || request.host_id !== host.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!request.checkout_requested) {
      return res.status(400).json({
        success: false,
        message: 'Traveler has not requested checkout yet',
      });
    }

    if (request.checkout_verified) {
      return res.status(400).json({
        success: false,
        message: 'Checkout already verified',
      });
    }

    // Verify checkout
    RequestModel.verifyCheckout(requestId);

    // Create notification for traveler
    NotificationModel.create({
      user_id: request.traveler_id,
      title: 'Checkout Verified',
      message: 'Host has verified your checkout. You can now submit a review!',
      type: 'checkout_verified',
      is_read: 0
    });

    console.log(`[ADMIN LOG] Checkout verified - Request ID: ${requestId}, Host ID: ${host.id}`);

    res.json({
      success: true,
      message: 'Checkout verified successfully',
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error verifying checkout - Request ID: ${req.params.requestId}, User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};
