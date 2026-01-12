# TravelNest API - Security & Features Documentation

## Keamanan Yang Diimplementasikan

### 1. Input Sanitization & Validation

#### Mencegah XSS (Cross-Site Scripting)
- Semua input string di-sanitize menggunakan library `xss`
- HTML tags dihapus dari semua input user
- Script tags dan style tags di-strip secara otomatis

#### Mencegah SQL Injection
- Menggunakan prepared statements dari `better-sqlite3`
- Semua query menggunakan parameterized queries
- Validasi tambahan untuk mendeteksi SQL injection patterns

#### Input Validation
- Validasi tipe data (string, number, date, email)
- Validasi panjang string (min/max length)
- Validasi format (email, ISO date, dll)
- Whitelist validasi untuk enum values (role, status, dll)

### 2. Security Headers
- **Helmet.js**: Mengatur security headers
- **Content Security Policy (CSP)**: Membatasi sumber resource yang boleh dimuat
- **HSTS**: Memaksa HTTPS connections
- **X-Frame-Options**: Mencegah clickjacking
- **X-Content-Type-Options**: Mencegah MIME sniffing

### 3. Rate Limiting
- Limit request per IP address
- Mencegah brute force attacks
- Mencegah DDoS attacks

### 4. Authentication & Authorization
- JWT token-based authentication
- Role-based access control (admin, host, traveler)
- Token expiration

## Fitur Host Management

### 1. Membuat/Update Profil Host

**Endpoint**: `POST /api/host/profile`
**Endpoint**: `PUT /api/host/profile`

**Validasi Input**:
- `title`: 3-100 karakter, required
- `description`: 10-2000 karakter, required
- `city`: max 100 karakter, required
- `country`: max 100 karakter, required
- `max_guests`: 1-100, integer, required
- `amenities`: array, optional
- `house_rules`: max 1000 karakter, optional

**Security Features**:
- Semua string input di-sanitize untuk XSS
- Validasi panjang untuk mencegah buffer overflow
- User hanya bisa membuat/update profil mereka sendiri

**Response**:
```json
{
  "success": true,
  "message": "Host profile created/updated successfully",
  "data": {
    "host": { /* host object */ }
  }
}
```

### 2. Upload Foto Properti

**Endpoint**: `POST /api/host/photos`

**Security Features**:
- File type validation (only images)
- File size limit
- Filename sanitization
- Stored in isolated upload directory

## Fitur Booking/Request System

### 1. Traveler Membuat Request

**Endpoint**: `POST /api/traveler/requests`

**Validasi Input**:
- `host_id`: integer > 0, required
- `check_in`: ISO date, tidak boleh di masa lalu, required
- `check_out`: ISO date, harus setelah check_in, required
- `guests`: 1-100, integer, required
- `message`: max 500 karakter, optional

**Security Features**:
- Date validation mencegah booking di masa lalu
- Check-out harus setelah check-in
- Message di-sanitize untuk XSS
- Validasi host_id untuk mencegah invalid references

**Notification**:
- Host otomatis menerima notification
- Notification tersimpan di database
- Real-time notification via Socket.IO (opsional)

**Response**:
```json
{
  "success": true,
  "message": "Request sent successfully. Host will be notified.",
  "data": {
    "request": { /* request object */ }
  }
}
```

### 2. Host Menerima/Menolak Request

**Endpoint**: `PUT /api/host/requests/:requestId/accept`
**Endpoint**: `PUT /api/host/requests/:requestId/reject`

**Security Features**:
- Verifikasi host adalah pemilik request
- Request status validation
- Authorization check

**Notification**:
- Traveler otomatis menerima notification
- Status "accepted" atau "rejected"
- Jika accepted, chat diaktifkan

**Response**:
```json
{
  "success": true,
  "message": "Request accepted/rejected. Traveler has been notified."
}
```

## Fitur Chat System

### 1. Kirim Pesan

**Endpoint**: `POST /api/chat/send`

**Security Features**:
- Hanya bisa chat jika ada accepted request
- Verifikasi relationship antara sender dan receiver
- Message di-sanitize untuk XSS
- Validasi panjang pesan (max 2000 chars)

**Validasi**:
```javascript
// Check if users have accepted request
const hasAcceptedRequest = db.prepare(`
  SELECT r.id FROM requests r
  LEFT JOIN hosts h ON r.host_id = h.id
  WHERE r.status = 'accepted'
    AND ((r.traveler_id = ? AND h.user_id = ?)
     OR (r.traveler_id = ? AND h.user_id = ?))
`).get(userId1, userId2, userId2, userId1);
```

**Response**:
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "chat": { /* message object */ }
  }
}
```

## Fitur Admin Monitoring

### 1. Activity Logs

**Endpoint**: `GET /api/admin/activity-logs`

**Query Parameters**:
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)
- `user_id`: filter by user
- `action`: filter by action type
- `date_from`: filter from date
- `date_to`: filter to date

**Log Information**:
- User ID
- Action (method + path)
- Details (query params, status code)
- IP Address
- User Agent
- Timestamp

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [ /* array of log objects */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2. System Logs

**Endpoint**: `GET /api/admin/system-logs`

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "type": "host_profile_update",
        "id": 1,
        "user_id": 5,
        "title": "Cozy Room in Jakarta",
        "city": "Jakarta",
        "timestamp": "2026-01-01T10:30:00.000Z"
      },
      {
        "type": "request",
        "id": 10,
        "traveler_id": 3,
        "host_id": 2,
        "status": "accepted",
        "timestamp": "2026-01-01T11:00:00.000Z"
      },
      {
        "type": "chat",
        "id": 25,
        "sender_id": 3,
        "receiver_id": 5,
        "timestamp": "2026-01-01T11:15:00.000Z"
      }
    ]
  }
}
```

### 3. Recent Activities

**Endpoint**: `GET /api/admin/recent-activities`

**Query Parameters**:
- `limit`: number of activities (default: 50)

## Console Logging

Semua aktivitas penting dicatat di console dengan format:
```
[ADMIN LOG] Action - Details
```

Contoh:
```
[ADMIN LOG] Host profile created - User ID: 5, Host ID: 3, City: Jakarta, Country: Indonesia
[ADMIN LOG] Request created - Request ID: 10, Traveler ID: 3, Host ID: 2, Check-in: 2026-01-15, Check-out: 2026-01-20
[ADMIN LOG] Request accepted - Request ID: 10, Host ID: 2, Traveler ID: 3
[ADMIN LOG] Message sent - From: 3, To: 5, Length: 150 chars
```

## Flow Lengkap

### 1. Host Setup Profil
1. Host login dengan role 'host'
2. Host POST ke `/api/host/profile` dengan data profil
3. Data di-validate dan di-sanitize
4. Profil disimpan ke database
5. Log dicatat: "Host profile created"
6. Response sukses dikembalikan

### 2. Traveler Mencari dan Booking
1. Traveler login dengan role 'traveler'
2. Traveler GET ke `/api/traveler/search?city=Jakarta`
3. Query di-sanitize
4. Database query dengan prepared statement
5. List host dikembalikan
6. Log dicatat: "Host search"
7. Traveler pilih host dan POST ke `/api/traveler/requests`
8. Request data di-validate dan di-sanitize
9. Request disimpan ke database
10. Notification dibuat untuk host
11. Log dicatat: "Request created"
12. Response sukses dikembalikan

### 3. Host Accept/Reject Request
1. Host GET `/api/host/requests` untuk melihat pending requests
2. Host PUT `/api/host/requests/:id/accept` atau `/reject`
3. Verifikasi authorization (host owns request)
4. Status di-update di database
5. Notification dibuat untuk traveler
6. Log dicatat: "Request accepted/rejected"
7. Response sukses dikembalikan

### 4. Chat (Jika Accepted)
1. User POST ke `/api/chat/send`
2. Verifikasi ada accepted request antara users
3. Message di-sanitize untuk XSS
4. Message disimpan ke database
5. Log dicatat: "Message sent"
6. Response sukses dikembalikan
7. Real-time notification via Socket.IO (optional)

### 5. Admin Monitoring
1. Admin GET `/api/admin/system-logs`
2. Melihat semua aktivitas (host updates, requests, chats)
3. Admin GET `/api/admin/activity-logs`
4. Filter logs by user, action, date
5. Monitor untuk suspicious activities

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_PATH=./database/travelnest.db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Best Practices Implemented

1. **Input Validation**: Semua input divalidasi di route level
2. **Input Sanitization**: Semua input di-sanitize di controller level
3. **Prepared Statements**: Mencegah SQL injection
4. **XSS Prevention**: HTML tags dihapus dari input
5. **Authorization**: Role-based access control
6. **Logging**: Comprehensive logging untuk monitoring
7. **Error Handling**: Centralized error handler
8. **Security Headers**: Helmet.js dengan CSP
9. **Rate Limiting**: Mencegah abuse
10. **Activity Logging**: Audit trail untuk compliance
