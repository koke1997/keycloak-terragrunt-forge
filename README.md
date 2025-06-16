# 🔐 Keycloak Terragrunt Forge

> **Enterprise-grade Keycloak to Terragrunt/Terraform conversion tool with DRY architecture and 100% fidelity validation**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](.)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](.)
[![Provider](https://img.shields.io/badge/keycloak_provider-v5.2.0-blue)](https://registry.terraform.io/providers/keycloak/keycloak/latest)
[![Architecture](https://img.shields.io/badge/architecture-DRY_SOLID-orange)](.)

## 🎯 **What is Keycloak Terragrunt Forge?**

Keycloak Terragrunt Forge is a comprehensive tool that converts Keycloak realm.json configurations into **DRY (Don't Repeat Yourself)** Terragrunt modules, following **SOLID principles** for enterprise-scale infrastructure management.

### **Key Features:**
- ✅ **100% Fidelity**: Round-trip validation ensures deployed infrastructure matches original realm.json
- ✅ **DRY Architecture**: Reusable Terragrunt modules eliminate code duplication
- ✅ **Multi-Realm Support**: Handle unlimited realms across multiple environments
- ✅ **Enterprise Backend**: Java Spring Boot + Go for performance and reliability
- ✅ **Modern Frontend**: React TypeScript with real-time conversion
- ✅ **Latest Provider**: Keycloak provider v5.2.0 with official support

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Java 17+ (for backend)
- Maven 3.8+ (for backend)
- Go 1.21+ (optional, for Terraform operations)
- Terragrunt (optional, for deployment)

### **Installation**
```bash
git clone https://github.com/your-org/keycloak-terragrunt-forge.git
cd keycloak-terragrunt-forge

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies  
cd ../backend-java && mvn clean install

# Start the application
npm run dev
```

### **Basic Usage**
1. **Upload realm.json**: Use the web interface to upload your Keycloak realm configuration
2. **Generate Terragrunt**: Get DRY modules for your target environment
3. **Deploy**: Use Terragrunt to deploy to your infrastructure
4. **Validate**: Verify 100% fidelity with round-trip validation

## 📁 **Project Structure**

```
keycloak-terragrunt-forge/
├── 📱 frontend/                    # React TypeScript Web App
│   ├── src/components/             # UI components
│   ├── src/utils/                  # Conversion utilities
│   └── package.json
│
├── ☕ backend-java/               # Spring Boot API
│   ├── src/main/java/             # Java source code
│   │   └── com/keycloak/forge/    # Main package
│   ├── src/test/java/             # Java tests
│   └── pom.xml                    # Maven configuration
│
├── 🏗️ modules/                   # Reusable Terragrunt Modules
│   ├── keycloak-realm/            # Base realm module
│   ├── keycloak-groups/           # Groups management
│   ├── keycloak-users/            # User management
│   ├── keycloak-roles/            # Role management
│   └── keycloak-clients/          # Client management
│
├── 🌍 environments/               # Environment Configurations
│   ├── dev/                       # Development environment
│   ├── staging/                   # Staging environment
│   └── prod/                      # Production environment
│
├── 📊 data/                       # Test Data & Samples
│   ├── samples/                   # Sample realm.json files
│   └── generated/                 # Generated test realms
│
├── 📁 configs/                    # Shared Configurations
│   ├── terragrunt/               # Common Terragrunt config
│   └── terraform/                # Terraform configurations
│
├── 🧪 tests/                     # Test Suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── 🔧 tools/                     # Development Tools
│   ├── scripts/                  # Automation scripts
│   ├── test-utilities/           # Testing utilities
│   └── documentation/            # Documentation files
│
└── 📦 archived/                  # Legacy Code Archive
    ├── old-terraform/            # Previous Terraform structure
    └── old-terraform-output/     # Legacy outputs
```

## 🔄 **How It Works**

### **1. Conversion Pipeline**
```
Keycloak realm.json → Analysis → DRY Modules → Terragrunt → Deployment
```

### **2. DRY Architecture Benefits**
- **Single Source of Truth**: One module definition for all environments
- **Zero Duplication**: Reuse modules across multiple realms
- **Environment Isolation**: Separate dev/staging/prod configurations
- **Dependency Management**: Automatic resolution of module dependencies

### **3. Round-Trip Validation**
```
Original realm.json → Deploy to Keycloak → Export → Compare → 100% Fidelity
```

## 📚 **Documentation**

### **User Guides**
- [Getting Started Guide](./docs/user-guide/getting-started.md)
- [Realm Configuration](./docs/user-guide/realm-configuration.md)
- [Multi-Environment Setup](./docs/user-guide/multi-environment.md)
- [Troubleshooting](./docs/user-guide/troubleshooting.md)

### **Developer Documentation**
- [Architecture Overview](./docs/developer/architecture.md)
- [API Reference](./docs/developer/api-reference.md)
- [Contributing Guide](./docs/developer/contributing.md)
- [Testing Guide](./docs/developer/testing.md)

### **Operations**
- [Deployment Guide](./docs/operations/deployment.md)
- [Monitoring & Alerts](./docs/operations/monitoring.md)
- [Backup & Recovery](./docs/operations/backup.md)
- [Security Guidelines](./docs/operations/security.md)

## 🧪 **Testing**

### **Run All Tests**
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend-java && mvn test

# Integration tests
npm run test:integration

# Full pipeline test
node tools/test-utilities/test-full-pipeline.mjs
```

### **Test Coverage**
- **Frontend**: Unit and integration tests with Vitest
- **Backend**: JUnit tests with Testcontainers for Keycloak
- **End-to-End**: Full pipeline validation with real Keycloak instances
- **Performance**: Load testing with enterprise-scale configurations

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8090
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Backend Configuration
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8080
```

### **Terragrunt Configuration**
See [configs/terragrunt/common.hcl](./configs/terragrunt/common.hcl) for shared configuration.

## 🚢 **Deployment**

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access application
open http://localhost:3000
```

### **Production Deployment**
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend-java && mvn clean package

# Deploy with your preferred method (K8s, ECS, etc.)
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./docs/developer/contributing.md) for details.

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/your-org/keycloak-terragrunt-forge.git

# Install dependencies
cd frontend && npm install
cd ../backend-java && mvn clean install

# Start development servers
npm run dev:all
```

## 📋 **Roadmap**

### **Current Version (v1.0)**
- ✅ DRY Terragrunt modules
- ✅ Multi-realm support
- ✅ Round-trip validation
- ✅ Java backend with Spring Boot

### **Upcoming (v1.1)**
- 🔄 Go backend for Terraform operations
- 🔄 Advanced identity provider support
- 🔄 Authentication flow conversion
- 🔄 Protocol mapper handling

### **Future (v2.0)**
- 📋 GraphQL API
- 📋 Real-time collaboration
- 📋 Advanced analytics
- 📋 Cloud-native deployment

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [Full documentation](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/keycloak-terragrunt-forge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/keycloak-terragrunt-forge/discussions)
- **Email**: support@your-org.com

## 🏆 **Credits**

Built with ❤️ by the Keycloak Terragrunt Forge team.

### **Key Technologies**
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Spring Boot, Java 17, Maven
- **Infrastructure**: Terraform, Terragrunt, Keycloak
- **Testing**: JUnit, Vitest, Testcontainers
- **DevOps**: Docker, GitHub Actions

---

**[⭐ Star this repository](https://github.com/your-org/keycloak-terragrunt-forge) if you find it useful!**