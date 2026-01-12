import db from './src/config/database.js';

console.log('\n=== USER AND HOST DATA ===');
const users = db.prepare('SELECT * FROM users WHERE id IN (1, 2, 3)').all();
console.log('Users:', users);

const hosts = db.prepare('SELECT * FROM hosts').all();
console.log('\nHosts:', hosts);

console.log('\n=== CHAT MESSAGES BETWEEN USER 2 AND 3 ===');
const messages = db.prepare(`
  SELECT id, sender_id, receiver_id, message, created_at 
  FROM chats 
  WHERE (sender_id = 2 AND receiver_id = 3) 
     OR (sender_id = 3 AND receiver_id = 2)
  ORDER BY id
`).all();
console.log(`Found ${messages.length} messages:`);
messages.forEach(msg => {
  console.log(`  ID:${msg.id} From:${msg.sender_id} To:${msg.receiver_id} "${msg.message}"`);
});

console.log('\n=== REQUESTS ===');
const requests = db.prepare('SELECT * FROM requests WHERE traveler_id = 3').all();
console.log('Requests:', requests);
