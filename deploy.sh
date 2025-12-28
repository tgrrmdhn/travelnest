#!/bin/bash

# TravelNest Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 TravelNest Deployment Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker Compose is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_info "Please edit .env file with your configuration"
    exit 1
fi

print_success ".env file exists"

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down

# Pull latest images (if using registry)
# print_info "Pulling latest images..."
# docker-compose pull

# Build images
print_info "Building Docker images..."
docker-compose build

# Start containers
print_info "Starting containers..."
docker-compose up -d

# Wait for services to be healthy
print_info "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_success "Services are running!"
    
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend:  http://localhost:3000"
    echo "   Health:   http://localhost:3000/health"
    
    echo ""
    echo "📋 View logs:"
    echo "   docker-compose logs -f"
    
else
    print_error "Failed to start services"
    echo ""
    echo "📋 Check logs:"
    docker-compose logs
    exit 1
fi

print_success "Deployment completed!"
