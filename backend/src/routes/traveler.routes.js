import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as travelerController from '../controllers/traveler.controller.js';
import * as checkoutController from '../controllers/checkout.controller.js';

const router = express.Router();

router.use(authenticate, authorize('traveler'));

router.get('/search', travelerController.searchHosts);
router.get('/hosts/:hostId', travelerController.getHostDetails);

router.post(
  '/requests',
  [
    body('host_id').isInt({ min: 1 }).withMessage('Invalid host ID'),
    body('check_in').isISO8601().withMessage('Invalid check-in date')
      .custom((value) => {
        const checkIn = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
          throw new Error('Check-in date cannot be in the past');
        }
        return true;
      }),
    body('check_out').isISO8601().withMessage('Invalid check-out date')
      .custom((value, { req }) => {
        const checkOut = new Date(value);
        const checkIn = new Date(req.body.check_in);
        if (checkOut <= checkIn) {
          throw new Error('Check-out date must be after check-in date');
        }
        return true;
      }),
    body('guests').isInt({ min: 1, max: 100 }).withMessage('Guests must be between 1 and 100'),
    body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long (max 500 characters)'),
    validate,
  ],
  travelerController.createRequest
);

router.get('/requests', travelerController.getRequests);
router.put('/requests/:requestId/cancel', travelerController.cancelRequest);
router.put('/requests/:requestId/checkout', checkoutController.requestCheckout);

router.get('/reviews', travelerController.getReviews);
router.post(
  '/reviews',
  [
    body('request_id').isInt().withMessage('Invalid request ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    validate,
  ],
  travelerController.createReview
);

export default router;
