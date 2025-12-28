import db from '../config/database.js';

export const HostModel = {
  // Create host profile
  create: (hostData) => {
    const stmt = db.prepare(`
      INSERT INTO hosts (
        user_id, title, description, address, city, country,
        latitude, longitude, max_guests, amenities, house_rules, photos, availability
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      hostData.user_id,
      hostData.title,
      hostData.description,
      hostData.address || null,
      hostData.city,
      hostData.country,
      hostData.latitude || null,
      hostData.longitude || null,
      hostData.max_guests,
      JSON.stringify(hostData.amenities || []),
      hostData.house_rules || null,
      JSON.stringify(hostData.photos || []),
      JSON.stringify(hostData.availability || {})
    );
  },

  // Find host by user ID
  findByUserId: (userId) => {
    const host = db.prepare(`
      SELECT h.*, u.name, u.email, u.avatar, u.phone
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      WHERE h.user_id = ?
    `).get(userId);

    if (host) {
      host.amenities = JSON.parse(host.amenities || '[]');
      host.photos = JSON.parse(host.photos || '[]');
      host.availability = JSON.parse(host.availability || '{}');
    }

    return host;
  },

  // Find host by ID
  findById: (id) => {
    const host = db.prepare(`
      SELECT h.*, u.name, u.email, u.avatar, u.phone
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      WHERE h.id = ?
    `).get(id);

    if (host) {
      host.amenities = JSON.parse(host.amenities || '[]');
      host.photos = JSON.parse(host.photos || '[]');
      host.availability = JSON.parse(host.availability || '{}');
    }

    return host;
  },

  // Search hosts
  search: (filters = {}) => {
    let query = `
      SELECT h.*, u.name, u.email, u.avatar,
        (SELECT AVG(rating) FROM reviews WHERE reviewee_id = u.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as review_count
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      WHERE u.account_status = 'active'
    `;
    const params = [];

    if (filters.city) {
      query += ' AND h.city LIKE ?';
      params.push(`%${filters.city}%`);
    }

    if (filters.country) {
      query += ' AND h.country LIKE ?';
      params.push(`%${filters.country}%`);
    }

    if (filters.max_guests) {
      query += ' AND h.max_guests >= ?';
      params.push(filters.max_guests);
    }

    query += ' ORDER BY h.created_at DESC';

    const hosts = db.prepare(query).all(...params);

    return hosts.map((host) => ({
      ...host,
      amenities: JSON.parse(host.amenities || '[]'),
      photos: JSON.parse(host.photos || '[]'),
      availability: JSON.parse(host.availability || '{}'),
    }));
  },

  // Update host profile
  update: (id, data) => {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        if (key === 'amenities' || key === 'photos' || key === 'availability') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE hosts SET ${fields.join(', ')} WHERE id = ?
    `);

    return stmt.run(...values);
  },

  // Delete host profile
  delete: (id) => {
    return db.prepare('DELETE FROM hosts WHERE id = ?').run(id);
  },
};

