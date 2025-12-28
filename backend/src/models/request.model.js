import db from '../config/database.js';

export const RequestModel = {
  // Create request
  create: (requestData) => {
    const stmt = db.prepare(`
      INSERT INTO requests (traveler_id, host_id, check_in, check_out, guests, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      requestData.traveler_id,
      requestData.host_id,
      requestData.check_in,
      requestData.check_out,
      requestData.guests,
      requestData.message || null,
      requestData.status || 'pending'
    );
  },

  // Find request by ID
  findById: (id) => {
    return db.prepare(`
      SELECT r.*,
        t.name as traveler_name, t.email as traveler_email, t.avatar as traveler_avatar,
        u.name as host_name, u.email as host_email,
        h.title as property_title, h.city, h.country
      FROM requests r
      JOIN users t ON r.traveler_id = t.id
      JOIN hosts h ON r.host_id = h.id
      JOIN users u ON h.user_id = u.id
      WHERE r.id = ?
    `).get(id);
  },

  // Get requests for traveler
  findByTravelerId: (travelerId, status = null) => {
    let query = `
      SELECT r.*,
        u.name as host_name, u.email as host_email,
        h.title as property_title, h.city, h.country
      FROM requests r
      JOIN hosts h ON r.host_id = h.id
      JOIN users u ON h.user_id = u.id
      WHERE r.traveler_id = ?
    `;
    const params = [travelerId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    return db.prepare(query).all(...params);
  },

  // Get requests for host
  findByHostId: (hostId, status = null) => {
    let query = `
      SELECT r.*,
        t.name as traveler_name, t.email as traveler_email, t.avatar as traveler_avatar,
        h.title as property_title
      FROM requests r
      JOIN users t ON r.traveler_id = t.id
      JOIN hosts h ON r.host_id = h.id
      WHERE h.id = ?
    `;
    const params = [hostId];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    return db.prepare(query).all(...params);
  },

  // Update request status
  updateStatus: (id, status) => {
    return db.prepare(`
      UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);
  },

  // Get all requests (admin)
  findAll: (page = 1, limit = 10) => {
    return db.prepare(`
      SELECT r.*,
        t.name as traveler_name,
        u.name as host_name,
        h.title as property_title
      FROM requests r
      JOIN users t ON r.traveler_id = t.id
      JOIN hosts h ON r.host_id = h.id
      JOIN users u ON h.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, (page - 1) * limit);
  },

  // Count requests
  count: () => {
    return db.prepare('SELECT COUNT(*) as total FROM requests').get().total;
  },

  // Delete request
  delete: (id) => {
    return db.prepare('DELETE FROM requests WHERE id = ?').run(id);
  },
};
