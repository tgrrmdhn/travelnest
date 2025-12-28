import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as hostController from '../controllers/host.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host'));

router.get('/profile', hostController.getProfile);
router.post(
  '/profile',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('max_guests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
    validate,
  ],
  hostController.createProfile
);
router.put('/profile', hostController.updateProfile);
router.post('/photos', upload.array('photos', 10), hostController.uploadPhotos);

router.get('/requests', hostController.getRequests);
router.put('/requests/:requestId/accept', hostController.acceptRequest);
router.put('/requests/:requestId/reject', hostController.rejectRequest);

export default router;
