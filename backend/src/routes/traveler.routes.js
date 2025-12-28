import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as travelerController from '../controllers/traveler.controller.js';

const router = express.Router();

router.use(authenticate, authorize('traveler'));

router.get('/search', travelerController.searchHosts);
router.get('/hosts/:hostId', travelerController.getHostDetails);

router.post(
  '/requests',
  [
    body('host_id').isInt().withMessage('Invalid host ID'),
    body('check_in').isISO8601().withMessage('Invalid check-in date'),
    body('check_out').isISO8601().withMessage('Invalid check-out date'),
    body('guests').isInt({ min: 1 }).withMessage('Guests must be at least 1'),
    validate,
  ],
  travelerController.createRequest
);

router.get('/requests', travelerController.getRequests);
router.put('/requests/:requestId/cancel', travelerController.cancelRequest);

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
