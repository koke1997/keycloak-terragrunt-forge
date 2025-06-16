# 🚀 Getting Started Guide

Welcome to Keycloak Terragrunt Forge! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### **Required**
- **Node.js 18+**: [Download from nodejs.org](https://nodejs.org/)
- **Java 17+**: [Download OpenJDK](https://openjdk.org/install/)
- **Maven 3.8+**: [Installation guide](https://maven.apache.org/install.html)

### **Optional (for advanced features)**
- **Terragrunt**: [Installation guide](https://terragrunt.gruntwork.io/docs/getting-started/install/)
- **Terraform**: [Installation guide](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- **Docker**: [Installation guide](https://docs.docker.com/get-docker/)

### **Verify Installation**
```bash
node --version    # Should be 18.x or higher
java --version    # Should be 17.x or higher  
mvn --version     # Should be 3.8.x or higher
```

## 🏗️ Installation

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/your-org/keycloak-terragrunt-forge.git
cd keycloak-terragrunt-forge
```

### **Step 2: Install Frontend Dependencies**
```bash
cd frontend
npm install
cd ..
```

### **Step 3: Install Backend Dependencies**
```bash
cd backend-java
mvn clean install
cd ..
```

### **Step 4: Verify Installation**
```bash
# Run the comprehensive test
node tools/test-utilities/test-full-pipeline.mjs
```

You should see:
```
🎉 Full Pipeline Test Results:
===============================
✅ Project Structure: PASS
✅ Terragrunt Generation: PASS (2/2 realms)
✅ Module Dependencies: PASS
✅ Frontend Integration: PASS
✅ Java Backend: PASS

🏆 Overall Status: ✅ PASS
```

## 🚀 Quick Start

### **Method 1: Web Interface (Recommended)**

1. **Start the Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   
2. **Open Your Browser**
   Navigate to `http://localhost:8083` (port may vary)

3. **Upload a Realm File**
   - Click "Upload realm.json file"
   - Select a sample file from `data/samples/groups-test-realm.json`
   - Click "Convert to Terragrunt"

4. **Download Generated Files**
   - Review the generated Terragrunt modules
   - Download the complete package
   - Extract to your infrastructure repository

### **Method 2: Command Line Interface**

1. **Test with Sample Realm**
   ```bash
   # Generate Terragrunt for a sample realm
   node tools/test-utilities/test-terragrunt-conversion.mjs
   ```

2. **Check Generated Output**
   ```bash
   # View generated files
   ls -la test-output/groups-test-realm/
   cat test-output/groups-test-realm/terragrunt.hcl
   ```

### **Method 3: Backend API (Advanced)**

1. **Start the Java Backend**
   ```bash
   cd backend-java
   mvn spring-boot:run
   ```

2. **Use the REST API**
   ```bash
   # Convert a realm via API
   curl -X POST http://localhost:8080/api/v1/convert \
     -H "Content-Type: application/json" \
     -d @data/samples/groups-test-realm.json
   ```

## 📊 Understanding the Output

When you convert a realm.json file, you'll get:

### **Generated Structure**
```
your-realm/
├── terragrunt.hcl              # Main realm configuration
├── groups/
│   └── terragrunt.hcl          # Groups module configuration  
├── users/
│   └── terragrunt.hcl          # Users module configuration
├── roles/
│   └── terragrunt.hcl          # Roles module configuration
└── clients/
    └── terragrunt.hcl          # Clients module configuration
```

### **Key Files Explained**

**`terragrunt.hcl`** - Main configuration file:
```hcl
# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../../modules/keycloak-realm"
}

# Realm-specific inputs
inputs = {
  realm_name = "your-realm"
  enabled = true
  display_name = "Your Realm Display Name"
  # ... other configuration
}
```

## 🎯 Your First Conversion

Let's convert a sample realm step by step:

### **Step 1: Choose a Sample Realm**
```bash
# List available sample realms
ls data/samples/
```

We recommend starting with `groups-test-realm.json` as it demonstrates all features.

### **Step 2: Analyze the Realm**
```bash
# View the realm structure
head -20 data/samples/groups-test-realm.json
```

This realm includes:
- ✅ Basic realm settings
- ✅ User groups with hierarchies
- ✅ Role mappings
- ✅ Users with group memberships
- ✅ Client configurations

### **Step 3: Convert the Realm**
Using the web interface:
1. Upload `groups-test-realm.json`
2. Select target environment: `dev`
3. Click "Convert to Terragrunt"
4. Review the generated modules

### **Step 4: Understand the Results**
The conversion will generate:
- **1 realm module** with base configuration
- **1 groups module** with 3 groups and hierarchies
- **1 users module** with user management
- **1 roles module** with role definitions
- **1 clients module** with client configurations

### **Step 5: Deploy (Optional)**
If you have Terragrunt installed:
```bash
# Copy generated files to environments/dev/keycloak/realms/groups-test-realm/
# Then deploy:
cd environments/dev/keycloak/realms/groups-test-realm/
terragrunt plan
terragrunt apply
```

## 🔧 Configuration

### **Environment-Specific Configuration**
The tool supports multiple environments. Configure them in:
- `environments/dev/` - Development environment
- `environments/staging/` - Staging environment  
- `environments/prod/` - Production environment

### **Common Configuration**
Shared settings are in `configs/terragrunt/common.hcl`:
```hcl
locals {
  # Keycloak configurations by environment
  keycloak_configs = {
    dev = {
      url = "http://localhost:8090"
      admin_username = "admin"
      admin_password = "admin"
    }
    # ... other environments
  }
}
```

## 🧪 Validation

### **Test Your Conversion**
```bash
# Test the conversion quality
node tools/test-utilities/test-full-pipeline.mjs
```

### **Validate Terragrunt Syntax**
```bash
# If you have Terragrunt installed
cd environments/dev/keycloak/realms/your-realm/
terragrunt validate
```

## ❓ Troubleshooting

### **Common Issues**

**Port Already in Use**
```bash
# If port 8083 is busy, Vite will automatically try the next available port
npm run dev
# Look for: "Local: http://localhost:XXXX/"
```

**Java Version Issues**
```bash
# Check Java version
java --version
# Should be 17 or higher. If not, install OpenJDK 17+
```

**Maven Build Failures**
```bash
# Clean and rebuild
cd backend-java
mvn clean install -U
```

**Missing Dependencies**
```bash
# Reinstall Node.js dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **Getting Help**

If you encounter issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [API Documentation](../api/rest-api.md)
3. Open an issue on [GitHub Issues](https://github.com/your-org/keycloak-terragrunt-forge/issues)

## ✅ Next Steps

Now that you have the tool running:

1. **Explore Features**: Try converting different realm configurations
2. **Learn Architecture**: Read the [Architecture Overview](../developer/architecture.md)
3. **Deploy to Cloud**: Follow the [Deployment Guide](../operations/deployment.md)
4. **Contribute**: See the [Contributing Guide](../developer/contributing.md)

## 🎉 Congratulations!

You've successfully set up Keycloak Terragrunt Forge. You can now:
- ✅ Convert Keycloak realm.json files to DRY Terragrunt modules
- ✅ Support multiple environments and realms
- ✅ Validate 100% fidelity with round-trip testing
- ✅ Deploy enterprise-grade infrastructure as code

Happy converting! 🚀