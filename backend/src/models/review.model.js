import db from '../config/database.js';

export const ReviewModel = {
  // Create review
  create: (reviewData) => {
    const stmt = db.prepare(`
      INSERT INTO reviews (reviewer_id, reviewee_id, request_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      reviewData.reviewer_id,
      reviewData.reviewee_id,
      reviewData.request_id,
      reviewData.rating,
      reviewData.comment || null
    );
  },

  // Find review by ID
  findById: (id) => {
    return db.prepare(`
      SELECT r.*,
        reviewer.name as reviewer_name, reviewer.avatar as reviewer_avatar,
        reviewee.name as reviewee_name
      FROM reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN users reviewee ON r.reviewee_id = reviewee.id
      WHERE r.id = ?
    `).get(id);
  },

  // Get reviews for a user
  findByUserId: (userId) => {
    return db.prepare(`
      SELECT r.*,
        reviewer.name as reviewer_name, reviewer.avatar as reviewer_avatar
      FROM reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);
  },

  // Get average rating for user
  getAverageRating: (userId) => {
    return db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE reviewee_id = ?
    `).get(userId);
  },

  // Check if review exists for request
  existsForRequest: (requestId, reviewerId) => {
    return db.prepare(`
      SELECT id FROM reviews WHERE request_id = ? AND reviewer_id = ?
    `).get(requestId, reviewerId);
  },

  // Delete review
  delete: (id) => {
    return db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  },
};
