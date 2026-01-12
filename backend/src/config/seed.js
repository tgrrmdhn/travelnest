import bcrypt from 'bcryptjs';
import db from './database.js';

console.log('🌱 Seeding database...');

try {
  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  
  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists. Skipping seed.');
    console.log('\n📝 Login with: admin@travelnest.com / admin123');
    process.exit(0);
  }

  // Create admin user only (no KYC needed for admin)
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const insertAdmin = db.prepare(`
    INSERT INTO users (email, password, name, phone, role, account_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminInfo = insertAdmin.run(
    'admin@travelnest.com',
    hashedPassword,
    'Admin TravelNest',
    '+62812345678',
    'admin',
    'active'
  );

  console.log('✅ Admin user created successfully (ID:', adminInfo.lastInsertRowid + ')');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Admin Login:');
  console.log('   Email: admin@travelnest.com');
  console.log('   Password: admin123');
  console.log('\n💡 Tip: Users can register themselves as Host or Traveler via the registration page.');

  process.exit(0);
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
