# 🔌 REST API Reference

This document provides comprehensive documentation for the Keycloak Terragrunt Forge REST API.

## 🏗️ API Overview

The API follows REST principles and provides endpoints for:
- **Conversion**: Transform Keycloak realm.json to Terragrunt modules
- **Validation**: Round-trip validation and fidelity checking
- **Analysis**: Realm complexity analysis and feature detection
- **Export**: Download generated Terragrunt modules

**Base URL**: `http://localhost:8080/api/v1`
**Content-Type**: `application/json`
**Authentication**: JWT Bearer Token (optional in development)

## 📋 API Endpoints

### **Conversion Endpoints**

#### `POST /convert`
Convert a Keycloak realm to Terragrunt modules.

**Request Body**:
```json
{
  "realm": {
    "realm": "example-realm",
    "enabled": true,
    "displayName": "Example Realm",
    "groups": [...],
    "users": [...],
    "roles": {...},
    "clients": [...]
  },
  "options": {
    "providerVersion": "5.2.0",
    "includeComments": true,
    "modularStructure": true,
    "targetEnvironment": "dev"
  }
}
```

**Response**:
```json
{
  "success": true,
  "conversionId": "uuid-v4",
  "files": [
    {
      "path": "keycloak/realms/example-realm/terragrunt.hcl",
      "content": "# Terragrunt configuration...",
      "size": 1024
    },
    {
      "path": "keycloak/realms/example-realm/groups/terragrunt.hcl", 
      "content": "# Groups module...",
      "size": 512
    }
  ],
  "metadata": {
    "realm": "example-realm",
    "fileCount": 5,
    "complexity": 85,
    "generatedAt": "2025-06-15T10:00:00Z",
    "components": {
      "groups": 3,
      "users": 10,
      "roles": 5,
      "clients": 2
    }
  },
  "analysis": {
    "complexity": {
      "score": 85,
      "level": "high",
      "factors": {
        "groups": 50,
        "users": 100,
        "roles": 75,
        "clients": 20,
        "nestingDepth": 3
      }
    },
    "features": {
      "nestedGroups": true,
      "complexAttributes": true,
      "roleMappings": true,
      "clientScopes": true
    },
    "recommendations": [
      "Consider using group hierarchies",
      "Implement role-based access control"
    ]
  }
}
```

**Status Codes**:
- `200 OK`: Conversion successful
- `400 Bad Request`: Invalid realm.json format
- `422 Unprocessable Entity`: Realm validation failed
- `500 Internal Server Error`: Conversion error

#### `POST /convert/upload`
Upload and convert multiple realm files.

**Request**: `multipart/form-data`
- `files`: Array of realm.json files
- `options` (optional): JSON string with conversion options

**Response**:
```json
{
  "batchId": "batch-uuid-v4",
  "results": [
    {
      "filename": "realm1.json",
      "status": "completed",
      "conversionId": "uuid-v4",
      "files": [...],
      "metadata": {...}
    },
    {
      "filename": "realm2.json", 
      "status": "failed",
      "error": "Invalid JSON format"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "successRate": 50.0
  }
}
```

#### `GET /convert/{conversionId}/status`
Get conversion status for async operations.

**Parameters**:
- `conversionId`: UUID of the conversion

**Response**:
```json
{
  "conversionId": "uuid-v4",
  "status": "completed",
  "progress": 100,
  "result": {
    "files": [...],
    "metadata": {...}
  },
  "timestamps": {
    "started": "2025-06-15T10:00:00Z",
    "completed": "2025-06-15T10:00:30Z"
  }
}
```

**Status Values**:
- `queued`: Conversion queued for processing
- `processing`: Currently being processed
- `completed`: Successfully completed
- `failed`: Failed with error

### **Analysis Endpoints**

#### `POST /analyze`
Analyze a realm without conversion.

**Request Body**:
```json
{
  "realm": "example-realm",
  "enabled": true,
  "groups": [...],
  "users": [...],
  "roles": {...},
  "clients": [...]
}
```

**Response**:
```json
{
  "complexity": {
    "score": 85,
    "level": "high",
    "factors": {
      "groups": 50,
      "users": 100,
      "roles": 75,
      "clients": 20,
      "nestingDepth": 3,
      "attributeComplexity": 40,
      "roleMappingComplexity": 60
    },
    "breakdown": {
      "simple": 15,
      "moderate": 30,
      "complex": 35,
      "veryComplex": 20
    }
  },
  "features": {
    "nestedGroups": true,
    "complexAttributes": true,
    "roleMappings": true,
    "clientScopes": true,
    "identityProviders": false,
    "authenticationFlows": true,
    "protocolMappers": false
  },
  "statistics": {
    "totalElements": 45,
    "groupHierarchyDepth": 3,
    "averageGroupSize": 12,
    "roleComplexity": "moderate",
    "clientComplexity": "simple"
  },
  "recommendations": [
    "Consider using group hierarchies for better organization",
    "Implement role-based access control",
    "Review client scope configurations",
    "Consider splitting large groups"
  ],
  "estimatedDeploymentTime": "15 minutes",
  "resourceRequirements": {
    "cpu": "moderate",
    "memory": "low",
    "storage": "minimal"
  }
}
```

### **Validation Endpoints**

#### `POST /validate/round-trip`
Perform complete round-trip validation.

**Request Body**:
```json
{
  "originalRealm": {
    "realm": "test-realm",
    "enabled": true,
    // ... full realm configuration
  },
  "deployedRealmName": "test-realm"
}
```

**Query Parameters**:
- `timeout`: Validation timeout in seconds (default: 300)
- `strictMode`: Enable strict validation (default: true)

**Response**:
```json
{
  "originalRealm": "test-realm",
  "deployedRealm": "test-realm",
  "success": true,
  "validationResult": {
    "valid": true,
    "accuracyPercentage": 99.8,
    "differences": [],
    "warnings": [
      "Minor timestamp differences ignored"
    ],
    "componentAccuracy": {
      "realm": 100.0,
      "groups": 99.5,
      "users": 100.0,
      "roles": 100.0,
      "clients": 99.0
    },
    "totalElements": 45,
    "matchedElements": 44,
    "detailedComparison": {
      "groups": {
        "componentType": "groups",
        "originalCount": 3,
        "exportedCount": 3,
        "accuracy": 99.5,
        "missingElements": [],
        "extraElements": [],
        "modifiedElements": ["minor attribute difference in group1"]
      }
    }
  },
  "timestamp": "2025-06-15T10:05:00Z",
  "executionTimeMs": 30000,
  "steps": [
    {
      "name": "Export deployed realm",
      "success": true,
      "durationMs": 5000
    },
    {
      "name": "Compare configurations",
      "success": true,
      "durationMs": 25000
    }
  ],
  "metadata": {
    "keycloakVersion": "23.0.0",
    "terraformProviderVersion": "5.2.0",
    "environment": "dev"
  }
}
```

#### `GET /validate/export/{realmName}`
Export a deployed realm configuration.

**Parameters**:
- `realmName`: Name of the realm to export

**Query Parameters**:
- `includeUsers`: Include user data (default: true)
- `includeGroups`: Include group data (default: true)
- `format`: Export format (`json` or `yaml`, default: `json`)

**Response**:
```json
{
  "realm": "exported-realm",
  "enabled": true,
  "displayName": "Exported Realm",
  "groups": [...],
  "users": [...],
  "roles": {...},
  "clients": [...],
  "exportMetadata": {
    "exportedAt": "2025-06-15T10:10:00Z",
    "keycloakVersion": "23.0.0",
    "exportedBy": "api",
    "totalElements": 45
  }
}
```

#### `POST /validate/compare`
Compare two realm representations.

**Request Body**:
```json
{
  "original": {
    "realm": "realm1",
    // ... realm configuration
  },
  "exported": {
    "realm": "realm1", 
    // ... realm configuration
  },
  "options": {
    "strictMode": true,
    "ignoreTimestamps": true,
    "ignoreIds": false
  }
}
```

**Response**:
```json
{
  "valid": true,
  "accuracyPercentage": 99.5,
  "differences": [
    "Group 'admin' has different attribute values",
    "User 'john.doe' missing in exported realm"
  ],
  "warnings": [
    "Timestamp differences ignored as requested"
  ],
  "componentAccuracy": {
    "realm": 100.0,
    "groups": 95.0,
    "users": 90.0,
    "roles": 100.0,
    "clients": 100.0
  },
  "totalElements": 40,
  "matchedElements": 38,
  "summary": {
    "criticalDifferences": 0,
    "majorDifferences": 2,
    "minorDifferences": 3,
    "ignoredDifferences": 5
  }
}
```

#### `POST /validate/terraform`
Validate Terraform/Terragrunt files syntax.

**Request Body**:
```json
{
  "realmName": "test-realm",
  "files": {
    "terragrunt.hcl": "# Terragrunt configuration content...",
    "variables.tf": "# Variables content...",
    "outputs.tf": "# Outputs content..."
  },
  "options": {
    "validateSyntax": true,
    "validateDependencies": true,
    "validateProviderVersion": true
  }
}
```

**Response**:
```json
{
  "valid": true,
  "issues": [],
  "syntax": "valid",
  "provider": "keycloak/keycloak 5.2.0",
  "warnings": [],
  "suggestions": [
    "Consider adding description for variable 'realm_name'",
    "Output 'realm_id' could include description"
  ],
  "fileValidation": {
    "terragrunt.hcl": {
      "valid": true,
      "syntax": "valid",
      "warnings": []
    },
    "variables.tf": {
      "valid": true,
      "syntax": "valid", 
      "warnings": ["Missing description for variable"]
    }
  },
  "dependencyValidation": {
    "valid": true,
    "resolvedDependencies": [
      "keycloak-realm",
      "keycloak-groups"
    ],
    "missingDependencies": []
  }
}
```

### **Health & Monitoring Endpoints**

#### `GET /health`
Application health check.

**Response**:
```json
{
  "status": "UP",
  "timestamp": "2025-06-15T10:15:00Z",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "connectionPool": "healthy"
      }
    },
    "keycloak": {
      "status": "UP",
      "details": {
        "url": "http://localhost:8090",
        "responseTime": "150ms"
      }
    },
    "cache": {
      "status": "UP",
      "details": {
        "redis": "connected"
      }
    }
  }
}
```

#### `GET /metrics`
Application metrics (Prometheus format).

**Response**: Prometheus metrics format
```
# HELP conversion_requests_total Total number of conversion requests
# TYPE conversion_requests_total counter
conversion_requests_total{status="success"} 150
conversion_requests_total{status="error"} 5

# HELP conversion_duration_seconds Duration of conversion operations
# TYPE conversion_duration_seconds histogram
conversion_duration_seconds_bucket{le="1.0"} 80
conversion_duration_seconds_bucket{le="5.0"} 145
conversion_duration_seconds_bucket{le="10.0"} 155
```

## 🔒 Authentication

### **JWT Authentication**
Include JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### **API Key Authentication** (Alternative)
Include API key in header:
```
X-API-Key: <api-key>
```

## 📊 Rate Limiting

**Default Limits**:
- **Conversion**: 10 requests per minute per user
- **Analysis**: 30 requests per minute per user  
- **Validation**: 5 requests per minute per user
- **Export**: 20 requests per minute per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1640995200
```

## ❌ Error Responses

### **Standard Error Format**
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Realm validation failed: missing required field 'realm'",
  "details": {
    "field": "realm",
    "location": "root",
    "expectedType": "string"
  },
  "timestamp": "2025-06-15T10:20:00Z",
  "path": "/api/v1/convert",
  "requestId": "req-uuid-v4"
}
```

### **Common Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body |
| `VALIDATION_FAILED` | 422 | Realm validation failed |
| `REALM_NOT_FOUND` | 404 | Specified realm not found |
| `CONVERSION_FAILED` | 500 | Internal conversion error |
| `TIMEOUT` | 408 | Operation timed out |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |

## 📝 Examples

### **Complete Conversion Example**

```bash
# 1. Convert a realm
curl -X POST http://localhost:8080/api/v1/convert \
  -H "Content-Type: application/json" \
  -d '{
    "realm": {
      "realm": "my-realm",
      "enabled": true,
      "displayName": "My Test Realm"
    },
    "options": {
      "targetEnvironment": "dev",
      "includeComments": true
    }
  }'

# 2. Validate the conversion
curl -X POST http://localhost:8080/api/v1/validate/round-trip \
  -H "Content-Type: application/json" \
  -d '{
    "originalRealm": {...},
    "deployedRealmName": "my-realm"
  }'

# 3. Check health
curl http://localhost:8080/api/v1/health
```

### **File Upload Example**

```bash
curl -X POST http://localhost:8080/api/v1/convert/upload \
  -F "files=@realm1.json" \
  -F "files=@realm2.json" \
  -F 'options={"targetEnvironment":"dev"}'
```

## 🔧 SDK & Client Libraries

### **JavaScript/TypeScript Client**
```typescript
import { KeycloakForgeClient } from '@keycloak-forge/client';

const client = new KeycloakForgeClient({
  baseUrl: 'http://localhost:8080/api/v1',
  apiKey: 'your-api-key'
});

const result = await client.convert({
  realm: realmData,
  options: {
    targetEnvironment: 'dev'
  }
});
```

### **Java Client**
```java
KeycloakForgeClient client = KeycloakForgeClient.builder()
    .baseUrl("http://localhost:8080/api/v1")
    .apiKey("your-api-key")
    .build();

ConversionResult result = client.convert(
    ConversionRequest.builder()
        .realm(realmData)
        .options(ConversionOptions.builder()
            .targetEnvironment("dev")
            .build())
        .build()
);
```

This API provides comprehensive functionality for converting Keycloak realms to Terragrunt modules with full validation and analysis capabilities.