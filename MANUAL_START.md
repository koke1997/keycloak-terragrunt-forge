# 🚀 Manual Start Guide - No Docker Required

If Docker is taking too long or having issues, you can run the components manually.

## 🔧 Manual Setup (No Docker)

### **1. Prerequisites**
```bash
# Check you have these installed
node --version    # Should be 18+
java --version    # Should be 17+
mvn --version     # Should be 3.8+
```

### **2. Start Frontend Only (Quickest Test)**
```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Frontend will start on http://localhost:8083
```

### **3. Test Frontend with Mock Data**
1. Open http://localhost:8083
2. Upload any file from `data/samples/`
3. The frontend will convert using client-side logic
4. Download the generated Terragrunt modules

**Note**: Without the backend, you won't have round-trip validation, but the core conversion works!

### **4. Start Backend (For Full Features)**

**Terminal 1 - Start Database:**
```bash
# Using Docker for just the database
docker run --name postgres-dev \
  -e POSTGRES_DB=keycloak_forge \
  -e POSTGRES_USER=forge_user \
  -e POSTGRES_PASSWORD=forge_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Terminal 2 - Start Keycloak:**
```bash
# Using Docker for just Keycloak
docker run --name keycloak-dev \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -p 8090:8080 \
  -d quay.io/keycloak/keycloak:23.0.0 start-dev
```

**Terminal 3 - Start Backend:**
```bash
cd backend-java

# Install dependencies (first time only)
mvn clean install -DskipTests

# Start backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Terminal 4 - Start Frontend:**
```bash
cd frontend
npm run dev
```

### **5. Even Simpler - Frontend Only Test**

If you just want to test the conversion functionality:

```bash
# Test the conversion script directly
node tools/test-utilities/test-terragrunt-conversion.mjs

# This will:
# ✅ Test conversion of sample realms
# ✅ Generate Terragrunt modules
# ✅ Validate syntax
# ✅ Show success/failure results
```

## 🧪 Quick Verification

### **Test Conversion Works:**
```bash
# Check if conversion generates files
node tools/test-utilities/test-terragrunt-conversion.mjs

# Expected output:
# ✅ Successfully converted realms:
#    - groups-test-realm (5 components)
#    - example-realm (5 components)
# 🎯 Overall success rate: 100%
```

### **Test Frontend Works:**
```bash
cd frontend
npm run dev

# Open http://localhost:8083
# Upload data/samples/groups-test-realm.json
# Verify download works
```

## 📋 Service URLs (Manual)

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:8083 | ✅ Always works |
| Backend API | http://localhost:8080 | ⚠️ Needs manual setup |
| Database | localhost:5432 | ⚠️ Docker recommended |
| Keycloak | http://localhost:8090 | ⚠️ Docker recommended |

## 🎯 What Works Without Docker

✅ **Core Conversion**: realm.json → Terragrunt modules  
✅ **Frontend Interface**: Upload, convert, download  
✅ **Module Generation**: All DRY Terragrunt modules  
✅ **Syntax Validation**: Terragrunt syntax checking  
✅ **Multi-Environment**: Dev/staging/prod configs  

❌ **Round-trip Validation**: Needs backend + Keycloak  
❌ **API Features**: Needs backend running  
❌ **Database**: Needs PostgreSQL  

## 🚀 Recommended Quick Start

For immediate testing without Docker hassles:

```bash
# 1. Quick test
node tools/test-utilities/test-terragrunt-conversion.mjs

# 2. Web interface
cd frontend && npm install && npm run dev

# 3. Open http://localhost:8083 and upload realm files
```

This gives you the core functionality immediately while avoiding Docker complexity!

## ⚡ Ultra Quick Test (30 seconds)

```bash
# Test conversion without any installation
cat data/samples/groups-test-realm.json | \
node -e "
const fs = require('fs');
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const realm = JSON.parse(data);
  console.log('✅ Realm:', realm.realm);
  console.log('✅ Groups:', realm.groups?.length || 0);
  console.log('✅ Users:', realm.users?.length || 0);
  console.log('✅ Roles:', realm.roles?.realm?.length || 0);
  console.log('✅ Clients:', realm.clients?.length || 0);
  console.log('🎯 Conversion would generate 5 Terragrunt modules');
});
"
```

This immediately shows you what the tool can convert!