# TravelNest CI/CD Architecture

## Overview

TravelNest menggunakan Jenkins untuk CI/CD pipeline yang terintegrasi dengan Docker dan Git.

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │ push/webhook
       │
       ▼
┌─────────────┐
│   Jenkins   │
│   Server    │
└──────┬──────┘
       │
       ├─────────► Checkout Code
       │
       ├─────────► Install Dependencies
       │
       ├─────────► Run Tests
       │
       ├─────────► Build Docker Images
       │
       ├─────────► Security Scan
       │
       ├─────────► Push to Registry
       │
       └─────────► Deploy
                   │
                   ├─► Staging (auto)
                   │
                   └─► Production (manual)
```

## Pipeline Stages

### 1. Checkout
- Clone repository dari Git
- Checkout specific branch (main, develop, feature/*)

### 2. Environment Setup
- Verify Node.js, npm, Docker versions
- Setup environment variables

### 3. Install Dependencies
- **Backend**: `npm ci` in backend directory
- **Frontend**: `npm ci` in frontend directory
- Parallel execution untuk efisiensi

### 4. Run Tests
- **Backend Tests**: Unit tests, Integration tests
- **Frontend Tests**: Component tests, E2E tests
- Parallel execution

### 5. Code Quality
- ESLint for JavaScript/React
- Code coverage reports
- Static analysis

### 6. Build Docker Images
- **Backend Image**: Multi-stage build
  - Base: node:20-alpine
  - Install production dependencies only
  - Copy application code
  - Setup uploads directory
  
- **Frontend Image**: Multi-stage build
  - Build stage: compile React app
  - Production stage: nginx serving static files

### 7. Security Scan
- Vulnerability scanning dengan Trivy/Snyk
- Dependency audit
- Docker image scanning

### 8. Push to Registry
- Tag images: `latest`, `build-number`, `git-hash`
- Push to Docker Hub/Private Registry
- Requires `DOCKER_CREDENTIALS_ID`

### 9. Deploy
- **Staging** (branch: develop)
  - Auto-deploy tanpa approval
  - Environment: staging
  
- **Production** (branch: main)
  - Manual approval required
  - Environment: production
  - Blue-green deployment strategy

### 10. Smoke Tests
- Health check endpoints
- API availability tests
- Basic functionality tests

## Environment Variables

### Jenkins Configuration

Required in Jenkins → Configure System → Global Properties:

```
DOCKER_USERNAME=your_dockerhub_username
JWT_SECRET=your_jwt_secret_key
```

### Docker Registry Credentials

1. Jenkins → Credentials → Global → Add Credentials
2. ID: `dockerhub-credentials`
3. Username: Docker Hub username
4. Password: Docker Hub password/token

## Branch Strategy

```
main (production)
  │
  ├─── develop (staging)
  │     │
  │     ├─── feature/user-auth
  │     ├─── feature/chat-system
  │     └─── bugfix/login-issue
  │
  └─── hotfix/security-patch
```

### Branch Rules

1. **main**
   - Protected branch
   - Requires Pull Request
   - Requires review approval
   - Triggers production deployment (manual)

2. **develop**
   - Integration branch
   - Auto-deploy to staging
   - Feature branches merge here

3. **feature/***
   - Branch from develop
   - Name: `feature/descriptive-name`
   - Merge to develop via PR

4. **bugfix/***
   - Bug fixes branch
   - Branch from develop or main
   - Merge to develop via PR

5. **hotfix/***
   - Emergency fixes
   - Branch from main
   - Merge to main AND develop

## Deployment Strategies

### Staging Deployment (Auto)

```groovy
stage('Deploy to Staging') {
    when {
        branch 'develop'
    }
    steps {
        sh '''
            docker-compose down
            docker-compose pull
            docker-compose up -d
        '''
    }
}
```

### Production Deployment (Manual Approval)

```groovy
stage('Deploy to Production') {
    when {
        branch 'main'
    }
    steps {
        input message: 'Deploy to production?', ok: 'Deploy'
        sh '''
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
        '''
    }
}
```

## Notifications

### Success
- Slack notification
- Email notification
- GitHub commit status

### Failure
- Slack alert dengan error details
- Email alert ke team
- GitHub commit status: failed

## Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost:80
```

### Logs

```bash
# View all logs
docker-compose logs -f

# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend
```

### Metrics

- Build duration
- Test coverage
- Deployment frequency
- Mean time to recovery (MTTR)

## Security

### Secrets Management

- Environment variables via Jenkins credentials
- `.env` files not committed to Git
- Secrets stored in Jenkins Credentials Store
- Use HashiCorp Vault for production (recommended)

### Docker Security

- Use official base images
- Multi-stage builds to reduce attack surface
- Run as non-root user
- Regular vulnerability scanning
- Image signing

### Network Security

- Services isolated in Docker network
- Expose only necessary ports
- Use HTTPS in production
- Implement rate limiting

## Rollback Strategy

### Manual Rollback

```bash
# List images
docker images | grep travelnest

# Deploy previous version
docker-compose down
docker tag travelnest-backend:123 travelnest-backend:latest
docker tag travelnest-frontend:123 travelnest-frontend:latest
docker-compose up -d
```

### Automated Rollback

```groovy
post {
    failure {
        script {
            // Rollback to previous version
            sh 'docker-compose down'
            sh 'docker pull travelnest-backend:previous'
            sh 'docker pull travelnest-frontend:previous'
            sh 'docker-compose up -d'
        }
    }
}
```

## Best Practices

1. **Keep pipeline fast**
   - Parallel execution where possible
   - Cache dependencies
   - Optimize Docker layer caching

2. **Fail fast**
   - Run quick tests first
   - Stop on first failure
   - Clear error messages

3. **Idempotent deployments**
   - Can run multiple times safely
   - Handle existing resources
   - Clean state on failure

4. **Version everything**
   - Docker images
   - Dependencies
   - Configuration

5. **Automated testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Security scans

6. **Monitoring & Alerting**
   - Log aggregation
   - Metrics collection
   - Alert on failures
   - Dashboard visibility

## Troubleshooting

### Common Issues

1. **Docker build fails**
   - Check Dockerfile syntax
   - Verify base image availability
   - Check disk space

2. **Tests fail**
   - Check test logs
   - Verify test environment
   - Check dependencies

3. **Deployment fails**
   - Check service logs
   - Verify environment variables
   - Check port availability
   - Verify network connectivity

4. **Jenkins pipeline hangs**
   - Check agent availability
   - Verify resource limits
   - Check network connectivity

### Debug Commands

```bash
# Check Jenkins logs
docker logs jenkins

# Check Docker service
systemctl status docker

# Test Docker connection
docker run hello-world

# Validate Jenkinsfile
jenkins-lint Jenkinsfile

# Test docker-compose
docker-compose config
```

## Future Improvements

- [ ] Implement blue-green deployment
- [ ] Add canary deployment option
- [ ] Kubernetes orchestration
- [ ] ArgoCD for GitOps
- [ ] Enhanced monitoring with Prometheus/Grafana
- [ ] Automated performance testing
- [ ] Infrastructure as Code (Terraform)
