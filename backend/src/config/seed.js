import bcrypt from 'bcryptjs';
import db from './database.js';

console.log('🌱 Seeding database...');

try {
  // Seed admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const insertAdmin = db.prepare(`
    INSERT INTO users (email, password, name, phone, role, kyc_status, account_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const adminInfo = insertAdmin.run(
    'admin@travelnest.com',
    hashedPassword,
    'Admin User',
    '+62812345678',
    'admin',
    'approved',
    'active'
  );

  console.log('✅ Admin user created:', adminInfo.lastInsertRowid);

  // Seed sample host
  const hostPassword = bcrypt.hashSync('host123', 10);
  const insertHost = db.prepare(`
    INSERT INTO users (email, password, name, phone, role, kyc_status, account_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hostInfo = insertHost.run(
    'host@travelnest.com',
    hostPassword,
    'John Doe',
    '+62812345679',
    'host',
    'approved',
    'active'
  );

  console.log('✅ Host user created:', hostInfo.lastInsertRowid);

  // Create host profile
  const insertHostProfile = db.prepare(`
    INSERT INTO hosts (user_id, title, description, city, country, max_guests, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hostProfileInfo = insertHostProfile.run(
    hostInfo.lastInsertRowid,
    'Cozy Apartment in Jakarta',
    'Beautiful apartment with city view, perfect for travelers',
    'Jakarta',
    'Indonesia',
    2,
    JSON.stringify(['wifi', 'kitchen', 'ac'])
  );

  console.log('✅ Host profile created:', hostProfileInfo.lastInsertRowid);

  // Seed sample traveler
  const travelerPassword = bcrypt.hashSync('traveler123', 10);
  const insertTraveler = db.prepare(`
    INSERT INTO users (email, password, name, phone, role, kyc_status, account_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const travelerInfo = insertTraveler.run(
    'traveler@travelnest.com',
    travelerPassword,
    'Jane Smith',
    '+62812345680',
    'traveler',
    'approved',
    'active'
  );

  console.log('✅ Traveler user created:', travelerInfo.lastInsertRowid);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Default accounts:');
  console.log('   Admin: admin@travelnest.com / admin123');
  console.log('   Host: host@travelnest.com / host123');
  console.log('   Traveler: traveler@travelnest.com / traveler123');

  process.exit(0);
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
