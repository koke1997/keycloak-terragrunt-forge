# 🏗️ Terragrunt DRY Architecture Design

## 🎯 **Architecture Goals**
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication across realms
- **SOLID Principles**: Single responsibility, open/closed, modular design
- **Multi-realm Support**: Handle multiple realms with shared modules
- **Performance**: Java for Keycloak integration, Go for Terraform/OpenTofu
- **100% Test Coverage**: Comprehensive testing with native libraries

## 🏛️ **Proposed Structure**

```
keycloak-terragrunt-forge/
├── 📁 modules/                          # Reusable Terragrunt modules
│   ├── keycloak-realm/                  # Core realm module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terragrunt.hcl
│   ├── keycloak-groups/                 # Groups module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terragrunt.hcl
│   ├── keycloak-users/                  # Users module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terragrunt.hcl
│   ├── keycloak-roles/                  # Roles module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terragrunt.hcl
│   ├── keycloak-clients/                # Clients module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terragrunt.hcl
│   └── keycloak-identity-providers/     # Identity providers module
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terragrunt.hcl
│
├── 🌍 environments/                     # Environment-specific configs
│   ├── dev/
│   │   ├── terragrunt.hcl              # Dev environment config
│   │   ├── keycloak/
│   │   │   ├── terragrunt.hcl          # Keycloak service config
│   │   │   └── realms/
│   │   │       ├── example-realm/
│   │   │       │   ├── terragrunt.hcl  # Realm-specific config
│   │   │       │   └── realm.auto.tfvars.json
│   │   │       └── groups-test-realm/
│   │   │           ├── terragrunt.hcl
│   │   │           └── realm.auto.tfvars.json
│   │   └── common.hcl                  # Shared dev variables
│   ├── staging/
│   │   └── ...                         # Same structure as dev
│   └── prod/
│       └── ...                         # Same structure as dev
│
├── ☕ backend-java/                    # Java backend for Keycloak integration
│   ├── src/main/java/com/keycloak/forge/
│   │   ├── KeycloakForgeApplication.java
│   │   ├── controller/
│   │   │   ├── RealmController.java
│   │   │   ├── ConversionController.java
│   │   │   └── ValidationController.java
│   │   ├── service/
│   │   │   ├── KeycloakService.java    # Native Keycloak API integration
│   │   │   ├── RealmAnalyzer.java      # Realm complexity analysis
│   │   │   ├── TerraformGenerator.java # Terraform generation
│   │   │   └── ValidationService.java  # Schema validation
│   │   ├── model/
│   │   │   ├── RealmConfig.java
│   │   │   ├── GroupHierarchy.java
│   │   │   ├── UserMapping.java
│   │   │   └── ConversionResult.java
│   │   ├── config/
│   │   │   ├── KeycloakConfig.java
│   │   │   └── CacheConfig.java
│   │   └── utils/
│   │       ├── JsonProcessor.java
│   │       └── TerraformUtils.java
│   ├── src/test/java/                  # Comprehensive Java tests
│   ├── pom.xml
│   └── Dockerfile
│
├── 🐹 backend-go/                      # Go backend for Terraform/OpenTofu
│   ├── cmd/
│   │   ├── terragrunt-cli/
│   │   │   └── main.go                 # CLI tool for Terragrunt operations
│   │   └── validation-server/
│   │       └── main.go                 # Validation service
│   ├── internal/
│   │   ├── terragrunt/
│   │   │   ├── generator.go            # Terragrunt HCL generation
│   │   │   ├── validator.go            # Terragrunt validation
│   │   │   └── planner.go              # Execution planning
│   │   ├── terraform/
│   │   │   ├── parser.go               # Terraform parsing
│   │   │   ├── analyzer.go             # State analysis
│   │   │   └── executor.go             # Terraform execution
│   │   ├── opentofu/
│   │   │   ├── adapter.go              # OpenTofu compatibility
│   │   │   └── migrator.go             # Migration utilities
│   │   └── config/
│   │       ├── loader.go               # Configuration loading
│   │       └── validator.go            # Config validation
│   ├── pkg/
│   │   ├── api/                        # Shared API types
│   │   ├── models/                     # Data models
│   │   └── utils/                      # Shared utilities
│   ├── tests/                          # Go integration tests
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
│
├── 📁 configs/                         # Shared configuration
│   ├── terragrunt/
│   │   ├── common.hcl                  # Common Terragrunt config
│   │   ├── provider.hcl                # Provider configurations
│   │   └── remote-state.hcl            # Remote state config
│   └── terraform/
│       ├── versions.tf                 # Provider version constraints
│       └── backends.tf                 # Backend configurations
│
└── 🧪 tests/                          # Multi-language testing
    ├── java/                           # Java-specific tests
    │   ├── integration/
    │   └── performance/
    ├── go/                             # Go-specific tests
    │   ├── unit/
    │   └── integration/
    └── e2e/                            # End-to-end tests
        ├── scenarios/
        └── fixtures/
```

## 🔧 **Core Terragrunt Configuration**

### `/configs/terragrunt/common.hcl`
```hcl
# Common configuration for all environments
locals {
  # Common tags
  common_tags = {
    Project     = "keycloak-terragrunt-forge"
    ManagedBy   = "terragrunt"
    Environment = "${local.environment}"
  }
  
  # Parse environment from path
  environment = reverse(split("/", get_path_to_repo_root()))[0]
  
  # Provider configuration
  provider_version = "~> 5.0"
  terraform_version = ">= 1.0"
}

# Remote state configuration
remote_state {
  backend = "s3"
  config = {
    bucket = "keycloak-terraform-state-${local.environment}"
    key    = "${path_relative_to_include()}/terraform.tfstate"
    region = "us-west-2"
    
    dynamodb_table = "keycloak-terraform-locks"
    encrypt        = true
  }
}

# Provider configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = "${local.terraform_version}"
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "${local.provider_version}"
    }
  }
}

provider "keycloak" {
  client_id                = var.keycloak_admin_username
  username                 = var.keycloak_admin_username
  password                 = var.keycloak_admin_password
  url                      = var.keycloak_url
  initial_login            = false
  client_timeout           = 60
  tls_insecure_skip_verify = var.keycloak_tls_insecure_skip_verify
}
EOF
}

# Common inputs
inputs = {
  tags = local.common_tags
}
```

### `/modules/keycloak-realm/terragrunt.hcl`
```hcl
# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "."
}

# Dependencies
dependencies {
  paths = []
}

# Input validation
inputs = {
  # Realm configuration will be provided by environment-specific configs
}
```

### `/environments/dev/keycloak/realms/example-realm/terragrunt.hcl`
```hcl
# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../modules/keycloak-realm"
}

# Dependencies for groups, users, roles, clients
dependencies {
  paths = [
    "../groups",
    "../users", 
    "../roles",
    "../clients"
  ]
}

# Environment-specific inputs
inputs = {
  realm_config = jsondecode(file("realm.auto.tfvars.json"))
  
  # Environment-specific overrides
  keycloak_url      = "http://localhost:8090"
  keycloak_admin_username = "admin"
  keycloak_admin_password = "admin"
  keycloak_tls_insecure_skip_verify = true
  
  # Module-specific configuration
  create_realm = true
  manage_groups = true
  manage_users = true
  manage_roles = true
  manage_clients = true
}
```

## ☕ **Java Backend Integration**

### Key Benefits:
- **Native Keycloak Libraries**: Direct integration with Keycloak Java APIs
- **Performance**: JVM optimization for complex JSON processing
- **Enterprise Features**: Caching, security, monitoring
- **Testing**: JUnit integration with Keycloak test containers

### `/backend-java/src/main/java/com/keycloak/forge/service/KeycloakService.java`
```java
@Service
@Slf4j
public class KeycloakService {
    
    @Autowired
    private KeycloakTemplate keycloakTemplate;
    
    @Cacheable("realm-analysis")
    public RealmAnalysis analyzeRealm(RealmRepresentation realm) {
        return RealmAnalysis.builder()
            .complexity(calculateComplexity(realm))
            .features(detectFeatures(realm))
            .recommendations(generateRecommendations(realm))
            .build();
    }
    
    public TerraformConfig convertToTerraform(RealmRepresentation realm, ConversionOptions options) {
        // Use native Keycloak objects for accurate conversion
        return TerraformConfig.builder()
            .realm(convertRealm(realm))
            .groups(convertGroups(realm.getGroups()))
            .users(convertUsers(realm.getUsers()))
            .roles(convertRoles(realm.getRoles()))
            .clients(convertClients(realm.getClients()))
            .build();
    }
    
    private ComplexityScore calculateComplexity(RealmRepresentation realm) {
        // Advanced complexity analysis using Keycloak's internal structures
        return ComplexityScore.builder()
            .groupHierarchyDepth(calculateGroupDepth(realm.getGroups()))
            .roleComplexity(analyzeRoles(realm.getRoles()))
            .clientComplexity(analyzeClients(realm.getClients()))
            .build();
    }
}
```

## 🐹 **Go Backend Integration**

### Key Benefits:
- **Native Terraform/OpenTofu Libraries**: Direct HCL generation and validation
- **Performance**: Go's concurrency for parallel processing
- **CLI Tools**: Native binary distribution
- **Cloud Native**: Excellent for containerized deployments

### `/backend-go/internal/terragrunt/generator.go`
```go
package terragrunt

import (
    "github.com/hashicorp/hcl/v2/hclwrite"
    "github.com/gruntwork-io/terragrunt/config"
)

type TerragruntGenerator struct {
    config *GeneratorConfig
}

func (g *TerragruntGenerator) GenerateRealmModule(realm *models.RealmConfig) (*TerragruntModule, error) {
    // Use native Terragrunt libraries for accurate HCL generation
    module := &TerragruntModule{
        Source: g.config.ModulePath,
        Dependencies: g.resolveDependencies(realm),
        Inputs: g.generateInputs(realm),
    }
    
    return module, nil
}

func (g *TerragruntGenerator) ValidateConfiguration(config *TerragruntConfig) (*ValidationResult, error) {
    // Use Terragrunt's native validation
    result, err := config.ValidateConfiguration()
    if err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }
    
    return &ValidationResult{
        Valid: result.Valid,
        Errors: result.Errors,
        Warnings: result.Warnings,
    }, nil
}

func (g *TerragruntGenerator) PlanExecution(modules []*TerragruntModule) (*ExecutionPlan, error) {
    // Generate dependency graph and execution plan
    graph := dependency.NewGraph()
    
    for _, module := range modules {
        graph.AddModule(module)
    }
    
    plan, err := graph.GenerateExecutionPlan()
    if err != nil {
        return nil, fmt.Errorf("failed to generate execution plan: %w", err)
    }
    
    return plan, nil
}
```

## 🧪 **100% Testing Strategy**

### Multi-Language Testing Approach:

1. **Java Tests (Keycloak Integration)**:
   ```java
   @SpringBootTest
   @Testcontainers
   class KeycloakIntegrationTest {
       
       @Container
       static KeycloakContainer keycloak = new KeycloakContainer("quay.io/keycloak/keycloak:latest");
       
       @Test
       void shouldConvertComplexRealm() {
           // Test with real Keycloak instance
           RealmRepresentation realm = loadTestRealm();
           TerraformConfig result = keycloakService.convertToTerraform(realm, options);
           
           assertThat(result.getRealm()).isNotNull();
           assertThat(result.getGroups()).hasSize(expectedGroups);
           // Comprehensive assertions
       }
   }
   ```

2. **Go Tests (Terraform/OpenTofu Integration)**:
   ```go
   func TestTerragruntGeneration(t *testing.T) {
       generator := NewTerragruntGenerator(config)
       
       realm := &models.RealmConfig{
           Name: "test-realm",
           Groups: testGroups,
           Users: testUsers,
       }
       
       module, err := generator.GenerateRealmModule(realm)
       require.NoError(t, err)
       
       // Validate generated HCL
       assert.NotEmpty(t, module.Source)
       assert.Len(t, module.Dependencies, expectedDeps)
       
       // Test with real Terragrunt validation
       result, err := generator.ValidateConfiguration(module.Config)
       require.NoError(t, err)
       assert.True(t, result.Valid)
   }
   ```

3. **Integration Tests**:
   - **Cross-language communication**: Java ↔ Go API integration
   - **End-to-end workflows**: Realm upload → Java processing → Go generation → Terragrunt execution
   - **Performance testing**: Load testing with large realm files

## 🚀 **Implementation Benefits**

### ✅ **DRY Architecture**:
- **Single source of truth** for Terragrunt modules
- **No code duplication** across realms/environments
- **Centralized configuration** management

### ✅ **Multi-Realm Support**:
- **Scalable structure** for hundreds of realms
- **Environment isolation** (dev/staging/prod)
- **Dependency management** between realm components

### ✅ **Performance Optimization**:
- **Java backend**: Leverages JVM performance for complex processing
- **Go backend**: Fast binary execution for Terraform operations
- **Native libraries**: Direct integration with Keycloak and Terraform APIs

### ✅ **100% Test Coverage**:
- **Unit tests**: Language-specific testing frameworks
- **Integration tests**: Cross-language API testing
- **E2E tests**: Full workflow validation
- **Performance tests**: Load and stress testing

This architecture provides enterprise-grade scalability while maintaining DRY principles and leveraging the best tools for each component!