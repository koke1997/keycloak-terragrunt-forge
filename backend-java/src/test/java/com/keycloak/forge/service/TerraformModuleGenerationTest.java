package com.keycloak.forge.service;

import com.keycloak.forge.model.ConversionRequest;
import com.keycloak.forge.model.ConversionResult;
import com.keycloak.forge.utils.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.representations.idm.RealmRepresentation;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Terraform Module Generation Tests")
class TerraformModuleGenerationTest {

    @InjectMocks
    private TerraformGeneratorService terraformGeneratorService;

    private ConversionRequest.ConversionOptions defaultOptions;

    @BeforeEach
    void setUp() {
        defaultOptions = createDefaultOptions();
    }

    @Test
    @DisplayName("Should generate only realm module for minimal realm")
    void shouldGenerateOnlyRealmModuleForMinimalRealm() {
        // Given
        RealmRepresentation realm = TestDataFactory.createSimpleRealm();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should only generate realm module files + root terragrunt
        assertThat(filePaths).contains(
            "keycloak/realms/simple-realm/realm/main.tf",
            "keycloak/realms/simple-realm/realm/variables.tf",
            "keycloak/realms/simple-realm/realm/outputs.tf",
            "keycloak/realms/simple-realm/realm/terragrunt.hcl",
            "keycloak/realms/simple-realm/terragrunt.hcl"
        );
        
        // Should not generate other modules
        assertThat(filePaths).noneMatch(path -> path.contains("/roles/"));
        assertThat(filePaths).noneMatch(path -> path.contains("/groups/"));
        assertThat(filePaths).noneMatch(path -> path.contains("/users/"));
    }

    @Test
    @DisplayName("Should generate realm and roles modules for realm with roles")
    void shouldGenerateRealmAndRolesModulesForRealmWithRoles() {
        // Given
        RealmRepresentation realm = TestDataFactory.createRealmWithRoles();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should generate realm and roles modules
        assertThat(filePaths).contains(
            "keycloak/realms/realm-with-roles/realm/main.tf",
            "keycloak/realms/realm-with-roles/roles/main.tf",
            "keycloak/realms/realm-with-roles/roles/variables.tf",
            "keycloak/realms/realm-with-roles/roles/terragrunt.hcl"
        );
        
        // Verify roles content
        ConversionResult.TerraformFile rolesFile = findFileByPath(result, "roles/main.tf");
        assertThat(rolesFile.getContent()).contains("keycloak_role");
        assertThat(rolesFile.getContent()).contains("\"user\"");
        assertThat(rolesFile.getContent()).contains("\"admin\"");
        assertThat(rolesFile.getContent()).contains("keycloak_role_composite");
    }

    @Test
    @DisplayName("Should generate realm and groups modules for realm with groups")
    void shouldGenerateRealmAndGroupsModulesForRealmWithGroups() {
        // Given
        RealmRepresentation realm = TestDataFactory.createRealmWithGroups();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should generate realm and groups modules
        assertThat(filePaths).contains(
            "keycloak/realms/realm-with-groups/realm/main.tf",
            "keycloak/realms/realm-with-groups/groups/main.tf",
            "keycloak/realms/realm-with-groups/groups/variables.tf",
            "keycloak/realms/realm-with-groups/groups/terragrunt.hcl"
        );
        
        // Verify groups content
        ConversionResult.TerraformFile groupsFile = findFileByPath(result, "groups/main.tf");
        assertThat(groupsFile.getContent()).contains("keycloak_group");
        assertThat(groupsFile.getContent()).contains("engineering");
        assertThat(groupsFile.getContent()).contains("frontend");
        assertThat(groupsFile.getContent()).contains("backend");
        assertThat(groupsFile.getContent()).contains("parent_id");
    }

    @Test
    @DisplayName("Should generate realm and users modules for realm with users")
    void shouldGenerateRealmAndUsersModulesForRealmWithUsers() {
        // Given
        RealmRepresentation realm = TestDataFactory.createRealmWithUsers();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should generate realm and users modules
        assertThat(filePaths).contains(
            "keycloak/realms/realm-with-users/realm/main.tf",
            "keycloak/realms/realm-with-users/users/main.tf",
            "keycloak/realms/realm-with-users/users/variables.tf",
            "keycloak/realms/realm-with-users/users/terragrunt.hcl"
        );
        
        // Verify users content
        ConversionResult.TerraformFile usersFile = findFileByPath(result, "users/main.tf");
        assertThat(usersFile.getContent()).contains("keycloak_user");
        assertThat(usersFile.getContent()).contains("john.doe");
        assertThat(usersFile.getContent()).contains("admin");
        assertThat(usersFile.getContent()).contains("keycloak_user_groups");
    }

    @Test
    @DisplayName("Should generate realm and clients modules for realm with clients")
    void shouldGenerateRealmAndClientsModulesForRealmWithClients() {
        // Given
        RealmRepresentation realm = TestDataFactory.createRealmWithClients();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should generate realm and clients modules
        assertThat(filePaths).contains(
            "keycloak/realms/realm-with-clients/realm/main.tf",
            "keycloak/realms/realm-with-clients/clients/main.tf",
            "keycloak/realms/realm-with-clients/clients/variables.tf",
            "keycloak/realms/realm-with-clients/clients/terragrunt.hcl"
        );
        
        // Verify clients content
        ConversionResult.TerraformFile clientsFile = findFileByPath(result, "clients/main.tf");
        assertThat(clientsFile.getContent()).contains("keycloak_openid_client");
        assertThat(clientsFile.getContent()).contains("web-app");
        assertThat(clientsFile.getContent()).contains("backend-service");
        assertThat(clientsFile.getContent()).contains("protocol_mapper");
    }

    @Test
    @DisplayName("Should generate all modules for comprehensive realm")
    void shouldGenerateAllModulesForComprehensiveRealm() {
        // Given
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        List<String> filePaths = getFilePaths(result);
        
        // Should generate all module types
        assertThat(filePaths).anyMatch(path -> path.contains("/realm/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/roles/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/groups/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/users/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/clients/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/identity-providers/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/authentication-flows/"));
        assertThat(filePaths).anyMatch(path -> path.contains("/client-scopes/"));
        
        // Should have significant number of files
        assertThat(result.getFiles()).hasSizeGreaterThan(20);
    }

    @Test
    @DisplayName("Should handle special characters in resource names")
    void shouldHandleSpecialCharactersInResourceNames() {
        // Given
        RealmRepresentation realm = TestDataFactory.createSimpleRealm();
        realm.setRealm("realm-with-special@chars#test");

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        // File paths should have sanitized names
        List<String> filePaths = getFilePaths(result);
        assertThat(filePaths).anyMatch(path -> path.contains("realm-with-special_chars_test"));
        
        // Content should still contain original realm name
        ConversionResult.TerraformFile realmFile = findFileByPath(result, "realm/main.tf");
        assertThat(realmFile.getContent()).contains("realm-with-special@chars#test");
    }

    @Test
    @DisplayName("Should generate proper variable references between modules")
    void shouldGenerateProperVariableReferencesBetweenModules() {
        // Given
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        // Check realm outputs
        ConversionResult.TerraformFile realmOutputs = findFileByPath(result, "realm/outputs.tf");
        assertThat(realmOutputs.getContent()).contains("realm_id");
        assertThat(realmOutputs.getContent()).contains("realm_name");
        
        // Check variable usage in dependent modules
        ConversionResult.TerraformFile rolesFile = findFileByPath(result, "roles/main.tf");
        assertThat(rolesFile.getContent()).contains("var.realm_id");
        
        ConversionResult.TerraformFile groupsFile = findFileByPath(result, "groups/main.tf");
        assertThat(groupsFile.getContent()).contains("var.realm_id");
        
        // Check terragrunt dependencies
        ConversionResult.TerraformFile rolesTerragrunt = findFileByPath(result, "roles/terragrunt.hcl");
        assertThat(rolesTerragrunt.getContent()).contains("dependency \"realm\"");
        assertThat(rolesTerragrunt.getContent()).contains("dependency.realm.outputs.realm_id");
    }

    @Test
    @DisplayName("Should validate Terraform resource naming conventions")
    void shouldValidateTerraformResourceNamingConventions() {
        // Given
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        for (ConversionResult.TerraformFile file : result.getFiles()) {
            if (file.getType().equals("main")) {
                String content = file.getContent();
                
                // Check resource naming patterns
                if (content.contains("resource \"")) {
                    // Resource names should only contain valid characters
                    assertThat(content)
                        .as("File %s should not contain invalid resource names", file.getFilePath())
                        .doesNotContainPattern("resource \"[^\"]*\" \"[^a-zA-Z0-9_-]*\"");
                    
                    // Should not have empty resource names
                    assertThat(content)
                        .as("File %s should not contain empty resource names", file.getFilePath())
                        .doesNotContain("resource \"\" \"\"");
                }
            }
        }
    }

    @Test
    @DisplayName("Should generate consistent file sizes")
    void shouldGenerateConsistentFileSizes() {
        // Given
        RealmRepresentation realm = TestDataFactory.createComprehensiveRealm();

        // When
        ConversionResult result = terraformGeneratorService.generateTerragruntModules(realm, defaultOptions);

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        for (ConversionResult.TerraformFile file : result.getFiles()) {
            // File size should be reasonable (not 0, not extremely large)
            assertThat(file.getSize())
                .as("File %s should have reasonable size", file.getFilePath())
                .isGreaterThan(0)
                .isLessThan(100000); // 100KB max for any single file
            
            // Content length should roughly match reported size
            long actualSize = file.getContent().length();
            assertThat(actualSize)
                .as("File %s actual content size should be within reasonable range of reported size", file.getFilePath())
                .isBetween(file.getSize() / 2, file.getSize() * 2);
        }
    }

    // Helper methods
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