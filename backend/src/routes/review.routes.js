import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { ReviewModel } from '../models/review.model.js';

const router = express.Router();

router.use(authenticate);

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = ReviewModel.findByUserId(userId);
    const ratingData = ReviewModel.getAverageRating(userId);

    res.json({
      success: true,
      data: {
        reviews,
        avg_rating: ratingData.avg_rating,
        total_reviews: ratingData.total_reviews,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;