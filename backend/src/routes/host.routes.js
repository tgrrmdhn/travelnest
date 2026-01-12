import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as hostController from '../controllers/host.controller.js';
import * as checkoutController from '../controllers/checkout.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host'));

router.get('/profile', hostController.getProfile);
router.post(
  '/profile',
  [
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('city').trim().notEmpty().withMessage('City is required')
      .isLength({ max: 100 }).withMessage('City name too long'),
    body('country').trim().notEmpty().withMessage('Country is required')
      .isLength({ max: 100 }).withMessage('Country name too long'),
    body('max_guests').isInt({ min: 1, max: 100 }).withMessage('Max guests must be between 1 and 100'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('house_rules').optional().trim().isLength({ max: 1000 }).withMessage('House rules too long'),
    validate,
  ],
  hostController.createProfile
);
router.put('/profile', [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('city').optional().trim().isLength({ max: 100 }).withMessage('City name too long'),
    body('country').optional().trim().isLength({ max: 100 }).withMessage('Country name too long'),
    body('max_guests').optional().isInt({ min: 1, max: 100 }).withMessage('Max guests must be between 1 and 100'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array'),
    body('house_rules').optional().trim().isLength({ max: 1000 }).withMessage('House rules too long'),
    validate,
  ], hostController.updateProfile);
router.post('/photos', upload.array('photos', 10), hostController.uploadPhotos);
router.delete('/photos', [
    body('photoUrl').notEmpty().withMessage('Photo URL is required'),
    validate,
  ], hostController.deletePhoto);

router.get('/requests', hostController.getRequests);
router.get('/conversations', hostController.getConversations);
router.get('/bookings', hostController.getBookings);
router.get('/reviews', hostController.getReviews);
router.put('/requests/:requestId/accept', hostController.acceptRequest);
router.put('/requests/:requestId/reject', hostController.rejectRequest);
router.put('/requests/:requestId/verify-checkout', checkoutController.verifyCheckout);

export default router;
