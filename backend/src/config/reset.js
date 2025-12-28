import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database/travelnest.db');

console.log('🔄 Resetting database...');

try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Database deleted');
  }

  console.log('✅ Database reset completed');
  console.log('💡 Run "npm run migrate" to recreate tables');
  console.log('💡 Run "npm run seed" to add sample data');

  process.exit(0);
} catch (error) {
  console.error('❌ Reset failed:', error);
  process.exit(1);
}