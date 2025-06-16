#!/bin/bash

# Keycloak Terragrunt Forge - Quick Start Script
# This script starts all services and provides helpful information

set -e

echo "🚀 Starting Keycloak Terragrunt Forge"
echo "====================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Building and starting all services..."
echo "   This may take 5-10 minutes on first run (downloading dependencies)"
echo ""

# Try simple version first, fallback to full version
if docker-compose -f docker-compose.simple.yml config > /dev/null 2>&1; then
    echo "   Using simplified Docker Compose configuration..."
    docker-compose -f docker-compose.simple.yml up --build -d
else
    echo "   Using full Docker Compose configuration..."
    docker-compose up --build -d
fi

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for backend to be healthy
echo "   Waiting for backend..."
timeout 300 bash -c '
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080/api/v1/health)" != "200" ]]; do 
    sleep 5
    echo -n "."
done'

echo ""
echo "   Waiting for Keycloak..."
timeout 300 bash -c '
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8090/health/ready)" != "200" ]]; do 
    sleep 5
    echo -n "."
done'

echo ""
echo "   Waiting for frontend..."
timeout 60 bash -c '
while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:3000)" != "200" ]]; do 
    sleep 2
    echo -n "."
done'

echo ""
echo "🎉 All services are ready!"
echo ""
echo "📋 Service URLs:"
echo "   🎨 Frontend:        http://localhost:3000"
echo "   🔧 Backend API:     http://localhost:8080"
echo "   🔐 Keycloak:        http://localhost:8090"
echo "   📊 Database:        localhost:5432"
echo "   🚀 Redis Cache:     localhost:6379"
echo ""
echo "👤 Default Credentials:"
echo "   Keycloak Admin:     admin / admin"
echo "   Database:           forge_user / forge_password"
echo ""
echo "🧪 Quick Test:"
echo "   1. Open http://localhost:3000"
echo "   2. Upload: data/samples/groups-test-realm.json"
echo "   3. Click 'Convert to Terragrunt'"
echo "   4. Download your DRY modules!"
echo ""
echo "📚 Documentation:"
echo "   Getting Started:    ./GETTING_STARTED.md"
echo "   Full Docs:          ./docs/"
echo ""
echo "🔍 Troubleshooting:"
echo "   View logs:          docker-compose logs [service]"
echo "   Restart:            docker-compose restart"
echo "   Stop all:           docker-compose down"
echo ""

# Test the conversion
echo "🧪 Running quick validation test..."
if curl -s http://localhost:8080/api/v1/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend health check failed"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding" 
else
    echo "⚠️  Frontend health check failed"
fi

echo ""
echo "🚀 Keycloak Terragrunt Forge is ready!"
echo "   Open http://localhost:3000 to get started"