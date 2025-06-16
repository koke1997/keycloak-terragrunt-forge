# 🚀 Getting Started - Keycloak Terragrunt Forge

This guide will get you up and running with Keycloak Terragrunt Forge in **5 minutes** using Docker Compose for the complete setup.

## 📋 Prerequisites

### **Required**
- **Docker & Docker Compose**: [Install Docker Desktop](https://docs.docker.com/get-docker/)
- **Git**: [Install Git](https://git-scm.com/downloads)

### **Optional (for development)**
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Java 17+**: [OpenJDK](https://openjdk.org/install/)
- **Maven 3.8+**: [Install Maven](https://maven.apache.org/install.html)

### **Verify Docker Installation**
```bash
docker --version          # Should show Docker version
docker-compose --version  # Should show Docker Compose version
```

## 🐳 Quick Start with Docker Compose (Recommended)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-org/keycloak-terragrunt-forge.git
cd keycloak-terragrunt-forge
```

### **2. Choose Your Startup Method**

**Option A: Quick Start (Recommended for first time)**
```bash
./quick-start.sh
```

**Option B: Full Featured Start**
```bash
./start.sh
```

**Option C: Manual Start**
```bash
# Simple version (essential services only)
docker-compose -f docker-compose.simple.yml up --build

# Full version (with Redis, NGINX, health checks)
docker-compose up --build
```

This single command will:
- ✅ Build the frontend React application
- ✅ Build the Java Spring Boot backend
- ✅ Start PostgreSQL database
- ✅ Start Keycloak server for testing
- ✅ Start Redis cache (optional)
- ✅ Configure networking between all services

### **3. Access the Application**

Once all services are running (takes ~2-3 minutes on first run):

| Service | URL | Purpose |
|---------|-----|---------|
| **🎨 Frontend** | http://localhost:3000 | Main application interface |
| **🔧 Backend API** | http://localhost:8080 | REST API endpoints |
| **🔐 Keycloak** | http://localhost:8090 | Keycloak server (admin: admin/admin) |
| **📊 Database** | localhost:5432 | PostgreSQL database |

### **4. Test the Application**

1. **Open the Frontend**: Navigate to http://localhost:3000
2. **Upload a Sample Realm**: Use `data/samples/groups-test-realm.json`
3. **Convert to Terragrunt**: Click "Convert to Terragrunt"
4. **Download Results**: Get your DRY Terragrunt modules

## 📁 Docker Compose Configuration

The `docker-compose.yml` includes:

```yaml
services:
  # React Frontend
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    
  # Java Backend API  
  backend:
    build: ./backend-java
    ports: ["8080:8080"]
    depends_on: [postgres, keycloak]
    
  # PostgreSQL Database
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    
  # Keycloak Server (for testing)
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    ports: ["8090:8080"]
    
  # Redis Cache (optional)
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

## 🔧 Manual Development Setup (Alternative)

If you prefer to run components individually for development:

### **1. Start Dependencies**
```bash
# Start only database and Keycloak
docker-compose up postgres keycloak redis -d
```

### **2. Start Backend**
```bash
cd backend-java
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### **3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Verify Everything Works

### **Quick Test Script**
```bash
# Run the comprehensive test
node tools/test-utilities/test-full-pipeline.mjs

# Expected output:
# 🏆 Overall Status: ✅ PASS
```

### **Test API Manually**
```bash
# Check backend health
curl http://localhost:8080/api/v1/health

# Test conversion
curl -X POST http://localhost:8080/api/v1/convert \
  -H "Content-Type: application/json" \
  -d @data/samples/groups-test-realm.json
```

### **Test Frontend**
1. Open http://localhost:3000
2. Upload `data/samples/groups-test-realm.json`
3. Verify conversion works and files download

## 🛠️ Common Commands

### **Docker Compose Commands**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build

# View logs
docker-compose logs frontend
docker-compose logs backend

# Check status
docker-compose ps
```

### **Development Commands**
```bash
# Frontend development
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests

# Backend development  
cd backend-java
mvn spring-boot:run  # Start backend
mvn test             # Run tests
mvn clean install   # Build JAR
```

## 📊 Sample Data

Test with the included sample realm files:

| File | Description | Components |
|------|-------------|------------|
| `data/samples/groups-test-realm.json` | Complex realm with groups | Groups, Users, Roles, Clients |
| `data/samples/example-realm.json` | Basic realm example | Users, Roles, Clients |
| `data/samples/api-key-realm.json` | API-focused realm | Clients, Roles |

## 🔍 Troubleshooting

### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080
lsof -i :8090

# Kill the process or change ports in docker-compose.yml
```

### **Docker Build Issues**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### **Frontend Not Loading**
```bash
# Check frontend logs
docker-compose logs frontend

# Common fix: clear browser cache or try incognito mode
```

### **Backend Connection Issues**
```bash
# Check backend logs
docker-compose logs backend

# Verify database connection
docker-compose logs postgres

# Check if Keycloak is ready
curl http://localhost:8090/health
```

### **Database Issues**
```bash
# Reset database
docker-compose down -v  # Removes volumes
docker-compose up postgres -d
```

## 🎯 What You Can Do Now

### **Convert Realm Files**
1. **Upload**: Any Keycloak realm.json file
2. **Convert**: To DRY Terragrunt modules
3. **Download**: Complete infrastructure as code

### **Multi-Environment Support**
- Generate for `dev`, `staging`, or `prod` environments
- Use the same modules across all environments
- No code duplication

### **Validation**
- **Round-trip validation**: Ensures 100% fidelity
- **Syntax validation**: Validates Terragrunt syntax
- **Dependency checking**: Verifies module dependencies

## 🚀 Quick Demo

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait for services to be ready (~2 minutes)
docker-compose logs backend | grep "Started KeycloakForgeApplication"

# 3. Test conversion
curl -X POST http://localhost:8080/api/v1/convert \
  -H "Content-Type: application/json" \
  -d @data/samples/groups-test-realm.json

# 4. Open web interface
open http://localhost:3000
```

## 📝 Next Steps

After you have everything running:

1. **Read the Documentation**: Check `docs/user-guide/getting-started.md` for detailed usage
2. **Try Your Own Realms**: Upload your actual Keycloak realm.json files
3. **Deploy Infrastructure**: Use the generated Terragrunt modules in your infrastructure
4. **Explore Features**: Try round-trip validation and multi-environment support

## 💡 Pro Tips

### **Performance**
- First Docker build takes 5-10 minutes (downloads dependencies)
- Subsequent builds are much faster (cached layers)
- Keep containers running during development

### **Development Workflow**
```bash
# Best development setup:
docker-compose up postgres keycloak redis -d  # Start dependencies
cd backend-java && mvn spring-boot:run        # Start backend manually
cd frontend && npm run dev                     # Start frontend manually
```

### **Production**
```bash
# For production deployment:
docker-compose -f docker-compose.prod.yml up -d
```

## 🎉 You're Ready!

Your Keycloak Terragrunt Forge is now running and ready to convert realm.json files to DRY Terragrunt modules!

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080  
- **Keycloak**: http://localhost:8090

**Happy converting!** 🚀