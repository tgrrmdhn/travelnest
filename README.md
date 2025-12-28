# TravelNest 🏠

TravelNest adalah platform couchsurfing yang memungkinkan traveler menemukan tempat tinggal gratis dan host untuk berbagi rumah mereka dengan traveler dari seluruh dunia.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Setup Development](#setup-development)
- [Docker Deployment](#docker-deployment)
- [Jenkins CI/CD](#jenkins-cicd)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

## ✨ Fitur

- 🔐 Authentication & Authorization (JWT)
- 👤 User Management (Admin, Host, Traveler)
- 🏡 Property Listing Management
- 📝 Stay Request System
- 💬 Real-time Chat (Socket.IO)
- ⭐ Review & Rating System
- 📋 KYC Verification
- 🔔 Notification System
- 📊 Admin Dashboard

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.IO
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **HTTP Client:** Fetch API

## 📁 Struktur Project

```
travelnest/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database & configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   └── routes/         # API routes
│   ├── uploads/            # File uploads directory
│   ├── database/           # SQLite database
│   ├── Dockerfile          # Backend Docker config
│   └── server.js           # Entry point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Helper functions
│   ├── Dockerfile          # Frontend Docker config
│   └── nginx.conf          # Nginx configuration
│
├── docker-compose.yml      # Docker orchestration
├── Jenkinsfile            # CI/CD pipeline
└── README.md              # This file
```

## 🚀 Setup Development

### Prerequisites

- Node.js 20+
- npm atau yarn
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd travelnest
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# nano .env

# Run database migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🐳 Docker Deployment

### Quick Start dengan Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build Individual Services

**Backend:**
```bash
cd backend
docker build -t travelnest-backend .
docker run -p 3000:3000 --env-file .env travelnest-backend
```

**Frontend:**
```bash
cd frontend
docker build -t travelnest-frontend .
docker run -p 80:80 travelnest-frontend
```

### Docker Compose Services

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:80`

### Docker Environment Variables

Sebelum menjalankan docker-compose, set environment variable:

```bash
export JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
```

Atau buat file `.env` di root project:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

## 🔄 Jenkins CI/CD

### Jenkins Setup

1. **Install Jenkins**
   ```bash
   # Menggunakan Docker
   docker run -d -p 8080:8080 -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     jenkins/jenkins:lts
   ```

2. **Install Required Plugins**
   - Docker Pipeline
   - Git Plugin
   - NodeJS Plugin
   - Pipeline Plugin

3. **Configure Credentials**
   - Buka Jenkins → Manage Jenkins → Credentials
   - Tambahkan Docker Hub credentials (ID: `dockerhub-credentials`)
   - Tambahkan Git credentials (jika repository private)

4. **Create Pipeline Job**
   - New Item → Pipeline
   - Configure → Pipeline → Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `<your-git-repo-url>`
   - Script Path: `Jenkinsfile`

5. **Set Environment Variables**
   Tambahkan di Jenkins → Configure System → Global Properties:
   - `DOCKER_USERNAME`: Docker Hub username
   - `JWT_SECRET`: JWT secret key

### Pipeline Stages

Pipeline Jenkins meliputi:

1. **Checkout**: Clone repository
2. **Environment Setup**: Verifikasi tools
3. **Install Dependencies**: Install npm packages
4. **Run Tests**: Jalankan unit tests
5. **Code Quality**: Linting & code analysis
6. **Build Docker Images**: Build backend & frontend images
7. **Security Scan**: Vulnerability scanning
8. **Deploy to Staging**: Auto-deploy branch `develop`
9. **Deploy to Production**: Manual approval untuk branch `main`
10. **Smoke Tests**: Health checks

### Branch Strategy

- **main**: Production branch
- **develop**: Staging branch
- **feature/***: Feature branches

### Triggering Pipeline

```bash
# Push to develop (auto-deploy to staging)
git push origin develop

# Push to main (manual approval to production)
git push origin main
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_PATH=./database/travelnest.db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register        # Register user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/me              # Get current user
```

### User Endpoints

```
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update profile
POST   /api/users/upload-photo   # Upload profile photo
```

### Host Endpoints

```
GET    /api/hosts/properties     # Get host properties
POST   /api/hosts/properties     # Create property
PUT    /api/hosts/properties/:id # Update property
DELETE /api/hosts/properties/:id # Delete property
GET    /api/hosts/requests       # Get stay requests
PUT    /api/hosts/requests/:id   # Update request status
```

### Traveler Endpoints

```
GET    /api/travelers/search     # Search properties
POST   /api/travelers/requests   # Create stay request
GET    /api/travelers/requests   # Get my requests
```

### Admin Endpoints

```
GET    /api/admin/users          # Get all users
PUT    /api/admin/users/:id      # Update user
DELETE /api/admin/users/:id      # Delete user
GET    /api/admin/kyc            # Get KYC verifications
PUT    /api/admin/kyc/:id        # Verify KYC
```

### Chat Endpoints

```
GET    /api/chat/conversations   # Get conversations
GET    /api/chat/:conversationId # Get messages
POST   /api/chat/:conversationId # Send message
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Monitoring & Logs

### View Docker Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Health Checks

- Backend: `http://localhost:3000/api/health`
- Frontend: `http://localhost:80`

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check process using port
netstat -ano | findstr :3000
netstat -ano | findstr :80

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Docker Issues

```bash
# Remove all containers
docker-compose down -v

# Clean docker system
docker system prune -a

# Rebuild images
docker-compose build --no-cache
```

### Database Issues

```bash
# Reset database
cd backend
npm run reset

# Run migrations
npm run migrate

# Seed data
npm run seed
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - lihat file LICENSE untuk detail

## 👥 Team

TravelNest Team

## 📞 Support

Untuk pertanyaan dan support, silakan buat issue di repository ini.

---

**Happy Coding! 🚀**
