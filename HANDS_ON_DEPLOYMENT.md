# Hands-On: Deployment Docker & CI/CD TravelNest

Panduan praktis step-by-step untuk melakukan deployment aplikasi TravelNest menggunakan Docker dan setup CI/CD dengan Jenkins.

---

## 📋 Prasyarat

Sebelum memulai, pastikan sudah terinstall:

- ✅ **Docker Desktop** (Windows/Mac) atau **Docker Engine** (Linux)
- ✅ **Docker Compose** (biasanya sudah include di Docker Desktop)
- ✅ **Git** untuk version control
- ✅ **Jenkins** (untuk CI/CD) - Opsional
- ✅ **Node.js** & **npm** (untuk development)

### Cek Instalasi

```powershell
# Cek Docker
docker --version
docker-compose --version

# Cek Node.js
node --version
npm --version

# Cek Git
git --version
```

---

## 🐳 PART 1: Deployment dengan Docker

### Step 1: Persiapan Environment Variables

1. **Buat file `.env` di root project:**

```powershell
# Copy dari .env.example
Copy-Item .env.example .env

# Edit file .env dengan text editor
notepad .env
```

2. **Isi konfigurasi yang diperlukan:**

```env
# Backend Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database
DATABASE_PATH=./database/travelnest.db

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Build Docker Images

1. **Build image Backend:**

```powershell
# Masuk ke folder backend
cd backend

# Build image
docker build -t travelnest-backend:latest .

# Verifikasi image berhasil dibuat
docker images | Select-String "travelnest-backend"

# Kembali ke root
cd ..
```

2. **Build image Frontend:**

```powershell
# Masuk ke folder frontend
cd frontend

# Build image
docker build -t travelnest-frontend:latest .

# Verifikasi image
docker images | Select-String "travelnest-frontend"

# Kembali ke root
cd ..
```

### Step 3: Deploy dengan Docker Compose

1. **Menggunakan Docker Compose untuk Development:**

```powershell
# Start semua services
docker-compose -f docker-compose.dev.yml up -d

# Cek status containers
docker-compose -f docker-compose.dev.yml ps

# Lihat logs
docker-compose -f docker-compose.dev.yml logs -f
```

2. **Menggunakan Docker Compose untuk Production:**

```powershell
# Start semua services
docker-compose up -d

# Cek status containers
docker-compose ps

# Lihat logs
docker-compose logs -f
```

### Step 4: Verifikasi Deployment

1. **Cek container yang berjalan:**

```powershell
docker ps
```

Output yang diharapkan:
```
CONTAINER ID   IMAGE                    PORTS                    STATUS
abc123def456   travelnest-frontend     0.0.0.0:3000->80/tcp    Up 2 minutes
def789ghi012   travelnest-backend      0.0.0.0:5000->5000/tcp  Up 2 minutes
```

2. **Test Backend API:**

```powershell
# Test health check (jika ada)
curl http://localhost:5000/api/health

# Atau buka di browser
Start-Process "http://localhost:5000"
```

3. **Test Frontend:**

```powershell
# Buka di browser
Start-Process "http://localhost:3000"
```

### Step 5: Monitoring Containers

```powershell
# Lihat logs backend
docker logs travelnest-backend -f

# Lihat logs frontend
docker logs travelnest-frontend -f

# Lihat resource usage
docker stats

# Inspect container
docker inspect travelnest-backend
```

### Step 6: Stop & Remove Containers

```powershell
# Stop containers
docker-compose down

# Stop dan remove volumes (HATI-HATI: akan hapus data!)
docker-compose down -v

# Stop dan remove images
docker-compose down --rmi all
```

---

## 🔧 PART 2: Troubleshooting Docker

### Problem 1: Port Sudah Digunakan

```powershell
# Cek port yang digunakan
netstat -ano | Select-String ":5000"
netstat -ano | Select-String ":3000"

# Matikan proses yang menggunakan port
# Ganti <PID> dengan Process ID yang ditemukan
Stop-Process -Id <PID> -Force

# Atau ubah port di docker-compose.yml
```

### Problem 2: Container Crash/Restart

```powershell
# Lihat logs untuk error
docker logs travelnest-backend --tail 100

# Masuk ke container untuk debug
docker exec -it travelnest-backend sh

# Restart container
docker restart travelnest-backend
```

### Problem 3: Database Error

```powershell
# Masuk ke backend container
docker exec -it travelnest-backend sh

# Jalankan migrasi database
cd /app
node src/config/migrate.js

# Atau jalankan seeding
node src/config/seed.js
```

### Problem 4: Frontend Tidak Connect ke Backend

1. **Cek environment variables di frontend:**

```powershell
# Masuk ke frontend container
docker exec -it travelnest-frontend sh

# Cek nginx config
cat /etc/nginx/conf.d/default.conf
```

2. **Pastikan VITE_API_URL benar:**

```env
# Di .env atau environment container
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 PART 3: CI/CD dengan Jenkins

### Step 1: Setup Jenkins

#### Opsi A: Install Jenkins di Local (Windows)

1. **Download Jenkins:**
```powershell
# Download dari https://www.jenkins.io/download/
# Pilih Windows installer (.msi)
```

2. **Install Jenkins:**
```powershell
# Run installer
# Default port: 8080
# Follow installation wizard
```

3. **Start Jenkins:**
```powershell
# Buka browser
Start-Process "http://localhost:8080"

# Get initial admin password
Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
```

#### Opsi B: Run Jenkins di Docker

```powershell
# Pull Jenkins image
docker pull jenkins/jenkins:lts

# Run Jenkins container
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Buka Jenkins
Start-Process "http://localhost:8080"
```

### Step 2: Konfigurasi Jenkins

1. **Install Required Plugins:**

   - Navigate ke: `Manage Jenkins` → `Manage Plugins` → `Available`
   - Install plugins:
     - ✅ **Docker Pipeline**
     - ✅ **Git Plugin**
     - ✅ **NodeJS Plugin**
     - ✅ **Blue Ocean** (untuk UI yang lebih baik)

2. **Setup Credentials:**

   - Navigate ke: `Manage Jenkins` → `Manage Credentials`
   - Add credentials:
     - **Docker Hub** (jika push ke registry)
     - **Git credentials** (jika private repo)

3. **Setup Tools:**

   - Navigate ke: `Manage Jenkins` → `Global Tool Configuration`
   - Setup **NodeJS**:
     - Name: `NodeJS-18`
     - Version: `18.x` atau latest
     - Install automatically: ✅

### Step 3: Create Jenkins Pipeline

1. **Create New Pipeline:**

   - Click `New Item`
   - Enter name: `TravelNest-Pipeline`
   - Select `Pipeline`
   - Click `OK`

2. **Configure Pipeline:**

   **Pipeline Definition:**
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `<your-git-repo-url>`
   - Branch: `*/main` atau `*/master`
   - Script Path: `Jenkinsfile`

3. **Atau gunakan Pipeline Script langsung:**

Copy isi dari `Jenkinsfile` project ke Pipeline Script section.

### Step 4: Jenkinsfile Explanation

Project sudah memiliki `Jenkinsfile` dengan stages berikut:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            // Clone repository
        }
        
        stage('Build Backend') {
            // Install dependencies backend
            // Run tests (jika ada)
        }
        
        stage('Build Frontend') {
            // Install dependencies frontend
            // Build production frontend
        }
        
        stage('Build Docker Images') {
            // Build Docker images untuk backend & frontend
        }
        
        stage('Deploy') {
            // Deploy menggunakan docker-compose
        }
    }
}
```

### Step 5: Run Pipeline

1. **Manual Trigger:**

```powershell
# Di Jenkins UI, click "Build Now"
```

2. **Setup Webhook untuk Auto-trigger:**

   - **GitHub:**
     - Go to repository → `Settings` → `Webhooks`
     - Add webhook:
       - Payload URL: `http://<jenkins-url>:8080/github-webhook/`
       - Content type: `application/json`
       - Events: `Push events`

   - **GitLab:**
     - Go to repository → `Settings` → `Webhooks`
     - Add webhook:
       - URL: `http://<jenkins-url>:8080/project/TravelNest-Pipeline`
       - Trigger: `Push events`

### Step 6: Monitor Pipeline

1. **View Pipeline Progress:**
```
Jenkins Dashboard → TravelNest-Pipeline → Build History → Latest Build
```

2. **View Logs:**
```
Click pada build number → Console Output
```

3. **View Blue Ocean (Better UI):**
```
Jenkins Dashboard → Open Blue Ocean → TravelNest-Pipeline
```

---

## 📊 PART 4: Advanced CI/CD

### Setup Multi-Branch Pipeline

Untuk handle multiple branches (dev, staging, production):

1. **Create Multi-branch Pipeline:**
   - New Item → `Multibranch Pipeline`
   - Add Git source
   - Jenkins otomatis detect branches dan Jenkinsfile

2. **Environment-specific Deployment:**

```groovy
pipeline {
    agent any
    
    environment {
        ENV = "${env.BRANCH_NAME == 'main' ? 'production' : 'development'}"
    }
    
    stages {
        stage('Deploy') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        sh 'docker-compose -f docker-compose.yml up -d'
                    } else {
                        sh 'docker-compose -f docker-compose.dev.yml up -d'
                    }
                }
            }
        }
    }
}
```

### Setup Automated Testing

1. **Backend Tests:**

```groovy
stage('Test Backend') {
    steps {
        dir('backend') {
            sh 'npm install'
            sh 'npm test'
        }
    }
}
```

2. **Frontend Tests:**

```groovy
stage('Test Frontend') {
    steps {
        dir('frontend') {
            sh 'npm install'
            sh 'npm test'
        }
    }
}
```

### Setup Notifications

Tambahkan di Jenkinsfile untuk notifikasi:

```groovy
post {
    success {
        echo 'Pipeline succeeded!'
        // Kirim notifikasi (Slack, Email, etc)
    }
    
    failure {
        echo 'Pipeline failed!'
        // Kirim alert
    }
}
```

---

## 🔐 PART 5: Security Best Practices

### 1. Environment Variables

**JANGAN commit `.env` ke Git!**

```powershell
# Pastikan .env ada di .gitignore
echo ".env" >> .gitignore

# Gunakan Jenkins Credentials
```

Di Jenkinsfile:

```groovy
environment {
    JWT_SECRET = credentials('jwt-secret-id')
    DATABASE_URL = credentials('database-url-id')
}
```

### 2. Docker Security

```powershell
# Scan image untuk vulnerabilities
docker scan travelnest-backend:latest
docker scan travelnest-frontend:latest

# Use non-root user di Dockerfile
USER node
```

### 3. Network Security

```yaml
# Di docker-compose.yml
networks:
  app-network:
    driver: bridge
    
services:
  backend:
    networks:
      - app-network
  frontend:
    networks:
      - app-network
```

---

## 📝 PART 6: Deployment Checklist

### Pre-Deployment:

- [ ] ✅ Environment variables sudah di-set
- [ ] ✅ Database migration sudah dijalankan
- [ ] ✅ Build berhasil tanpa error
- [ ] ✅ Tests passing (jika ada)
- [ ] ✅ Docker images ter-build dengan baik
- [ ] ✅ Backup data penting

### Post-Deployment:

- [ ] ✅ Containers running (docker ps)
- [ ] ✅ Backend API responding (test endpoints)
- [ ] ✅ Frontend loading (buka di browser)
- [ ] ✅ Database connected
- [ ] ✅ Logs tidak ada error critical
- [ ] ✅ Monitor resource usage

### Rollback Plan:

```powershell
# Jika deployment gagal, rollback ke versi sebelumnya

# Stop current containers
docker-compose down

# Pull previous image version
docker pull travelnest-backend:previous-tag
docker pull travelnest-frontend:previous-tag

# Start dengan image lama
docker-compose up -d
```

---

## 🎯 PART 7: Quick Commands Reference

### Docker Commands

```powershell
# Build & Run
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose restart                  # Restart all services
docker-compose logs -f                  # View logs

# Individual containers
docker start travelnest-backend         # Start container
docker stop travelnest-backend          # Stop container
docker restart travelnest-backend       # Restart container
docker logs travelnest-backend -f       # View logs

# Cleanup
docker system prune -a                  # Remove unused data
docker volume prune                     # Remove unused volumes
docker image prune -a                   # Remove unused images

# Troubleshooting
docker exec -it travelnest-backend sh   # Enter container
docker inspect travelnest-backend       # Inspect container
docker stats                            # Monitor resources
```

### Jenkins Commands

```powershell
# Windows Service
net start jenkins                       # Start Jenkins
net stop jenkins                        # Stop Jenkins
net restart jenkins                     # Restart Jenkins

# Docker
docker start jenkins                    # Start Jenkins container
docker stop jenkins                     # Stop Jenkins container
docker logs jenkins -f                  # View logs
```

---

## 🌐 PART 8: Deploy ke Cloud (Bonus)

### Deploy ke VPS/Cloud Server

1. **Persiapan Server:**

```bash
# SSH ke server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone Project:**

```bash
git clone https://github.com/your-username/travelnest.git
cd travelnest
```

3. **Setup Environment:**

```bash
nano .env
# Isi dengan environment variables
```

4. **Deploy:**

```bash
docker-compose up -d
```

5. **Setup Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/travelnest
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Setup SSL dengan Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📚 Resources & Documentation

- 📖 [Docker Documentation](https://docs.docker.com/)
- 📖 [Docker Compose Documentation](https://docs.docker.com/compose/)
- 📖 [Jenkins Documentation](https://www.jenkins.io/doc/)
- 📖 [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

---

## 💡 Tips & Best Practices

1. **Selalu gunakan .dockerignore**
   ```
   node_modules
   npm-debug.log
   .env
   .git
   ```

2. **Tag Docker images dengan version**
   ```powershell
   docker build -t travelnest-backend:v1.0.0 .
   docker build -t travelnest-backend:latest .
   ```

3. **Monitor logs secara regular**
   ```powershell
   docker-compose logs -f --tail=100
   ```

4. **Backup database secara berkala**
   ```powershell
   docker exec travelnest-backend tar -czf /backup/db-backup-$(date +%Y%m%d).tar.gz /app/database
   ```

5. **Test di environment staging sebelum production**

---

## ❓ FAQ

**Q: Bagaimana cara update aplikasi tanpa downtime?**
A: Gunakan blue-green deployment atau rolling updates dengan Docker Swarm/Kubernetes.

**Q: Bagaimana cara scale aplikasi?**
A: Gunakan `docker-compose scale` atau orchestration tools seperti Kubernetes.

**Q: Bagaimana cara backup data?**
A: Backup Docker volumes atau database files secara berkala.

**Q: Bagaimana cara monitoring production?**
A: Gunakan tools seperti Prometheus, Grafana, atau Docker Stats.

---

**Selamat! Anda telah menyelesaikan hands-on deployment Docker dan CI/CD! 🎉**

Untuk pertanyaan atau issues, silakan buka issue di repository atau hubungi tim development.
