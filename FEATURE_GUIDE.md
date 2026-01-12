# TravelNest - Panduan Fitur Kelola Host

## Ringkasan Implementasi

Sistem TravelNest sekarang telah diimplementasikan dengan lengkap dan aman untuk:

### ✅ Fitur yang Telah Diimplementasikan

#### 1. **Host Profile Management**
- Host dapat membuat dan mengupdate profil secara langsung
- Data tersimpan ke database dengan aman
- Traveler dapat mencari host yang sudah setup profil

#### 2. **Booking/Request System dengan Notifikasi**
- Traveler dapat mencari host berdasarkan lokasi dan kapasitas
- Traveler dapat membuat booking request
- Host otomatis menerima notifikasi saat ada request baru
- Host dapat menerima atau menolak request
- Traveler otomatis menerima notifikasi saat request disetujui/ditolak

#### 3. **Chat System (Conditional)**
- Chat hanya diaktifkan jika request telah disetujui
- Traveler dan host dapat berkomunikasi setelah booking diterima
- Jika request ditolak, hanya ada notifikasi tanpa akses chat

#### 4. **Admin Monitoring**
- Admin dapat memantau semua aktivitas sistem
- Log otomatis untuk semua action penting
- Dashboard untuk melihat recent activities
- System logs untuk tracking changes

#### 5. **Security Implementation**
- Input sanitization untuk mencegah XSS attacks
- Prepared statements untuk mencegah SQL injection
- Input validation yang ketat
- Rate limiting untuk mencegah abuse
- Security headers (Helmet.js + CSP)
- Activity logging untuk audit trail

---

## Flow Penggunaan Lengkap

### A. Setup Profil Host

```bash
# 1. Login sebagai host
POST /api/auth/login
{
  "email": "host@example.com",
  "password": "password123"
}

# 2. Buat profil host
POST /api/host/profile
{
  "title": "Cozy Room in Central Jakarta",
  "description": "A comfortable room with all amenities...",
  "city": "Jakarta",
  "country": "Indonesia",
  "max_guests": 2,
  "amenities": ["WiFi", "AC", "Kitchen"],
  "house_rules": "No smoking, no pets"
}

# Response:
{
  "success": true,
  "message": "Host profile created successfully",
  "data": {
    "host": {
      "id": 1,
      "user_id": 5,
      "title": "Cozy Room in Central Jakarta",
      ...
    }
  }
}

# 3. Upload foto properti (optional)
POST /api/host/photos
Content-Type: multipart/form-data
photos: [file1.jpg, file2.jpg]

# Log yang tercatat di console:
# [ADMIN LOG] Host profile created - User ID: 5, Host ID: 1, City: Jakarta, Country: Indonesia
```

### B. Traveler Mencari dan Booking

```bash
# 1. Login sebagai traveler
POST /api/auth/login
{
  "email": "traveler@example.com",
  "password": "password123"
}

# 2. Cari host
GET /api/traveler/search?city=Jakarta&max_guests=2

# Response:
{
  "success": true,
  "data": {
    "hosts": [
      {
        "id": 1,
        "title": "Cozy Room in Central Jakarta",
        "city": "Jakarta",
        "country": "Indonesia",
        "max_guests": 2,
        ...
      }
    ]
  }
}

# Log:
# [ADMIN LOG] Host search - User ID: 3, Filters: city=Jakarta, country=null, max_guests=2, Results: 1

# 3. Lihat detail host
GET /api/traveler/hosts/1

# 4. Buat booking request
POST /api/traveler/requests
{
  "host_id": 1,
  "check_in": "2026-01-15",
  "check_out": "2026-01-20",
  "guests": 2,
  "message": "Hi, I would like to stay at your place..."
}

# Response:
{
  "success": true,
  "message": "Request sent successfully. Host will be notified.",
  "data": {
    "request": {
      "id": 10,
      "traveler_id": 3,
      "host_id": 1,
      "status": "pending",
      ...
    }
  }
}

# Log:
# [ADMIN LOG] Request created - Request ID: 10, Traveler ID: 3, Host ID: 1, Check-in: 2026-01-15, Check-out: 2026-01-20

# 5. Traveler check notifikasi
GET /api/user/notifications

# Notification yang diterima traveler (nanti setelah host accept/reject)
```

### C. Host Menerima/Menolak Request

```bash
# 1. Host check pending requests
GET /api/host/requests?status=pending

# Response:
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 10,
        "traveler_name": "John Doe",
        "check_in": "2026-01-15",
        "check_out": "2026-01-20",
        "guests": 2,
        "message": "Hi, I would like to stay...",
        "status": "pending",
        ...
      }
    ]
  }
}

# 2a. Host MENERIMA request
PUT /api/host/requests/10/accept

# Response:
{
  "success": true,
  "message": "Request accepted. Traveler has been notified."
}

# System otomatis:
# - Update request status ke "accepted"
# - Buat notification untuk traveler:
#   "Your stay request at Cozy Room in Central Jakarta has been accepted!"
# - Enable chat antara host dan traveler
# - Log tercatat

# Log:
# [ADMIN LOG] Request accepted - Request ID: 10, Host ID: 1, Traveler ID: 3

# 2b. Atau host MENOLAK request
PUT /api/host/requests/10/reject

# Response:
{
  "success": true,
  "message": "Request rejected. Traveler has been notified."
}

# System otomatis:
# - Update request status ke "rejected"
# - Buat notification untuk traveler:
#   "Your stay request at Cozy Room in Central Jakarta has been rejected."
# - Chat TIDAK diaktifkan
# - Log tercatat

# Log:
# [ADMIN LOG] Request rejected - Request ID: 10, Host ID: 1, Traveler ID: 3
```

### D. Traveler Menerima Notifikasi

```bash
# 1. Check notifications
GET /api/user/notifications

# Response (jika accepted):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 25,
        "title": "Request Accepted",
        "message": "Your stay request at Cozy Room in Central Jakarta has been accepted!",
        "type": "request_accepted",
        "is_read": 0,
        "created_at": "2026-01-01T10:30:00.000Z"
      }
    ]
  }
}

# Response (jika rejected):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 26,
        "title": "Request Rejected",
        "message": "Your stay request at Cozy Room in Central Jakarta has been rejected.",
        "type": "request_rejected",
        "is_read": 0,
        "created_at": "2026-01-01T10:35:00.000Z"
      }
    ]
  }
}

# 2. Check unread count
GET /api/user/notifications/unread-count

# Response:
{
  "success": true,
  "data": {
    "count": 1
  }
}

# 3. Mark notification as read
PUT /api/user/notifications/25/read

# 4. Mark all as read
PUT /api/user/notifications/read-all
```

### E. Chat (Jika Request Accepted)

```bash
# 1. Traveler/Host send message (hanya jika request accepted)
POST /api/chat/send
{
  "receiver_id": 5,
  "message": "Thanks for accepting! What time should I arrive?"
}

# System checks:
# - Apakah ada accepted request antara sender dan receiver?
# - Jika tidak ada, return 403 Forbidden
# - Jika ada, message dikirim

# Response (success):
{
  "success": true,
  "message": "Message sent",
  "data": {
    "chat": {
      "id": 50,
      "sender_id": 3,
      "receiver_id": 5,
      "message": "Thanks for accepting! What time should I arrive?",
      ...
    }
  }
}

# Response (jika tidak ada accepted request):
{
  "success": false,
  "message": "Chat is only allowed between users with accepted booking requests"
}

# Log:
# [ADMIN LOG] Message sent - From: 3, To: 5, Length: 48 chars

# 2. Get conversation
GET /api/chat/conversations/5

# 3. Get all conversations
GET /api/chat/conversations

# 4. Mark messages as read
PUT /api/chat/conversations/5/read
```

### F. Admin Monitoring

```bash
# 1. Login sebagai admin
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# 2. View system logs (recent activities)
GET /api/admin/system-logs

# Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "type": "host_profile_update",
        "id": 1,
        "user_id": 5,
        "title": "Cozy Room in Central Jakarta",
        "city": "Jakarta",
        "timestamp": "2026-01-01T09:00:00.000Z"
      },
      {
        "type": "request",
        "id": 10,
        "traveler_id": 3,
        "host_id": 1,
        "status": "accepted",
        "timestamp": "2026-01-01T10:30:00.000Z"
      },
      {
        "type": "chat",
        "id": 50,
        "sender_id": 3,
        "receiver_id": 5,
        "timestamp": "2026-01-01T11:00:00.000Z"
      }
    ]
  }
}

# 3. View activity logs (detailed API logs)
GET /api/admin/activity-logs?page=1&limit=20

# Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 150,
        "user_id": 5,
        "user_name": "Host User",
        "user_email": "host@example.com",
        "action": "PUT /api/host/requests/10/accept",
        "details": "{\"method\":\"PUT\",\"path\":\"/api/host/requests/10/accept\",\"status\":200}",
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-01-01T10:30:00.000Z"
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}

# 4. Filter logs by user
GET /api/admin/activity-logs?user_id=5

# 5. Filter logs by action
GET /api/admin/activity-logs?action=accept

# 6. Filter logs by date
GET /api/admin/activity-logs?date_from=2026-01-01&date_to=2026-01-31

# 7. View recent activities
GET /api/admin/recent-activities?limit=50

# 8. View statistics
GET /api/admin/statistics

# Response:
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalHosts": 50,
    "totalTravelers": 95,
    "totalRequests": 200,
    "pendingKyc": 10
  }
}
```

---

## Keamanan yang Diimplementasikan

### 1. **XSS Prevention**
- ✅ Semua input string di-sanitize menggunakan `xss` library
- ✅ HTML tags dihapus dari input
- ✅ Script tags di-strip

**Contoh:**
```javascript
Input:  "<script>alert('xss')</script>Hello"
Output: "Hello"
```

### 2. **SQL Injection Prevention**
- ✅ Menggunakan prepared statements
- ✅ Parameterized queries
- ✅ Validasi SQL patterns

**Contoh Query Aman:**
```javascript
// AMAN - prepared statement
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// TIDAK AMAN - string concatenation (TIDAK DIGUNAKAN)
// db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get();
```

### 3. **Input Validation**
- ✅ Validasi tipe data
- ✅ Validasi panjang string
- ✅ Validasi format (email, date, etc)
- ✅ Whitelist untuk enum values

**Contoh:**
```javascript
// Title: 3-100 karakter
body('title').trim().isLength({ min: 3, max: 100 })

// Email: valid email format
body('email').isEmail().normalizeEmail()

// Date: tidak boleh di masa lalu
body('check_in').isISO8601().custom((value) => {
  if (new Date(value) < new Date()) {
    throw new Error('Date cannot be in the past');
  }
  return true;
})
```

### 4. **Authorization Checks**
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Resource ownership verification

**Contoh:**
```javascript
// Host hanya bisa accept/reject request mereka sendiri
const host = HostModel.findByUserId(req.user.id);
if (request.host_id !== host.id) {
  return res.status(403).json({ message: 'Not authorized' });
}
```

### 5. **Chat Access Control**
- ✅ Chat hanya diizinkan jika ada accepted request
- ✅ Verifikasi relationship sebelum kirim message

**Contoh:**
```javascript
// Check accepted request
const hasAcceptedRequest = db.prepare(`
  SELECT r.id FROM requests r
  LEFT JOIN hosts h ON r.host_id = h.id
  WHERE r.status = 'accepted'
    AND ((r.traveler_id = ? AND h.user_id = ?)
     OR (r.traveler_id = ? AND h.user_id = ?))
`).get(sender_id, receiver_id, receiver_id, sender_id);

if (!hasAcceptedRequest) {
  return res.status(403).json({
    message: 'Chat is only allowed between users with accepted booking requests'
  });
}
```

---

## Console Logs untuk Admin

Semua aktivitas penting di-log ke console:

```
[ADMIN LOG] Host profile created - User ID: 5, Host ID: 1, City: Jakarta, Country: Indonesia
[ADMIN LOG] Host search - User ID: 3, Filters: city=Jakarta, country=null, max_guests=2, Results: 1
[ADMIN LOG] Request created - Request ID: 10, Traveler ID: 3, Host ID: 1, Check-in: 2026-01-15, Check-out: 2026-01-20
[ADMIN LOG] Request accepted - Request ID: 10, Host ID: 1, Traveler ID: 3
[ADMIN LOG] Message sent - From: 3, To: 5, Length: 48 chars
```

---

## Testing

### 1. Test Host Profile Creation

```bash
# Login sebagai host
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"host@example.com","password":"password123"}'

# Buat profil (dengan token dari login)
curl -X POST http://localhost:3000/api/host/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"Cozy Room",
    "description":"A comfortable room",
    "city":"Jakarta",
    "country":"Indonesia",
    "max_guests":2
  }'
```

### 2. Test Search & Booking

```bash
# Login sebagai traveler
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@example.com","password":"password123"}'

# Search hosts
curl -X GET "http://localhost:3000/api/traveler/search?city=Jakarta" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create request
curl -X POST http://localhost:3000/api/traveler/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "host_id":1,
    "check_in":"2026-01-15",
    "check_out":"2026-01-20",
    "guests":2,
    "message":"I would like to stay"
  }'
```

### 3. Test Accept/Reject

```bash
# Host accept request
curl -X PUT http://localhost:3000/api/host/requests/1/accept \
  -H "Authorization: Bearer HOST_TOKEN"

# Check traveler notifications
curl -X GET http://localhost:3000/api/user/notifications \
  -H "Authorization: Bearer TRAVELER_TOKEN"
```

### 4. Test Chat (after accept)

```bash
# Send message
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "receiver_id":5,
    "message":"Hello!"
  }'
```

---

## Troubleshooting

### Error: "Chat is only allowed between users with accepted booking requests"
**Penyebab:** Request belum disetujui atau tidak ada request antara users  
**Solusi:** Host harus accept request terlebih dahulu

### Error: "Host profile already exists"
**Penyebab:** User sudah membuat profil host sebelumnya  
**Solusi:** Gunakan PUT /api/host/profile untuk update

### Error: "Invalid input detected"
**Penyebab:** Input mengandung SQL injection patterns  
**Solusi:** Gunakan input yang valid tanpa SQL keywords

### Error: "Validation error"
**Penyebab:** Input tidak sesuai dengan validasi (panjang, format, dll)  
**Solusi:** Check error message untuk detail field mana yang invalid

---

## Next Steps

1. **Frontend Integration**: Implementasikan UI untuk fitur-fitur yang sudah ada
2. **Real-time Notifications**: Gunakan Socket.IO untuk push notifications
3. **Email Notifications**: Kirim email saat ada notifikasi penting
4. **Push Notifications**: Implementasi web push notifications
5. **File Upload Security**: Tambah virus scanning untuk uploaded files

---

## Support

Jika ada pertanyaan atau issue, silakan check:
- `SECURITY_FEATURES.md` untuk detail keamanan
- Console logs untuk debugging
- `/api/admin/activity-logs` untuk audit trail
