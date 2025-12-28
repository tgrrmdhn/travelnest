# TravelNest - Quick Reference Card

## 🚀 Quick Deploy Commands

### Deploy dengan Docker
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh && ./deploy.sh

# Manual
docker-compose up -d
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down          # Stop
docker-compose down -v       # Stop + Remove data
```

## 📝 Common Git Commands

```bash
# Push to remote
git remote add origin <your-repo-url>
git push -u origin master

# Create develop branch
git checkout -b develop
git push -u origin develop

# Create feature branch
git checkout -b feature/my-feature
git push -u origin feature/my-feature
```

## 🐳 Docker Commands

```bash
# Build
docker-compose build
docker-compose build --no-cache

# Start/Stop
docker-compose up -d
docker-compose down

# Logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Status
docker-compose ps

# Shell access
docker exec -it travelnest-backend sh
docker exec -it travelnest-frontend sh

# Clean up
docker system prune -a
```

## 🔄 Jenkins Setup (Quick)

```bash
# 1. Run Jenkins
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 2. Get password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# 3. Access: http://localhost:8080
```

## 📊 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Jenkins | http://localhost:8080 |

## 🔐 Environment Variables

Edit `.env` file:
```env
JWT_SECRET=your_super_secret_key
DOCKER_USERNAME=your_dockerhub_username
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Lint
cd frontend
npm run lint
```

## 🏥 Health Checks

```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/
```

## 📚 Documentation

- `README.md` - Complete project docs
- `DEPLOYMENT.md` - Deployment guide
- `CICD.md` - CI/CD architecture
- `SETUP_COMPLETE.md` - Setup summary

## 🆘 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Reset Database
```bash
cd backend
npm run reset
npm run migrate
npm run seed
```

### Docker Issues
```bash
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## 🎯 Branch Strategy

- `main` → Production (manual deploy)
- `develop` → Staging (auto deploy)
- `feature/*` → Features
- `bugfix/*` → Bug fixes
- `hotfix/*` → Critical fixes

## 📞 Need Help?

1. Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. Check [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
3. View logs: `docker-compose logs -f`
4. Create issue on repository

---
**Keep this card handy for quick reference!** 📌
