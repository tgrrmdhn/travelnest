import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/travelnest.db');
const db = new Database(dbPath);

console.log('🔄 Running migration: Add checkout fields to requests table...');

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(requests)").all();
  const hasCheckoutRequested = tableInfo.some(col => col.name === 'checkout_requested');
  const hasCheckoutVerified = tableInfo.some(col => col.name === 'checkout_verified');

  if (!hasCheckoutRequested) {
    console.log('➕ Adding checkout_requested column...');
    db.exec('ALTER TABLE requests ADD COLUMN checkout_requested INTEGER DEFAULT 0');
    console.log('✅ Added checkout_requested column');
  } else {
    console.log('⏭️  checkout_requested column already exists');
  }

  if (!hasCheckoutVerified) {
    console.log('➕ Adding checkout_verified column...');
    db.exec('ALTER TABLE requests ADD COLUMN checkout_verified INTEGER DEFAULT 0');
    console.log('✅ Added checkout_verified column');
  } else {
    console.log('⏭️  checkout_verified column already exists');
  }

  // Update status enum to include 'completed' if needed
  console.log('🔄 Checking status values...');
  const requests = db.prepare("SELECT status FROM requests").all();
  console.log(`✅ Migration completed successfully!`);

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

db.close();
