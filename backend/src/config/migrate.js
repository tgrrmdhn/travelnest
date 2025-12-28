import { initDatabase } from './database.js';

console.log('🔄 Running database migration...');

try {
  initDatabase();
  console.log('✅ Migration completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}