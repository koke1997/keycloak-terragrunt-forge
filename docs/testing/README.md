# Testing Documentation

This document describes the comprehensive test suite for the Keycloak Terragrunt Forge project, specifically focusing on the enhanced TerraformGeneratorService that generates comprehensive Terragrunt modules.

## Test Suite Overview

The test suite is designed to ensure that the TerraformGeneratorService correctly generates comprehensive Terragrunt modules covering all Keycloak realm components with proper structure, dependencies, and performance.

### Test Categories

1. **Unit Tests** - Test individual module generation functionality
2. **Integration Tests** - Test complete realm processing with ultra-complex data
3. **Performance Tests** - Ensure scalable processing for large realms
4. **Validation Tests** - Verify Terraform syntax and structure correctness

## Test Classes

### 1. TerraformGeneratorServiceTest

**Purpose**: Comprehensive testing of the main service functionality

**Key Test Cases**:
- `shouldGenerateComprehensiveModulesForUltraComplexRealm()` - Tests processing of the ultra-complex realm (1,304+ groups, 50 roles, 100 users, 20 clients)
- `shouldGenerateProperTerragruntModuleStructure()` - Validates proper module organization
- `shouldGenerateRealmModuleWithComprehensiveConfiguration()` - Tests realm module generation
- `shouldGenerateRolesModuleWithCompositeRelationships()` - Tests role hierarchy handling
- `shouldGenerateGroupsModuleWithHierarchicalStructure()` - Tests deep group nesting (7 levels)
- `shouldGenerateUsersModuleWithGroupMemberships()` - Tests user-group associations
- `shouldGenerateClientsModuleWithProtocolMappers()` - Tests OAuth/OIDC client configuration
- `shouldValidateTerraformSyntaxInGeneratedFiles()` - Ensures valid Terraform syntax
- `shouldMeasurePerformanceForLargeRealmProcessing()` - Performance baseline test

**Expected Results**:
- ✅ Generates 26+ files instead of just 2 (previous implementation)
- ✅ Creates 8 specialized modules: realm, roles, groups, users, clients, identity-providers, authentication-flows, client-scopes
- ✅ Processes ultra-complex realm within 10 seconds
- ✅ Generates valid Terraform syntax with proper resource naming
- ✅ Creates proper module dependencies via Terragrunt

### 2. TerraformModuleGenerationTest

**Purpose**: Detailed testing of individual module generation logic

**Key Test Cases**:
- `shouldGenerateOnlyRealmModuleForMinimalRealm()` - Tests minimal configuration handling
- `shouldGenerateRealmAndRolesModulesForRealmWithRoles()` - Tests conditional module generation
- `shouldGenerateAllModulesForComprehensiveRealm()` - Tests complete module set generation
- `shouldHandleSpecialCharactersInResourceNames()` - Tests resource name sanitization
- `shouldGenerateProperVariableReferencesBetweenModules()` - Tests module dependencies
- `shouldValidateTerraformResourceNamingConventions()` - Tests naming conventions
- `shouldGenerateConsistentFileSizes()` - Tests output consistency

**Expected Results**:
- ✅ Generates appropriate modules based on realm content
- ✅ Properly sanitizes special characters in resource names
- ✅ Creates correct Terragrunt dependencies between modules
- ✅ Maintains consistent file sizing and structure

### 3. TerraformGeneratorPerformanceTest

**Purpose**: Performance and scalability testing

**Key Test Cases**:
- `shouldProcessSmallRealmQuickly()` - Baseline performance (< 100ms)
- `shouldProcessMediumRealmEfficiently()` - Medium complexity (< 1 second)
- `shouldProcessLargeRealmWithinAcceptableTime()` - Large complexity (< 5 seconds)
- `shouldHandleConcurrentRequestsEfficiently()` - Concurrent processing test
- `shouldMaintainPerformanceWithRepeatedProcessing()` - Performance consistency
- `shouldScaleLinearlyWithRealmComplexity()` - Scalability validation
- `shouldHandleMemoryEfficientlyForLargeRealms()` - Memory usage test (< 100MB)

**Expected Results**:
- ✅ Handles concurrent requests without performance degradation
- ✅ Scales linearly with realm complexity (not exponentially)
- ✅ Maintains consistent performance across repeated runs
- ✅ Uses memory efficiently for large realm processing

### 4. TestDataFactory

**Purpose**: Provides consistent test data fixtures for various realm scenarios

**Available Fixtures**:
- `createSimpleRealm()` - Minimal realm configuration
- `createRealmWithRoles()` - Realm with role hierarchy and composites
- `createRealmWithGroups()` - Realm with group hierarchy and attributes
- `createRealmWithUsers()` - Realm with users and group memberships
- `createRealmWithClients()` - Realm with OAuth/OIDC clients and protocol mappers
- `createRealmWithIdentityProviders()` - Realm with external identity providers
- `createRealmWithAuthenticationFlows()` - Realm with custom authentication flows
- `createRealmWithClientScopes()` - Realm with reusable client scopes
- `createComprehensiveRealm()` - Complete realm with all components

## Running the Tests

### Prerequisites

1. Java 21 or higher
2. Maven 3.8+
3. Access to ultra-complex realm test file: `/home/marenk/Documents/GitHub/keycloak-terragrunt-forge/data/generated/ultra-complex-realm-with-groups.json`

### Execution Commands

```bash
# Run all tests
cd backend-java
mvn test

# Run specific test class
mvn test -Dtest=TerraformGeneratorServiceTest

# Run performance tests only
mvn test -Dtest=TerraformGeneratorPerformanceTest

# Run with detailed output
mvn test -Dtest=TerraformGeneratorServiceTest#shouldGenerateComprehensiveModulesForUltraComplexRealm

# Run tests with coverage
mvn test jacoco:report
```

### Test Profiles

The tests use the `test` profile with H2 in-memory database for fast execution:

```yaml
spring:
  profiles:
    active: test
  datasource:
    url: jdbc:h2:mem:testdb
```

## Test Results Interpretation

### Success Criteria

**Module Generation Coverage**:
- ✅ Realm module: Core configuration with security policies
- ✅ Roles module: 50 roles with attributes and composite relationships
- ✅ Groups module: 1,304+ groups with 7-level hierarchy
- ✅ Users module: 100 users with group memberships
- ✅ Clients module: 20 clients with protocol mappers
- ✅ Identity Providers module: 12 external providers
- ✅ Authentication Flows module: 15 custom flows
- ✅ Client Scopes module: Reusable scope definitions

**File Structure Validation**:
```
keycloak/realms/{realm-name}/
├── realm/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terragrunt.hcl
├── roles/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── groups/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── users/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── clients/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── identity-providers/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── authentication-flows/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
├── client-scopes/
│   ├── main.tf
│   ├── variables.tf
│   └── terragrunt.hcl
└── terragrunt.hcl (root configuration)
```

**Performance Benchmarks**:
- Simple realm: < 100ms
- Medium realm (20 roles, 15 groups, 10 users): < 1 second
- Large realm (100 roles, 50 groups, 50 users): < 5 seconds
- Ultra-complex realm (50 roles, 1,304+ groups, 100 users, 20 clients): < 10 seconds
- Memory usage: < 100MB for largest realms
- Concurrent processing: 5 threads × 3 requests each within 30 seconds

### Failure Investigation

If tests fail, check:

1. **File Access**: Ensure ultra-complex realm JSON file is accessible
2. **Memory**: Increase JVM memory if processing large realms: `-Xmx2g`
3. **Timeout**: Adjust timeout settings in test configuration
4. **Dependencies**: Verify all Maven dependencies are resolved

### Coverage Reports

Generate test coverage reports:

```bash
mvn clean test jacoco:report
open target/site/jacoco/index.html
```

Target coverage goals:
- Line coverage: > 85%
- Branch coverage: > 80%
- Method coverage: > 90%

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    cd backend-java
    mvn clean test -Dspring.profiles.active=test
    
- name: Generate Coverage Report
  run: |
    cd backend-java
    mvn jacoco:report
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: backend-java/target/site/jacoco/jacoco.xml
```

## Test Data Management

### Ultra-Complex Realm Test Data

The tests rely on a comprehensive test realm JSON file containing:
- **1,304+ groups** in 7-level hierarchy
- **50 roles** with composite relationships
- **100 users** with group memberships
- **20 clients** with protocol mappers
- **12 identity providers**
- **15 authentication flows**
- **2 client scopes**

This file represents a realistic enterprise Keycloak deployment and ensures the TerraformGeneratorService can handle production-scale complexity.

### Test Isolation

Each test method is isolated:
- Uses separate in-memory database instances
- Creates fresh service instances
- No shared state between tests
- Parallel execution safe

## Maintenance

### Adding New Tests

When adding new functionality:

1. Create test fixtures in `TestDataFactory`
2. Add unit tests in appropriate test class
3. Include performance validation for complex operations
4. Update this documentation

### Updating Test Data

When Keycloak representation changes:
1. Update `TestDataFactory` fixtures
2. Regenerate ultra-complex realm test data if needed
3. Verify all tests pass with new data structure
4. Update expected results in documentation

## Troubleshooting

### Common Issues

**OutOfMemoryError**:
```bash
export MAVEN_OPTS="-Xmx2g -XX:MaxMetaspaceSize=512m"
mvn test
```

**Slow Test Execution**:
- Check H2 configuration in `application-test.yml`
- Ensure proper test isolation
- Consider reducing test data size for development

**File Access Errors**:
- Verify test data file permissions
- Check file paths in test configuration
- Ensure test runs from correct working directory

### Debug Mode

Run tests with debug output:

```bash
mvn test -Dtest=TerraformGeneratorServiceTest -Dlogging.level.com.keycloak.forge=DEBUG
```

This provides detailed logging of the Terraform generation process, helping identify issues in module generation logic.