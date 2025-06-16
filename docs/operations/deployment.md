# 🚀 Deployment Guide

This guide covers deploying Keycloak Terragrunt Forge in various environments from development to production.

## 🏗️ Deployment Overview

Keycloak Terragrunt Forge consists of multiple components:
- **Frontend**: React TypeScript application
- **Backend**: Java Spring Boot API
- **Database**: PostgreSQL (production) / H2 (development)
- **Cache**: Redis (optional, for performance)
- **Keycloak**: External Keycloak instance (for validation)

## 🖥️ Development Deployment

### **Local Development**
```bash
# Start frontend
cd frontend
npm run dev

# Start backend (in separate terminal)
cd backend-java
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Access application
open http://localhost:8083
```

### **Docker Development**
```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080
# - Keycloak: http://localhost:8090
```

**docker-compose.dev.yml**:
```yaml
version: '3.8'
services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
    
  backend:
    build:
      context: ./backend-java
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - KEYCLOAK_URL=http://keycloak:8080
    depends_on:
      - postgres
      - keycloak
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keycloak_forge
      POSTGRES_USER: forge_user
      POSTGRES_PASSWORD: forge_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8090:8080"
    command: start-dev
    
volumes:
  postgres_data:
```

## 🌥️ Cloud Deployment

### **Docker Production**

**docker-compose.prod.yml**:
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=${API_BASE_URL}
    restart: unless-stopped
    
  backend:
    build:
      context: ./backend-java
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - KEYCLOAK_URL=${KEYCLOAK_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### **Environment Configuration**

**.env.prod**:
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@postgres:5432/keycloak_forge
POSTGRES_DB=keycloak_forge
POSTGRES_USER=forge_user
POSTGRES_PASSWORD=secure_password_here

# Redis Configuration
REDIS_URL=redis://:password@redis:6379/0
REDIS_PASSWORD=secure_redis_password

# API Configuration
API_BASE_URL=https://api.your-domain.com
JWT_SECRET=your_jwt_secret_key_here

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.your-domain.com
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin_password

# Security
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## ☸️ Kubernetes Deployment

### **Namespace & ConfigMap**

**k8s/namespace.yaml**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: keycloak-forge
```

**k8s/configmap.yaml**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: keycloak-forge-config
  namespace: keycloak-forge
data:
  SPRING_PROFILES_ACTIVE: "prod"
  VITE_API_BASE_URL: "https://api.keycloak-forge.com"
  KEYCLOAK_URL: "https://keycloak.your-domain.com"
```

### **Database Deployment**

**k8s/postgres.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: keycloak-forge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: keycloak_forge
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: keycloak-forge
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### **Backend Deployment**

**k8s/backend.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: keycloak-forge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: keycloak-forge/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          value: "postgresql://postgres-service:5432/keycloak_forge"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        envFrom:
        - configMapRef:
            name: keycloak-forge-config
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: keycloak-forge
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### **Frontend Deployment**

**k8s/frontend.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: keycloak-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: keycloak-forge/frontend:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: keycloak-forge-config
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: keycloak-forge
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### **Ingress Configuration**

**k8s/ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: keycloak-forge-ingress
  namespace: keycloak-forge
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - keycloak-forge.com
    - api.keycloak-forge.com
    secretName: keycloak-forge-tls
  rules:
  - host: keycloak-forge.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.keycloak-forge.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
```

### **Deployment Commands**

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=username=forge_user \
  --from-literal=password=secure_password \
  -n keycloak-forge

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n keycloak-forge
kubectl get services -n keycloak-forge
kubectl get ingress -n keycloak-forge
```

## ☁️ AWS Deployment

### **ECS with Fargate**

**ecs-task-definition.json**:
```json
{
  "family": "keycloak-forge",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/keycloak-forge-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_API_BASE_URL",
          "value": "https://api.keycloak-forge.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/keycloak-forge",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "frontend"
        }
      }
    },
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/keycloak-forge-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/keycloak-forge/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/keycloak-forge",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

### **CloudFormation Template**

**cloudformation/infrastructure.yaml**:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Keycloak Terragrunt Forge Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: prod
    AllowedValues: [dev, staging, prod]

Resources:
  # VPC and Networking
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub keycloak-forge-${Environment}

  # RDS Database
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub keycloak-forge-${Environment}
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.3'
      AllocatedStorage: 20
      StorageType: gp2
      DatabaseName: keycloak_forge
      MasterUsername: forge_user
      MasterUserPassword: !Ref DatabasePassword
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      BackupRetentionPeriod: 7
      MultiAZ: !If [IsProd, true, false]
      StorageEncrypted: true

  # ElastiCache Redis
  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheNodeType: cache.t3.micro
      Engine: redis
      NumCacheNodes: 1
      VpcSecurityGroupIds:
        - !Ref RedisSecurityGroup
      CacheSubnetGroupName: !Ref RedisSubnetGroup

  # Application Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub keycloak-forge-${Environment}
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

Conditions:
  IsProd: !Equals [!Ref Environment, prod]

Outputs:
  LoadBalancerDNS:
    Description: DNS name of the load balancer
    Value: !GetAtt LoadBalancer.DNSName
    Export:
      Name: !Sub ${AWS::StackName}-LoadBalancerDNS
```

## 📊 Monitoring & Observability

### **Application Metrics**

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'keycloak-forge-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'
    
  - job_name: 'keycloak-forge-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
```

### **Grafana Dashboard**

**grafana/dashboard.json**:
```json
{
  "dashboard": {
    "title": "Keycloak Terragrunt Forge",
    "panels": [
      {
        "title": "Conversion Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(conversion_requests_total[5m])",
            "legendFormat": "{{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, conversion_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

### **Health Checks**

**health-check.sh**:
```bash
#!/bin/bash

# Check frontend
curl -f http://frontend/health || exit 1

# Check backend API
curl -f http://backend:8080/api/v1/health || exit 1

# Check database connectivity
curl -f http://backend:8080/api/v1/health/db || exit 1

echo "All services healthy"
```

## 🔒 Security Configuration

### **SSL/TLS Configuration**

**nginx.conf**:
```nginx
server {
    listen 443 ssl http2;
    server_name keycloak-forge.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
}
```

### **Environment Security**

```bash
# Use secrets management
export DATABASE_PASSWORD=$(aws ssm get-parameter --name "/keycloak-forge/db-password" --with-decryption --query "Parameter.Value" --output text)
export JWT_SECRET=$(aws ssm get-parameter --name "/keycloak-forge/jwt-secret" --with-decryption --query "Parameter.Value" --output text)

# Set proper file permissions
chmod 600 .env.prod
chown app:app .env.prod
```

## 🔧 Deployment Scripts

### **Build & Deploy Script**

**deploy.sh**:
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
VERSION=${2:-latest}

echo "🚀 Deploying Keycloak Terragrunt Forge to $ENVIRONMENT"

# Build images
echo "📦 Building Docker images..."
docker build -t keycloak-forge/frontend:$VERSION ./frontend
docker build -t keycloak-forge/backend:$VERSION ./backend-java

# Tag for registry
docker tag keycloak-forge/frontend:$VERSION $REGISTRY/keycloak-forge-frontend:$VERSION
docker tag keycloak-forge/backend:$VERSION $REGISTRY/keycloak-forge-backend:$VERSION

# Push to registry
echo "📤 Pushing to container registry..."
docker push $REGISTRY/keycloak-forge-frontend:$VERSION
docker push $REGISTRY/keycloak-forge-backend:$VERSION

# Deploy to Kubernetes
echo "🎯 Deploying to Kubernetes..."
kubectl set image deployment/frontend frontend=$REGISTRY/keycloak-forge-frontend:$VERSION -n keycloak-forge
kubectl set image deployment/backend backend=$REGISTRY/keycloak-forge-backend:$VERSION -n keycloak-forge

# Wait for rollout
kubectl rollout status deployment/frontend -n keycloak-forge
kubectl rollout status deployment/backend -n keycloak-forge

echo "✅ Deployment completed successfully!"
```

### **Rollback Script**

**rollback.sh**:
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}

echo "🔄 Rolling back Keycloak Terragrunt Forge in $ENVIRONMENT"

# Rollback deployments
kubectl rollout undo deployment/frontend -n keycloak-forge
kubectl rollout undo deployment/backend -n keycloak-forge

# Wait for rollback
kubectl rollout status deployment/frontend -n keycloak-forge
kubectl rollout status deployment/backend -n keycloak-forge

echo "✅ Rollback completed successfully!"
```

This deployment guide covers everything from local development to enterprise production deployments across multiple cloud platforms.