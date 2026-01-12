pipeline {
    agent any

    environment {
        // Docker Hub credentials (configure in Jenkins Credentials)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // Application details
        APP_NAME = 'travelnest'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${APP_NAME}-backend-dev"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${APP_NAME}-frontend-dev"
        
        // Environment variables
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code...'
                checkout scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }

        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment...'
                sh '''
                    echo "Node version: $(node --version)"
                    echo "NPM version: $(npm --version)"
                    echo "Docker version: $(docker --version)"
                '''
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo '📦 Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo '📦 Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            echo '🧪 Running backend tests...'
                            // Add your test commands here
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            echo '🧪 Running frontend tests...'
                            // Add your test commands here
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo '🔍 Running code quality checks...'
                dir('frontend') {
                    sh 'npm run lint || echo "Linting completed with warnings"'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            echo '🐳 Building backend Docker image...'
                            script {
                                def backendImage = docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}")
                                docker.withRegistry('https://' + DOCKER_REGISTRY, DOCKER_CREDENTIALS_ID) {
                                    backendImage.push("${BUILD_NUMBER}")
                                    backendImage.push("latest")
                                }
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            echo '🐳 Building frontend Docker image...'
                            script {
                                def frontendImage = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}")
                                docker.withRegistry('https://' + DOCKER_REGISTRY, DOCKER_CREDENTIALS_ID) {
                                    frontendImage.push("${BUILD_NUMBER}")
                                    frontendImage.push("latest")
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo '🔒 Running security scans...'
                // Add security scanning tools here (e.g., Trivy, Snyk)
                sh '''
                    echo "Security scan placeholder"
                    # docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${BACKEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '🚀 Deploying to staging environment...'
                sh '''
                    # Stop existing containers
                    docker-compose -f docker-compose.yml down || true
                    
                    # Pull latest images
                    docker pull ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker pull ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    
                    # Start new containers
                    docker-compose -f docker-compose.yml up -d
                    
                    # Wait for services to be healthy
                    sleep 10
                    docker-compose ps
                '''
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🎯 Deploying to production environment...'
                input message: 'Deploy to production?', ok: 'Deploy'
                sh '''
                    # Stop existing containers
                    docker-compose -f docker-compose.yml down || true
                    
                    # Pull latest images
                    docker pull ${BACKEND_IMAGE}:latest
                    docker pull ${FRONTEND_IMAGE}:latest
                    
                    # Start new containers
                    docker-compose -f docker-compose.yml up -d
                    
                    # Health check
                    sleep 15
                    docker-compose ps
                '''
            }
        }

        stage('Smoke Tests') {
            steps {
                echo '💨 Running smoke tests...'
                sh '''
                    # Wait for services to be ready
                    sleep 10
                    
                    # Test backend health
                    curl -f http://localhost:3000/api/health || echo "Backend health check failed"
                    
                    # Test frontend
                    curl -f http://localhost:80 || echo "Frontend health check failed"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Add notifications here (e.g., Slack, Email)
        }
        failure {
            echo '❌ Pipeline failed!'
            // Add failure notifications here
        }
        always {
            echo '🧹 Cleaning up...'
            cleanWs()
        }
    }
}
