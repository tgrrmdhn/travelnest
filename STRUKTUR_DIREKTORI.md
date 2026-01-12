# Struktur Direktori Aplikasi TravelNest

## Struktur Direktori Backend

```
backend/
├── database/                      # Database SQLite
│   └── travelnest.db             # File database utama
│
├── src/                          # Source code utama
│   ├── config/                   # Konfigurasi aplikasi
│   │   ├── constants.js          # Konstanta aplikasi
│   │   ├── database.js           # Konfigurasi koneksi database
│   │   ├── jwt.js                # Konfigurasi JWT (JSON Web Token)
│   │   ├── migrate.js            # Script migrasi database
│   │   ├── migrate-checkout.js   # Script migrasi tabel checkout
│   │   ├── reset.js              # Script reset database
│   │   ├── seed.js               # Script seeding data dummy
│   │   └── socketHandlers.js     # Handler untuk Socket.IO
│   │
│   ├── controllers/              # Business logic controllers
│   │   ├── admin.controller.js   # Controller untuk admin (statistik, manajemen user)
│   │   ├── auth.controller.js    # Controller untuk autentikasi (login, register)
│   │   ├── chat.controller.js    # Controller untuk chat/messaging
│   │   ├── checkout.controller.js # Controller untuk checkout
│   │   ├── host.controller.js    # Controller untuk host (profil, ketersediaan)
│   │   ├── traveler.controller.js # Controller untuk traveler (search, request)
│   │   └── user.controller.js    # Controller untuk user profile
│   │
│   ├── middleware/               # Middleware functions
│   │   ├── activityLogger.middleware.js # Logging aktivitas user
│   │   ├── auth.middleware.js    # Autentikasi dan autorisasi
│   │   ├── error.middleware.js   # Error handling global
│   │   ├── logger.middleware.js  # Logging request HTTP
│   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   ├── upload.middleware.js  # Upload file (multer)
│   │   └── validation.middleware.js # Validasi input
│   │
│   ├── models/                   # Data models
│   │   ├── activityLog.model.js  # Model log aktivitas
│   │   ├── chat.model.js         # Model pesan chat
│   │   ├── host.model.js         # Model profil host
│   │   ├── notification.model.js # Model notifikasi
│   │   ├── request.model.js      # Model request stay
│   │   ├── review.model.js       # Model review/rating
│   │   └── user.model.js         # Model user
│   │
│   ├── routes/                   # API routes
│   │   ├── admin.routes.js       # Routes untuk admin
│   │   ├── auth.routes.js        # Routes untuk autentikasi
│   │   ├── chat.routes.js        # Routes untuk chat
│   │   ├── host.routes.js        # Routes untuk host
│   │   ├── review.routes.js      # Routes untuk review
│   │   ├── traveler.routes.js    # Routes untuk traveler
│   │   └── user.routes.js        # Routes untuk user profile
│   │
│   └── utils/                    # Utility functions
│       └── sanitizer.js          # Sanitasi input untuk keamanan
│
├── uploads/                      # Folder untuk file upload
│   ├── kyc/                      # Dokumen KYC (KTP, Passport)
│   ├── profiles/                 # Foto profil user
│   └── properties/               # Foto properti host
│
├── check-db.js                   # Script untuk cek database
├── server.js                     # Entry point aplikasi
├── package.json                  # Dependencies dan scripts
└── Dockerfile                    # Docker configuration untuk backend
```

## Struktur Direktori Frontend

```
frontend/
├── public/                       # Static assets
│
├── src/                          # Source code utama
│   ├── assets/                   # Asset gambar, icon, dll
│   │
│   ├── components/               # Reusable components
│   │   ├── common/               # Komponen umum (Button, Alert, Badge, dll)
│   │   │   ├── Alert.jsx         # Komponen alert/notification
│   │   │   ├── Badge.jsx         # Komponen badge/label
│   │   │   ├── Button.jsx        # Komponen button
│   │   │   ├── Card.jsx          # Komponen card
│   │   │   ├── Input.jsx         # Komponen input field
│   │   │   ├── Modal.jsx         # Komponen modal dialog
│   │   │   ├── NotificationContainer.jsx # Container notifikasi
│   │   │   ├── Select.jsx        # Komponen dropdown select
│   │   │   └── Textarea.jsx      # Komponen textarea
│   │   │
│   │   └── layout/               # Komponen layout
│   │       ├── Header.jsx        # Header aplikasi
│   │       └── Sidebar.jsx       # Sidebar navigasi
│   │
│   ├── contexts/                 # React Context API
│   │   ├── AuthContext.jsx       # Context untuk autentikasi
│   │   └── NotificationContext.jsx # Context untuk notifikasi
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useApi.js             # Hook untuk API calls
│   │   ├── useAuth.js            # Hook untuk autentikasi
│   │   ├── useDebounce.js        # Hook untuk debouncing
│   │   └── useNotification.js    # Hook untuk notifikasi
│   │
│   ├── pages/                    # Page components
│   │   ├── admin/                # Halaman untuk admin
│   │   │   ├── Dashboard.jsx     # Dashboard statistik admin
│   │   │   └── UserManagement.jsx # Manajemen user (ban/unban)
│   │   │
│   │   ├── auth/                 # Halaman autentikasi
│   │   │   ├── Login.jsx         # Halaman login
│   │   │   └── Register.jsx      # Halaman register
│   │   │
│   │   ├── host/                 # Halaman untuk host
│   │   │   ├── Calendar.jsx      # Kelola ketersediaan tanggal
│   │   │   ├── History.jsx       # Riwayat request
│   │   │   ├── Profile.jsx       # Kelola profil host
│   │   │   ├── Requests.jsx      # Request stay dari traveler
│   │   │   └── Reviews.jsx       # Review yang diterima
│   │   │
│   │   ├── traveler/             # Halaman untuk traveler
│   │   │   ├── Journey.jsx       # Riwayat perjalanan
│   │   │   ├── Reviews.jsx       # Review yang diberikan
│   │   │   ├── Search.jsx        # Cari host
│   │   │   └── Status.jsx        # Status request stay
│   │   │
│   │   └── NotFound.jsx          # Halaman 404
│   │
│   ├── services/                 # API services
│   │   ├── admin.service.js      # Service untuk admin API
│   │   ├── api.js                # Base API configuration (Axios)
│   │   ├── auth.service.js       # Service untuk autentikasi
│   │   ├── chat.service.js       # Service untuk chat
│   │   ├── host.service.js       # Service untuk host API
│   │   ├── socket.service.js     # Service untuk Socket.IO
│   │   ├── traveler.service.js   # Service untuk traveler API
│   │   └── user.service.js       # Service untuk user API
│   │
│   ├── utils/                    # Utility functions
│   │   ├── constants.js          # Konstanta aplikasi
│   │   ├── formatters.js         # Fungsi format data
│   │   ├── helpers.js            # Helper functions
│   │   └── validators.js         # Validasi input
│   │
│   ├── App.jsx                   # Root component
│   ├── App.css                   # Global styles
│   ├── main.jsx                  # Entry point React
│   └── index.css                 # Tailwind CSS imports
│
├── index.html                    # HTML template
├── package.json                  # Dependencies dan scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint configuration
├── nginx.conf                    # Nginx configuration untuk production
└── Dockerfile                    # Docker configuration untuk frontend
```

## Penjelasan Struktur

### Backend (Node.js + Express)

**Controllers**: Berisi business logic untuk memproses request dan mengirim response. Setiap controller menangani domain spesifik (admin, auth, host, traveler, dll).

**Models**: Berisi fungsi-fungsi untuk berinteraksi dengan database SQLite menggunakan better-sqlite3. Mengimplementasikan CRUD operations dan query kompleks.

**Routes**: Mendefinisikan endpoint API dan menghubungkan dengan controller. Menggunakan middleware untuk validasi dan autentikasi.

**Middleware**: Fungsi yang dijalankan sebelum request sampai ke controller. Digunakan untuk autentikasi, validasi, logging, rate limiting, dan error handling.

**Config**: File konfigurasi untuk database, JWT, dan Socket.IO. Juga berisi script untuk migrasi dan seeding database.

**Utils**: Fungsi-fungsi utility seperti sanitasi input untuk mencegah XSS dan SQL injection.

### Frontend (React + Vite)

**Components/Common**: Komponen UI yang dapat digunakan kembali di berbagai halaman (Button, Input, Modal, dll).

**Components/Layout**: Komponen untuk struktur layout aplikasi (Header, Sidebar).

**Pages**: Komponen halaman yang dipetakan ke route. Diorganisir berdasarkan role user (admin, host, traveler).

**Contexts**: Menggunakan React Context API untuk state management global (autentikasi, notifikasi).

**Hooks**: Custom hooks untuk logic yang dapat digunakan kembali (API calls, autentikasi, debouncing).

**Services**: Fungsi-fungsi untuk berkomunikasi dengan backend API menggunakan Axios. Setiap service menangani endpoint spesifik.

**Utils**: Fungsi-fungsi helper untuk formatting data, validasi, dan konstanta aplikasi.

## Teknologi yang Digunakan

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite dengan better-sqlite3
- **Autentikasi**: JWT (JSON Web Token)
- **Real-time**: Socket.IO
- **Upload**: Multer
- **Validasi**: Express-validator
- **Security**: bcryptjs, helmet, cors

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Routing**: Client-side routing (tanpa React Router)

## File Deployment

```
root/
├── docker-compose.yml            # Docker Compose untuk development
├── docker-compose.dev.yml        # Docker Compose untuk production
├── Jenkinsfile                   # CI/CD dengan Jenkins
├── deploy.sh                     # Script deployment (Linux/Mac)
└── deploy.bat                    # Script deployment (Windows)
```

## Dokumentasi Lainnya

- `README.md` - Panduan utama aplikasi
- `QUICK_START.md` - Panduan quick start
- `SETUP_COMPLETE.md` - Status setup aplikasi
- `DEPLOYMENT.md` - Panduan deployment
- `CICD.md` - Dokumentasi CI/CD
- `FEATURE_GUIDE.md` - Panduan fitur aplikasi
- `SECURITY_FEATURES.md` - Dokumentasi keamanan
- `PROFILE_SETUP_GUIDE.md` - Panduan setup profil
- `PHOTO_UPLOAD_GUIDE.md` - Panduan upload foto
- `SOCKET_IO_SETUP.md` - Dokumentasi Socket.IO

---

**Catatan**: Struktur ini mengikuti best practices untuk aplikasi fullstack dengan pemisahan yang jelas antara concerns, mudah di-maintain, dan scalable untuk pengembangan lebih lanjut.
