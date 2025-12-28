import db from '../config/database.js';

export const UserModel = {
  // Create user
  create: (userData) => {
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, phone, role, kyc_status, account_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      userData.email,
      userData.password,
      userData.name,
      userData.phone || null,
      userData.role,
      userData.kyc_status || 'pending',
      userData.account_status || 'active'
    );
  },

  // Find user by email
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  // Find user by ID
  findById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  // Get all users with pagination
  findAll: (page = 1, limit = 10, filters = {}) => {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.account_status) {
      query += ' AND account_status = ?';
      params.push(filters.account_status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    return db.prepare(query).all(...params);
  },

  // Count users
  count: (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.account_status) {
      query += ' AND account_status = ?';
      params.push(filters.account_status);
    }

    return db.prepare(query).get(...params).total;
  },

  // Update user
  update: (id, data) => {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `);

    return stmt.run(...values);
  },

  // Delete user
  delete: (id) => {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },

  // Update account status
  updateAccountStatus: (id, status) => {
    return db.prepare(`
      UPDATE users SET account_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);
  },

  // Update KYC status
  updateKycStatus: (id, status) => {
    return db.prepare(`
      UPDATE users SET kyc_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);
  },
};