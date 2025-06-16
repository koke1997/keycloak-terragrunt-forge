#!/bin/bash

# Quick Start - Simplified version with minimal services

echo "🚀 Quick Start - Keycloak Terragrunt Forge"
echo "=========================================="

# Start with simple configuration
echo "📦 Starting essential services only..."
docker-compose -f docker-compose.simple.yml up --build -d

echo ""
echo "⏳ Waiting for services..."

# Simple wait
sleep 30

echo ""
echo "🎉 Quick start complete!"
echo ""
echo "📋 Available services:"
echo "   🎨 Frontend:        http://localhost:3000"
echo "   🔧 Backend API:     http://localhost:8080"
echo "   🔐 Keycloak:        http://localhost:8090"
echo "   📊 Database:        localhost:5432"
echo ""
echo "🧪 Quick test:"
echo "   1. Open http://localhost:3000"
echo "   2. Upload data/samples/groups-test-realm.json"
echo "   3. Convert and download!"
echo ""
echo "⚠️  Note: Services may take 2-3 minutes to fully start"
echo "   Check status: docker-compose -f docker-compose.simple.yml ps"