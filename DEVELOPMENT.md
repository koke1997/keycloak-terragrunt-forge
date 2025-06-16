# Development Setup

This guide explains how to set up the project for local development with live code reloading.

## Prerequisites

- Docker and Docker Compose
- VS Code with Java Extension Pack
- Node.js 18+ (for local frontend development)
- Maven 3.6+ (for local backend development)

## Development Environment

### Option 1: Full Docker Development (Recommended)

This setup uses Docker containers with volume mounts for live code synchronization.

1. **Start the development environment:**
   ```bash
   # Using VS Code task (Ctrl+Shift+P -> "Tasks: Run Task" -> "Start Development Environment")
   # Or manually:
   docker compose -f docker-compose.dev.yml up -d
   ```

2. **Services available:**
   - Frontend (Vite dev server): http://localhost:3000
   - Backend (Spring Boot): http://localhost:8080
   - Keycloak: http://localhost:8090
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379
   - Nginx (production build): http://localhost:80

3. **View logs:**
   ```bash
   # Backend logs
   docker compose -f docker-compose.dev.yml logs -f backend
   
   # Frontend logs  
   docker compose -f docker-compose.dev.yml logs -f frontend-dev
   
   # All logs
   docker compose -f docker-compose.dev.yml logs -f
   ```

4. **Stop the environment:**
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

### Option 2: Hybrid Development

Run infrastructure in Docker and code locally for better debugging.

1. **Start infrastructure only:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d postgres redis keycloak
   ```

2. **Run backend locally:**
   ```bash
   cd backend-java
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Run frontend locally:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## VS Code Integration

### Available Tasks (Ctrl+Shift+P -> "Tasks: Run Task")

- **Start Development Environment** - Starts all Docker services
- **Stop Development Environment** - Stops all Docker services  
- **Rebuild Development Environment** - Rebuilds and starts services
- **View Backend Logs** - Shows backend container logs
- **View Frontend Logs** - Shows frontend container logs
- **Build Java Backend** - Compiles Java code
- **Install Frontend Dependencies** - Runs npm install
- **Start Frontend Dev Server** - Starts Vite dev server locally

### Debug Configurations

- **Debug Java Backend** - Attach debugger to Java process
- **Debug Frontend (Vite)** - Debug frontend with Chrome DevTools
- **Debug Full Stack** - Debug both frontend and backend simultaneously

## File Synchronization

The development setup uses Docker volumes to sync your local files with containers:

### Backend (Java)
- `./backend-java` ↔ `/app` (container)
- `maven_cache_dev` volume for Maven dependencies
- Live reload via Spring Boot DevTools

### Frontend (React/TypeScript)
- `./frontend` ↔ `/app` (container)
- `node_modules_dev` volume for npm dependencies
- Live reload via Vite HMR

## Development Workflow

1. **Make code changes** in your local editor
2. **Changes are automatically synced** to containers
3. **Services auto-reload:**
   - Backend: Spring Boot DevTools detects changes and restarts
   - Frontend: Vite HMR updates browser instantly
4. **No container rebuilds needed** for code changes
5. **Use VS Code debugger** for breakpoints and debugging

## Environment Variables

Development environment variables are set in `docker-compose.dev.yml`. Key variables:

```yaml
# Backend
SPRING_PROFILES_ACTIVE: docker
DATABASE_URL: jdbc:postgresql://postgres:5432/keycloak_forge
KEYCLOAK_URL: http://keycloak:8080

# Frontend  
VITE_API_BASE_URL: http://localhost:8080
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose -f docker-compose.dev.yml logs backend

# Rebuild if needed
docker compose -f docker-compose.dev.yml up -d --build backend
```

### Frontend compilation errors
```bash
# Check logs
docker compose -f docker-compose.dev.yml logs frontend-dev

# Reinstall dependencies
docker compose -f docker-compose.dev.yml exec frontend-dev npm install
```

### Database connection issues
```bash
# Check PostgreSQL
docker compose -f docker-compose.dev.yml logs postgres

# Reset database
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.dev.yml`:

```yaml
services:
  backend:
    ports:
      - "8081:8080"  # Change host port
  frontend-dev:
    ports:
      - "3001:5173"  # Change host port
```

## API Testing

With the development environment running:

1. **Test backend health:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Test conversion API:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/convert \
     -H "Content-Type: application/json" \
     -d '{"realm": {"realm": "test"}, "options": {}}'
   ```

3. **Access frontend:** http://localhost:3000

## Production Testing

To test the production build:

```bash
# Build frontend
cd frontend && npm run build

# Start with nginx
docker compose -f docker-compose.dev.yml up -d nginx

# Access: http://localhost:80
```