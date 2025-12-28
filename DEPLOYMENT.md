# TravelNest - Quick Start Guide

## 🚀 Deploy dengan Docker (Recommended)

### Step 1: Setup Environment Variables

```bash
# Copy dan edit file .env
cp .env.example .env
nano .env
```

Edit nilai berikut:
- `JWT_SECRET`: Ganti dengan secret key yang kuat
- `DOCKER_USERNAME`: Username Docker Hub Anda (jika ingin push ke registry)

### Step 2: Build dan Run

```bash
# Build dan start semua services
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 3: Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Step 4: Stop Services

```bash
# Stop containers
docker-compose down

# Stop dan hapus volumes (reset database)
docker-compose down -v
```

---

## 🔧 Development Setup (Without Docker)

### Prerequisites
- Node.js 20+
- npm atau yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed

# Start dev server
npm run dev
```

Backend: http://localhost:3000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: http://localhost:5173

---

## 🔄 Jenkins CI/CD Setup

### 1. Install Jenkins

**Menggunakan Docker:**

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Akses Jenkins: http://localhost:8080

### 2. Initial Jenkins Setup

```bash
# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Install Plugins

Install plugins berikut di Jenkins:
- Docker Pipeline
- Git Plugin
- NodeJS Plugin
- Pipeline Plugin
- Blue Ocean (optional, untuk UI yang lebih baik)

### 4. Configure NodeJS

1. Manage Jenkins → Global Tool Configuration
2. NodeJS → Add NodeJS
   - Name: `NodeJS 20`
   - Version: `20.x`
   - ✅ Install automatically

### 5. Add Credentials

**Docker Hub Credentials:**
1. Manage Jenkins → Credentials → Global → Add Credentials
2. Kind: Username with password
3. Username: `<your-dockerhub-username>`
4. Password: `<your-dockerhub-password>`
5. ID: `dockerhub-credentials`

**Git Credentials (jika private repo):**
1. Manage Jenkins → Credentials → Global → Add Credentials
2. Kind: Username with password atau SSH Username with private key
3. ID: `git-credentials`

### 6. Create Pipeline Job

1. New Item → Pipeline
2. Pipeline Name: `travelnest-pipeline`
3. Pipeline → Definition: **Pipeline script from SCM**
4. SCM: **Git**
5. Repository URL: `<your-git-repository-url>`
6. Credentials: pilih credentials yang sudah dibuat
7. Branch: `*/main` atau `*/develop`
8. Script Path: `Jenkinsfile`
9. Save

### 7. Configure Environment Variables

Manage Jenkins → Configure System → Global Properties:
- ☑ Environment variables
  - Name: `DOCKER_USERNAME`, Value: `<your-dockerhub-username>`
  - Name: `JWT_SECRET`, Value: `<your-jwt-secret>`

### 8. Run Pipeline

1. Klik job `travelnest-pipeline`
2. Klik "Build Now"
3. Lihat progress di Console Output

### 9. Webhook Setup (Auto-trigger)

**GitHub:**
1. Repository → Settings → Webhooks → Add webhook
2. Payload URL: `http://<jenkins-url>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: `Just the push event`

**GitLab:**
1. Repository → Settings → Webhooks
2. URL: `http://<jenkins-url>:8080/project/travelnest-pipeline`
3. Trigger: `Push events`

---

## 📊 Branch Strategy

- **`main`**: Production branch
  - Auto-deploy ke production dengan manual approval
  - Merge dari `develop` setelah testing

- **`develop`**: Staging/Development branch
  - Auto-deploy ke staging environment
  - Feature branches merge ke sini

- **`feature/*`**: Feature branches
  - Branch dari `develop`
  - Merge back ke `develop` via Pull Request

---

## 🧪 Testing Pipeline

```bash
# Create develop branch
git checkout -b develop
git push origin develop

# Create feature branch
git checkout -b feature/test-pipeline
echo "test" > test.txt
git add test.txt
git commit -m "test: trigger pipeline"
git push origin feature/test-pipeline

# Merge to develop (trigger staging deployment)
git checkout develop
git merge feature/test-pipeline
git push origin develop

# Merge to main (trigger production deployment)
git checkout main
git merge develop
git push origin main
```

---

## 🔍 Troubleshooting

### Docker Issues

**Port sudah digunakan:**
```bash
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :80
lsof -i :3000
kill -9 <PID>
```

**Docker build error:**
```bash
# Clear Docker cache
docker system prune -a -f

# Rebuild tanpa cache
docker-compose build --no-cache
```

### Jenkins Issues

**Jenkins can't access Docker:**
```bash
# Give Jenkins user permission
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Pipeline fails at Docker build:**
- Pastikan Docker daemon running
- Check Docker Hub credentials
- Verify Dockerfile syntax

### Database Issues

```bash
cd backend

# Reset database
npm run reset

# Run migrations
npm run migrate

# Seed data
npm run seed
```

---

## 📝 Useful Commands

### Docker Commands

```bash
# View all containers
docker ps -a

# View logs
docker logs <container-id>
docker-compose logs -f backend
docker-compose logs -f frontend

# Access container shell
docker exec -it travelnest-backend sh
docker exec -it travelnest-frontend sh

# Remove all containers
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build backend
```

### Git Commands

```bash
# Check status
git status

# View branches
git branch -a

# Switch branch
git checkout develop

# Create and switch to new branch
git checkout -b feature/new-feature

# Push to remote
git push origin <branch-name>

# Pull latest changes
git pull origin <branch-name>
```

### Jenkins Commands

```bash
# Restart Jenkins
docker restart jenkins

# View Jenkins logs
docker logs -f jenkins

# Backup Jenkins
docker cp jenkins:/var/jenkins_home ./jenkins_backup
```

---

## 🎯 Next Steps

1. ✅ Setup Git repository
2. ✅ Create Docker configuration
3. ✅ Setup Jenkins pipeline
4. ⬜ Push to Git repository
5. ⬜ Configure Jenkins webhook
6. ⬜ Test CI/CD pipeline
7. ⬜ Deploy to production

---

**Need Help?** Create an issue di repository atau hubungi tim development.
