# Socket.IO Integration Setup

## Installation Required

Socket.IO telah diintegrasikan ke dalam aplikasi TravelNest untuk real-time chat. Untuk menjalankannya, install package yang diperlukan:

### Backend
Backend sudah memiliki Socket.IO terinstall. Tidak perlu install tambahan.

### Frontend
Install socket.io-client di frontend:

```bash
cd frontend
npm install socket.io-client
```

## Fitur Real-Time Chat

### ✅ Yang Sudah Diimplementasikan:

1. **Socket.IO Server** (Backend)
   - Authentication via JWT token
   - Personal rooms untuk setiap user
   - Conversation rooms untuk private chat
   - Event handlers: send_message, typing_start, typing_stop
   - Auto-save messages ke database SQLite

2. **Socket Service** (Frontend)
   - Connection management dengan auto-reconnect
   - Join/leave conversation rooms
   - Send messages real-time
   - Typing indicators
   - Message notifications
   - Read receipts

3. **Chat REST API**
   - GET /api/chat/conversation/:userId - Load chat history
   - GET /api/chat/conversations - Get all conversations
   - POST /api/chat/send - Send message (fallback)
   - PUT /api/chat/read/:userId - Mark as read
   - GET /api/chat/unread - Get unread count

4. **UI Components**
   - **Host Chat**: Real-time chat dengan traveler yang requestnya di-accept
   - **Traveler Chat**: Real-time chat dengan host yang menerima request
   - Typing indicator dengan animasi dots
   - Auto-scroll ke message terbaru
   - Loading states
   - Send button dengan loading spinner

### Cara Kerja:

1. User login → Socket.IO connect dengan JWT token
2. User buka chat → Join conversation room
3. User ketik message → Typing indicator muncul di sisi lain
4. User send message → Real-time via Socket.IO + saved to database
5. Other user receive → Message muncul instantly
6. User buka conversation → Mark messages as read

### Event Socket.IO:

**Client → Server:**
- `join_conversation` - Join room untuk chat dengan user tertentu
- `leave_conversation` - Leave room
- `send_message` - Kirim pesan
- `typing_start` - User mulai mengetik
- `typing_stop` - User berhenti mengetik

**Server → Client:**
- `new_message` - Pesan baru diterima
- `message_notification` - Notifikasi pesan (jika tidak di room)
- `user_typing` - User lain sedang mengetik
- `messages_read` - Pesan sudah dibaca

### Security:

- ✅ JWT authentication untuk Socket.IO
- ✅ XSS prevention (sanitize messages)
- ✅ Only users with accepted requests can chat
- ✅ SQL injection protection
- ✅ CORS configured

### Testing:

1. Login sebagai Host (Sarah)
2. Accept request dari Traveler (Alex)
3. Buka "Chat" di Host → muncul conversation dengan Alex
4. Login sebagai Traveler (Alex) di tab/browser lain
5. Buka "Chat" di Traveler → muncul conversation dengan Sarah
6. Send message dari salah satu → message muncul real-time di kedua sisi
7. Ketik message → typing indicator muncul di sisi lain

### Troubleshooting:

Jika Socket.IO tidak connect:
- Check console browser untuk error
- Pastikan backend running di port 3000
- Check CORS settings di server.js
- Verify JWT token di localStorage

Jika messages tidak muncul:
- Check Network tab → Socket.IO connections
- Verify accepted requests ada di database
- Check console untuk Socket.IO events

## Run Application:

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install socket.io-client  # Install dulu!
npm run dev
```

Buka http://localhost:5173 dan test chat real-time! 🎉
