package com.keycloak.forge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.keycloak.forge.model.ConversionRequest;
import com.keycloak.forge.model.ConversionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.representations.idm.*;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("TerraformGeneratorService Tests")
class TerraformGeneratorServiceTest {

    @InjectMocks
    private TerraformGeneratorService terraformGeneratorService;

    private ObjectMapper objectMapper;
    
    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should generate comprehensive modules for ultra-complex realm")
    void shouldGenerateComprehensiveModulesForUltraComplexRealm() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getFiles()).isNotEmpty();
        
        // Verify we generate significantly more files than the old implementation (2 files)
        assertThat(result.getFiles()).hasSizeGreaterThan(20);
        
        // Verify all expected module directories are created
        assertThat(getFilePaths(result)).contains(
            "keycloak/realms/groups-test-realm/realm/main.tf",
            "keycloak/realms/groups-test-realm/roles/main.tf",
            "keycloak/realms/groups-test-realm/groups/main.tf",
            "keycloak/realms/groups-test-realm/users/main.tf",
            "keycloak/realms/groups-test-realm/clients/main.tf",
            "keycloak/realms/groups-test-realm/identity-providers/main.tf",
            "keycloak/realms/groups-test-realm/authentication-flows/main.tf",
            "keycloak/realms/groups-test-realm/client-scopes/main.tf"
        );
    }

    @Test
    @DisplayName("Should generate proper terragrunt module structure")
    void shouldGenerateProperTerragruntModuleStructure() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        List<String> filePaths = getFilePaths(result);
        
        // Each module should have main.tf, variables.tf, and terragrunt.hcl
        assertThat(filePaths).anyMatch(path -> path.contains("realm/main.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("realm/variables.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("realm/terragrunt.hcl"));
        assertThat(filePaths).anyMatch(path -> path.contains("realm/outputs.tf"));
        
        assertThat(filePaths).anyMatch(path -> path.contains("roles/main.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("roles/variables.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("roles/terragrunt.hcl"));
        
        assertThat(filePaths).anyMatch(path -> path.contains("groups/main.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("groups/variables.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("groups/terragrunt.hcl"));
    }

    @Test
    @DisplayName("Should generate realm module with comprehensive configuration")
    void shouldGenerateRealmModuleWithComprehensiveConfiguration() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile realmMainFile = findFileByPath(result, "realm/main.tf");
        assertThat(realmMainFile).isNotNull();
        assertThat(realmMainFile.getContent()).contains("keycloak/keycloak");
        assertThat(realmMainFile.getContent()).contains("version = \"~> 5.0\"");
        assertThat(realmMainFile.getContent()).contains("keycloak_realm");
        assertThat(realmMainFile.getContent()).contains("groups-test-realm");
    }

    @Test
    @DisplayName("Should generate roles module with composite relationships")
    void shouldGenerateRolesModuleWithCompositeRelationships() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile rolesMainFile = findFileByPath(result, "roles/main.tf");
        assertThat(rolesMainFile).isNotNull();
        assertThat(rolesMainFile.getContent()).contains("keycloak_role");
        assertThat(rolesMainFile.getContent()).contains("keycloak_role_composite");
        
        // Should contain role attributes
        assertThat(rolesMainFile.getContent()).contains("attributes = {");
    }

    @Test
    @DisplayName("Should generate groups module with hierarchical structure")
    void shouldGenerateGroupsModuleWithHierarchicalStructure() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile groupsMainFile = findFileByPath(result, "groups/main.tf");
        assertThat(groupsMainFile).isNotNull();
        assertThat(groupsMainFile.getContent()).contains("keycloak_group");
        
        // Should handle parent-child relationships
        assertThat(groupsMainFile.getContent()).contains("parent_id");
        
        // Should contain group attributes
        assertThat(groupsMainFile.getContent()).contains("attributes = {");
    }

    @Test
    @DisplayName("Should generate users module with group memberships")
    void shouldGenerateUsersModuleWithGroupMemberships() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile usersMainFile = findFileByPath(result, "users/main.tf");
        assertThat(usersMainFile).isNotNull();
        assertThat(usersMainFile.getContent()).contains("keycloak_user");
        assertThat(usersMainFile.getContent()).contains("keycloak_user_groups");
    }

    @Test
    @DisplayName("Should generate clients module with protocol mappers")
    void shouldGenerateClientsModuleWithProtocolMappers() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile clientsMainFile = findFileByPath(result, "clients/main.tf");
        assertThat(clientsMainFile).isNotNull();
        assertThat(clientsMainFile.getContent()).contains("keycloak_openid_client");
        assertThat(clientsMainFile.getContent()).contains("protocol_mapper");
    }

    @Test
    @DisplayName("Should generate identity providers module")
    void shouldGenerateIdentityProvidersModule() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile idpMainFile = findFileByPath(result, "identity-providers/main.tf");
        assertThat(idpMainFile).isNotNull();
        assertThat(idpMainFile.getContent()).contains("keycloak_oidc_identity_provider");
    }

    @Test
    @DisplayName("Should generate authentication flows module")
    void shouldGenerateAuthenticationFlowsModule() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile flowsMainFile = findFileByPath(result, "authentication-flows/main.tf");
        assertThat(flowsMainFile).isNotNull();
        assertThat(flowsMainFile.getContent()).contains("keycloak_authentication_flow");
    }

    @Test
    @DisplayName("Should generate client scopes module")
    void shouldGenerateClientScopesModule() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile scopesMainFile = findFileByPath(result, "client-scopes/main.tf");
        assertThat(scopesMainFile).isNotNull();
        assertThat(scopesMainFile.getContent()).contains("keycloak_openid_client_scope");
    }

    @Test
    @DisplayName("Should generate root terragrunt configuration")
    void shouldGenerateRootTerragruntConfiguration() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile rootConfig = findFileByPath(result, "terragrunt.hcl");
        assertThat(rootConfig).isNotNull();
        assertThat(rootConfig.getContent()).contains("include \"root\"");
        assertThat(rootConfig.getContent()).contains("dependencies");
    }

    @Test
    @DisplayName("Should handle minimal realm configuration")
    void shouldHandleMinimalRealmConfiguration() {
        // Given
        RealmRepresentation minimalRealm = createMinimalRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(minimalRealm, options);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        
        // Should still generate realm module even with minimal config
        List<String> filePaths = getFilePaths(result);
        assertThat(filePaths).anyMatch(path -> path.contains("realm/main.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("realm/variables.tf"));
        assertThat(filePaths).anyMatch(path -> path.contains("terragrunt.hcl"));
    }

    @Test
    @DisplayName("Should validate terraform syntax in generated files")
    void shouldValidateTerraformSyntaxInGeneratedFiles() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        for (ConversionResult.TerraformFile file : result.getFiles()) {
            // Basic syntax validation
            assertThat(file.getContent())
                .as("File %s should have valid Terraform syntax", file.getFilePath())
                .doesNotContain("${")  // No unescaped variables
                .doesNotContain("null")  // No null values
                .matches("(?s).*\\{.*\\}.*");  // Contains proper block structure
                
            // Terraform provider version validation
            if (file.getContent().contains("required_providers")) {
                assertThat(file.getContent()).contains("keycloak/keycloak");
                assertThat(file.getContent()).contains("~> 5.0");
            }
            
            // Resource naming validation
            if (file.getContent().contains("resource \"")) {
                assertThat(file.getContent()).doesNotContain("resource \"\" ");  // No empty resource names
            }
        }
    }

    @Test
    @DisplayName("Should generate files with proper dependencies")
    void shouldGenerateFilesWithProperDependencies() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);

        // Then
        ConversionResult.TerraformFile rolesTerragrunt = findFileByPath(result, "roles/terragrunt.hcl");
        assertThat(rolesTerragrunt.getContent()).contains("dependency \"realm\"");
        assertThat(rolesTerragrunt.getContent()).contains("config_path = \"../realm\"");

        ConversionResult.TerraformFile groupsTerragrunt = findFileByPath(result, "groups/terragrunt.hcl");
        assertThat(groupsTerragrunt.getContent()).contains("dependency \"realm\"");
        assertThat(groupsTerragrunt.getContent()).contains("dependency \"roles\"");

        ConversionResult.TerraformFile usersTerragrunt = findFileByPath(result, "users/terragrunt.hcl");
        assertThat(usersTerragrunt.getContent()).contains("dependency \"realm\"");
        assertThat(usersTerragrunt.getContent()).contains("dependency \"groups\"");
    }

    @Test
    @DisplayName("Should measure performance for large realm processing")
    void shouldMeasurePerformanceForLargeRealmProcessing() throws IOException {
        // Given
        RealmRepresentation realm = loadUltraComplexRealm();
        ConversionRequest.ConversionOptions options = createDefaultOptions();

        // When
        long startTime = System.currentTimeMillis();
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, options);
        long endTime = System.currentTimeMillis();

        // Then
        assertThat(result.isSuccess()).isTrue();
        long processingTime = endTime - startTime;
        
        // Should process ultra-complex realm (1,304+ groups, 50 roles, 100 users, 20 clients) in reasonable time
        assertThat(processingTime)
            .as("Processing ultra-complex realm should complete within 10 seconds")
            .isLessThan(10000);
            
        System.out.printf("Ultra-complex realm processing time: %d ms%n", processingTime);
        System.out.printf("Generated %d files%n", result.getFiles().size());
    }

    // Helper methods
    private RealmRepresentation loadUltraComplexRealm() throws IOException {
        String content = Files.readString(Paths.get("/home/marenk/Documents/GitHub/keycloak-terragrunt-forge/data/generated/ultra-complex-realm-with-groups.json"));
        return objectMapper.readValue(content, RealmRepresentation.class);
    }

    private RealmRepresentation createMinimalRealm() {
        RealmRepresentation realm = new RealmRepresentation();
        realm.setRealm("test-realm");
        realm.setDisplayName("Test Realm");
        realm.setEnabled(true);
        return realm;
    }

    private ConversionRequest.ConversionOptions createDefaultOptions() {
        ConversionRequest.ConversionOptions options = new ConversionRequest.ConversionOptions();
        options.setIncludeUsers(true);
        options.setIncludeGroups(true);
        options.setIncludeClients(true);
        options.setIncludeRoles(true);
        options.setGenerateTerragrunt(true);
        options.setOutputFormat("terragrunt");
        options.setValidateOutput(true);
        return options;
    }

    private List<String> getFilePaths(ConversionResult result) {
        return result.getFiles().stream()
            .map(ConversionResult.TerraformFile::getFilePath)
            .toList();
    }

    private ConversionResult.TerraformFile findFileByPath(ConversionResult result, String pathSuffix) {
        return result.getFiles().stream()
            .filter(file -> file.getFilePath().endsWith(pathSuffix))
            .findFirst()
            .orElse(null);
    }
}