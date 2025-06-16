package com.keycloak.forge.service;

import com.keycloak.forge.model.ConversionRequest;
import com.keycloak.forge.model.ConversionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TerraformGeneratorService {
    
    public ConversionResult generateTerragruntModules(RealmRepresentation realm, ConversionRequest.ConversionOptions options) {
        log.info("Generating comprehensive Terragrunt modules for realm: {}", realm.getRealm());
        
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        String baseDir = "keycloak/realms/" + realm.getRealm();
        
        // Generate core realm module
        files.addAll(generateRealmModule(realm, baseDir + "/realm"));
        
        // Generate roles module
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null && !realm.getRoles().getRealm().isEmpty()) {
            files.addAll(generateRolesModule(realm, baseDir + "/roles"));
        }
        
        // Generate groups module
        if (realm.getGroups() != null && !realm.getGroups().isEmpty()) {
            files.addAll(generateGroupsModule(realm, baseDir + "/groups"));
        }
        
        // Generate users module
        if (realm.getUsers() != null && !realm.getUsers().isEmpty()) {
            files.addAll(generateUsersModule(realm, baseDir + "/users"));
        }
        
        // Generate clients module
        if (realm.getClients() != null && !realm.getClients().isEmpty()) {
            files.addAll(generateClientsModule(realm, baseDir + "/clients"));
        }
        
        // Generate identity providers module
        if (realm.getIdentityProviders() != null && !realm.getIdentityProviders().isEmpty()) {
            files.addAll(generateIdentityProvidersModule(realm, baseDir + "/identity-providers"));
        }
        
        // Generate authentication flows module
        if (realm.getAuthenticationFlows() != null && !realm.getAuthenticationFlows().isEmpty()) {
            files.addAll(generateAuthenticationFlowsModule(realm, baseDir + "/authentication-flows"));
        }
        
        // Generate client scopes module
        if (realm.getClientScopes() != null && !realm.getClientScopes().isEmpty()) {
            files.addAll(generateClientScopesModule(realm, baseDir + "/client-scopes"));
        }
        
        // Generate root terragrunt configuration
        files.add(generateRootTerragruntConfig(realm, baseDir));
        
        log.info("Generated {} Terragrunt files for realm: {}", files.size(), realm.getRealm());
        
        return ConversionResult.builder()
            .success(true)
            .files(files)
            .metadata(ConversionResult.ConversionMetadata.builder()
                .filesGenerated(files.size())
                .build())
            .build();
    }
    
    private List<ConversionResult.TerraformFile> generateRealmModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        // Main realm configuration
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateRealmMainContent(realm))
            .type("main")
            .size(2000L)
            .build());
            
        // Variables
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateRealmVariablesContent())
            .type("variables")
            .size(1000L)
            .build());
            
        // Outputs
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/outputs.tf")
            .content(generateRealmOutputsContent(realm))
            .type("outputs")
            .size(500L)
            .build());
            
        // Terragrunt config
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateRealmTerragruntConfig(realm))
            .type("terragrunt")
            .size(800L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateRolesModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateRolesMainContent(realm))
            .type("main")
            .size(5000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateRolesVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateRolesTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateGroupsModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateGroupsMainContent(realm))
            .type("main")
            .size(15000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateGroupsVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateGroupsTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateUsersModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateUsersMainContent(realm))
            .type("main")
            .size(10000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateUsersVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateUsersTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateClientsModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateClientsMainContent(realm))
            .type("main")
            .size(8000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateClientsVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateClientsTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateIdentityProvidersModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateIdentityProvidersMainContent(realm))
            .type("main")
            .size(6000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateIdentityProvidersVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateIdentityProvidersTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateAuthenticationFlowsModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateAuthenticationFlowsMainContent(realm))
            .type("main")
            .size(4000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateAuthenticationFlowsVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateAuthenticationFlowsTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private List<ConversionResult.TerraformFile> generateClientScopesModule(RealmRepresentation realm, String baseDir) {
        List<ConversionResult.TerraformFile> files = new ArrayList<>();
        
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/main.tf")
            .content(generateClientScopesMainContent(realm))
            .type("main")
            .size(3000L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/variables.tf")
            .content(generateClientScopesVariablesContent())
            .type("variables")
            .size(500L)
            .build());
            
        files.add(ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateClientScopesTerragruntConfig(realm))
            .type("terragrunt")
            .size(600L)
            .build());
            
        return files;
    }
    
    private ConversionResult.TerraformFile generateRootTerragruntConfig(RealmRepresentation realm, String baseDir) {
        return ConversionResult.TerraformFile.builder()
            .filePath(baseDir + "/terragrunt.hcl")
            .content(generateRootTerragruntContent(realm))
            .type("terragrunt")
            .size(1500L)
            .build();
    }
    
    // Content generation methods for Realm module
    private String generateRealmMainContent(RealmRepresentation realm) {
        return String.format("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            resource "keycloak_realm" "%s" {
              realm   = "%s"
              enabled = %s
              
              display_name = "%s"
              
              registration_allowed        = %s
              registration_email_as_username = false
              remember_me                = %s
              verify_email              = %s
              login_with_email_allowed  = %s
              duplicate_emails_allowed  = %s
              reset_password_allowed    = %s
              edit_username_allowed     = %s
              
              ssl_required = "%s"
              
              access_token_lifespan               = "%ds"
              sso_session_idle_timeout           = "%ds"
              sso_session_max_lifespan           = "%ds"
              offline_session_idle_timeout       = "%ds"
              offline_session_max_lifespan       = "%ds"
              offline_session_max_lifespan_enabled = %s
              access_code_lifespan               = "%ds"
              access_code_lifespan_user_action   = "%ds"
              access_code_lifespan_login         = "%ds"
              action_token_generated_by_admin_lifespan = "%ds"
              action_token_generated_by_user_lifespan  = "%ds"
              
              revoke_refresh_token     = %s
              refresh_token_max_reuse  = %d
              
              %s
              %s
              %s
            }
            """, 
            sanitizeTerraformName(realm.getRealm()),
            realm.getRealm(),
            realm.isEnabled(),
            realm.getDisplayName() != null ? realm.getDisplayName() : realm.getRealm(),
            realm.isRegistrationAllowed(),
            realm.isRememberMe(),
            realm.isVerifyEmail(),
            realm.isLoginWithEmailAllowed(),
            realm.isDuplicateEmailsAllowed(),
            realm.isResetPasswordAllowed(),
            realm.isEditUsernameAllowed(),
            realm.getSslRequired() != null ? realm.getSslRequired() : "none",
            realm.getAccessTokenLifespan() != null ? realm.getAccessTokenLifespan() : 300,
            realm.getSsoSessionIdleTimeout() != null ? realm.getSsoSessionIdleTimeout() : 1800,
            realm.getSsoSessionMaxLifespan() != null ? realm.getSsoSessionMaxLifespan() : 36000,
            realm.getOfflineSessionIdleTimeout() != null ? realm.getOfflineSessionIdleTimeout() : 2592000,
            realm.getOfflineSessionMaxLifespan() != null ? realm.getOfflineSessionMaxLifespan() : 5184000,
            realm.getOfflineSessionMaxLifespanEnabled() != null ? realm.getOfflineSessionMaxLifespanEnabled() : false,
            realm.getAccessCodeLifespan() != null ? realm.getAccessCodeLifespan() : 60,
            realm.getAccessCodeLifespanUserAction() != null ? realm.getAccessCodeLifespanUserAction() : 300,
            realm.getAccessCodeLifespanLogin() != null ? realm.getAccessCodeLifespanLogin() : 1800,
            realm.getActionTokenGeneratedByAdminLifespan() != null ? realm.getActionTokenGeneratedByAdminLifespan() : 43200,
            realm.getActionTokenGeneratedByUserLifespan() != null ? realm.getActionTokenGeneratedByUserLifespan() : 300,
            realm.getRevokeRefreshToken() != null ? realm.getRevokeRefreshToken() : false,
            realm.getRefreshTokenMaxReuse() != null ? realm.getRefreshTokenMaxReuse() : 0,
            generatePasswordPolicyBlock(realm),
            generateOtpPolicyBlock(realm),
            generateBrowserSecurityHeadersBlock(realm)
        );
    }
    
    private String generateRealmVariablesContent() {
        return """
            variable "keycloak_url" {
              description = "Keycloak server URL"
              type        = string
              default     = "http://localhost:8080"
            }
            
            variable "keycloak_admin_username" {
              description = "Keycloak admin username"
              type        = string
              default     = "admin"
            }
            
            variable "keycloak_admin_password" {
              description = "Keycloak admin password"
              type        = string
              sensitive   = true
            }
            
            variable "realm_name" {
              description = "Name of the Keycloak realm"
              type        = string
            }
            
            variable "realm_display_name" {
              description = "Display name of the Keycloak realm"
              type        = string
            }
            """;
    }
    
    private String generateRealmOutputsContent(RealmRepresentation realm) {
        return String.format("""
            output "realm_id" {
              description = "The ID of the created realm"
              value       = keycloak_realm.%s.id
            }
            
            output "realm_name" {
              description = "The name of the created realm"
              value       = keycloak_realm.%s.realm
            }
            
            output "realm_display_name" {
              description = "The display name of the created realm"
              value       = keycloak_realm.%s.display_name
            }
            """,
            sanitizeTerraformName(realm.getRealm()),
            sanitizeTerraformName(realm.getRealm()),
            sanitizeTerraformName(realm.getRealm())
        );
    }
    
    private String generateRealmTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_name         = "%s"
              realm_display_name = "%s"
            }
            """.formatted(realm.getRealm(), realm.getDisplayName());
    }
    
    // Content generation methods for Roles module
    private String generateRolesMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getRoles() != null && realm.getRoles().getRealm() != null) {
            for (RoleRepresentation role : realm.getRoles().getRealm()) {
                content.append(generateRoleResource(realm, role));
            }
        }
        
        return content.toString();
    }
    
    private String generateRoleResource(RealmRepresentation realm, RoleRepresentation role) {
        StringBuilder roleContent = new StringBuilder();
        String roleName = sanitizeTerraformName(role.getName());
        
        roleContent.append(String.format("""
            resource "keycloak_role" "%s" {
              realm_id    = var.realm_id
              name        = "%s"
              description = "%s"
              
            """, roleName, role.getName(), role.getDescription() != null ? role.getDescription() : ""));
            
        if (role.getAttributes() != null && !role.getAttributes().isEmpty()) {
            roleContent.append("  attributes = {\n");
            role.getAttributes().forEach((key, values) -> {
                if (values != null && !values.isEmpty()) {
                    roleContent.append(String.format("    %s = %s\n", key, 
                        values.size() == 1 ? "\"" + values.get(0) + "\"" : 
                        "[" + values.stream().map(v -> "\"" + v + "\"").collect(Collectors.joining(", ")) + "]"));
                }
            });
            roleContent.append("  }\n");
        }
        
        roleContent.append("}\n\n");
        
        if (role.isComposite() && role.getComposites() != null) {
            if (role.getComposites().getRealm() != null) {
                for (String compositeRole : role.getComposites().getRealm()) {
                    roleContent.append(String.format("""
                        resource "keycloak_role_composite" "%s_%s" {
                          realm_id    = var.realm_id
                          role_id     = keycloak_role.%s.id
                          realm_role  = "%s"
                          depends_on  = [keycloak_role.%s]
                        }
                        
                        """, 
                        roleName, 
                        sanitizeTerraformName(compositeRole),
                        roleName,
                        compositeRole,
                        sanitizeTerraformName(compositeRole)
                    ));
                }
            }
        }
        
        return roleContent.toString();
    }
    
    private String generateRolesVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateRolesTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Groups module
    private String generateGroupsMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getGroups() != null) {
            for (GroupRepresentation group : realm.getGroups()) {
                content.append(generateGroupResource(realm, group, null));
            }
        }
        
        return content.toString();
    }
    
    private String generateGroupResource(RealmRepresentation realm, GroupRepresentation group, String parentId) {
        StringBuilder groupContent = new StringBuilder();
        String groupName = sanitizeTerraformName(group.getName());
        String groupId = group.getId() != null ? sanitizeTerraformName(group.getId()) : groupName;
        
        groupContent.append(String.format("""
            resource "keycloak_group" "%s" {
              realm_id = var.realm_id
              name     = "%s"
              %s
              
            """, groupId, group.getName(), 
            parentId != null ? "parent_id = keycloak_group." + parentId + ".id" : ""));
            
        if (group.getAttributes() != null && !group.getAttributes().isEmpty()) {
            groupContent.append("  attributes = {\n");
            group.getAttributes().forEach((key, values) -> {
                if (values != null && !values.isEmpty()) {
                    groupContent.append(String.format("    %s = %s\n", key, 
                        values.size() == 1 ? "\"" + values.get(0) + "\"" : 
                        "[" + values.stream().map(v -> "\"" + v + "\"").collect(Collectors.joining(", ")) + "]"));
                }
            });
            groupContent.append("  }\n");
        }
        
        groupContent.append("}\n\n");
        
        // Generate role mappings for group
        if (group.getRealmRoles() != null) {
            for (String roleName : group.getRealmRoles()) {
                groupContent.append(String.format("""
                    resource "keycloak_group_roles" "%s_%s" {
                      realm_id = var.realm_id
                      group_id = keycloak_group.%s.id
                      role_ids = [var.realm_role_%s_id]
                    }
                    
                    """, 
                    groupId, 
                    sanitizeTerraformName(roleName),
                    groupId,
                    sanitizeTerraformName(roleName)
                ));
            }
        }
        
        // Generate subgroups
        if (group.getSubGroups() != null) {
            for (GroupRepresentation subGroup : group.getSubGroups()) {
                groupContent.append(generateGroupResource(realm, subGroup, groupId));
            }
        }
        
        return groupContent.toString();
    }
    
    private String generateGroupsVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateGroupsTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            dependency "roles" {
              config_path = "../roles"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Users module
    private String generateUsersMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getUsers() != null) {
            for (UserRepresentation user : realm.getUsers()) {
                content.append(generateUserResource(realm, user));
            }
        }
        
        return content.toString();
    }
    
    private String generateUserResource(RealmRepresentation realm, UserRepresentation user) {
        StringBuilder userContent = new StringBuilder();
        String userName = sanitizeTerraformName(user.getUsername());
        
        userContent.append(String.format("""
            resource "keycloak_user" "%s" {
              realm_id   = var.realm_id
              username   = "%s"
              enabled    = %s
              
              email      = "%s"
              first_name = "%s"
              last_name  = "%s"
              
            """, userName, 
            user.getUsername(),
            user.isEnabled(),
            user.getEmail() != null ? user.getEmail() : "",
            user.getFirstName() != null ? user.getFirstName() : "",
            user.getLastName() != null ? user.getLastName() : ""));
            
        if (user.getAttributes() != null && !user.getAttributes().isEmpty()) {
            userContent.append("  attributes = {\n");
            user.getAttributes().forEach((key, values) -> {
                if (values != null && !values.isEmpty()) {
                    userContent.append(String.format("    %s = %s\n", key, 
                        values.size() == 1 ? "\"" + values.get(0) + "\"" : 
                        "[" + values.stream().map(v -> "\"" + v + "\"").collect(Collectors.joining(", ")) + "]"));
                }
            });
            userContent.append("  }\n");
        }
        
        userContent.append("}\n\n");
        
        // Generate user group memberships
        if (user.getGroups() != null) {
            for (String groupPath : user.getGroups()) {
                String groupName = sanitizeTerraformName(groupPath.replaceAll("/", "_"));
                userContent.append(String.format("""
                    resource "keycloak_user_groups" "%s_%s" {
                      realm_id = var.realm_id
                      user_id  = keycloak_user.%s.id
                      group_ids = [var.group_%s_id]
                    }
                    
                    """, 
                    userName, 
                    groupName,
                    userName,
                    groupName
                ));
            }
        }
        
        return userContent.toString();
    }
    
    private String generateUsersVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateUsersTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            dependency "groups" {
              config_path = "../groups"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Clients module
    private String generateClientsMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getClients() != null) {
            for (ClientRepresentation client : realm.getClients()) {
                content.append(generateClientResource(realm, client));
            }
        }
        
        return content.toString();
    }
    
    private String generateClientResource(RealmRepresentation realm, ClientRepresentation client) {
        StringBuilder clientContent = new StringBuilder();
        String clientName = sanitizeTerraformName(client.getClientId());
        
        clientContent.append(String.format("""
            resource "keycloak_openid_client" "%s" {
              realm_id    = var.realm_id
              client_id   = "%s"
              name        = "%s"
              description = "%s"
              
              enabled                      = %s
              standard_flow_enabled        = %s
              implicit_flow_enabled        = %s
              direct_access_grants_enabled = %s
              service_accounts_enabled     = %s
              
              access_type = "%s"
              
            """, clientName,
            client.getClientId(),
            client.getName() != null ? client.getName() : client.getClientId(),
            client.getDescription() != null ? client.getDescription() : "",
            client.isEnabled(),
            client.isStandardFlowEnabled(),
            client.isImplicitFlowEnabled(),
            client.isDirectAccessGrantsEnabled(),
            client.isServiceAccountsEnabled(),
            determineAccessType(client)));
            
        if (client.getRedirectUris() != null && !client.getRedirectUris().isEmpty()) {
            clientContent.append("  valid_redirect_uris = [\n");
            for (String uri : client.getRedirectUris()) {
                clientContent.append(String.format("    \"%s\",\n", uri));
            }
            clientContent.append("  ]\n");
        }
        
        if (client.getWebOrigins() != null && !client.getWebOrigins().isEmpty()) {
            clientContent.append("  web_origins = [\n");
            for (String origin : client.getWebOrigins()) {
                clientContent.append(String.format("    \"%s\",\n", origin));
            }
            clientContent.append("  ]\n");
        }
        
        clientContent.append("}\n\n");
        
        // Generate protocol mappers
        if (client.getProtocolMappers() != null) {
            for (ProtocolMapperRepresentation mapper : client.getProtocolMappers()) {
                clientContent.append(generateProtocolMapperResource(clientName, mapper));
            }
        }
        
        return clientContent.toString();
    }
    
    private String generateProtocolMapperResource(String clientName, ProtocolMapperRepresentation mapper) {
        String mapperName = sanitizeTerraformName(mapper.getName());
        
        return String.format("""
            resource "keycloak_openid_user_attribute_protocol_mapper" "%s_%s" {
              realm_id  = var.realm_id
              client_id = keycloak_openid_client.%s.id
              name      = "%s"
              
              user_attribute   = "%s"
              claim_name       = "%s"
              claim_value_type = "%s"
              
              add_to_id_token     = %s
              add_to_access_token = %s
              add_to_userinfo     = %s
            }
            
            """,
            clientName,
            mapperName,
            clientName,
            mapper.getName(),
            mapper.getConfig() != null ? mapper.getConfig().getOrDefault("user.attribute", "") : "",
            mapper.getConfig() != null ? mapper.getConfig().getOrDefault("claim.name", "") : "",
            mapper.getConfig() != null ? mapper.getConfig().getOrDefault("jsonType.label", "String") : "String",
            mapper.getConfig() != null ? Boolean.parseBoolean(mapper.getConfig().getOrDefault("id.token.claim", "false")) : false,
            mapper.getConfig() != null ? Boolean.parseBoolean(mapper.getConfig().getOrDefault("access.token.claim", "false")) : false,
            mapper.getConfig() != null ? Boolean.parseBoolean(mapper.getConfig().getOrDefault("userinfo.token.claim", "false")) : false
        );
    }
    
    private String generateClientsVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateClientsTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Identity Providers module
    private String generateIdentityProvidersMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getIdentityProviders() != null) {
            for (IdentityProviderRepresentation idp : realm.getIdentityProviders()) {
                content.append(generateIdentityProviderResource(realm, idp));
            }
        }
        
        return content.toString();
    }
    
    private String generateIdentityProviderResource(RealmRepresentation realm, IdentityProviderRepresentation idp) {
        String idpName = sanitizeTerraformName(idp.getAlias());
        
        return String.format("""
            resource "keycloak_oidc_identity_provider" "%s" {
              realm             = var.realm_id
              alias             = "%s"
              display_name      = "%s"
              enabled           = %s
              store_token       = %s
              trust_email       = %s
              first_broker_login_flow_alias = "%s"
              
              authorization_url = "%s"
              token_url         = "%s"
              client_id         = "%s"
              client_secret     = "%s"
              
              extra_config = {
            %s
              }
            }
            
            """,
            idpName,
            idp.getAlias(),
            idp.getDisplayName() != null ? idp.getDisplayName() : idp.getAlias(),
            idp.isEnabled(),
            idp.isStoreToken(),
            idp.isTrustEmail(),
            idp.getFirstBrokerLoginFlowAlias() != null ? idp.getFirstBrokerLoginFlowAlias() : "first broker login",
            idp.getConfig() != null ? idp.getConfig().getOrDefault("authorizationUrl", "") : "",
            idp.getConfig() != null ? idp.getConfig().getOrDefault("tokenUrl", "") : "",
            idp.getConfig() != null ? idp.getConfig().getOrDefault("clientId", "") : "",
            idp.getConfig() != null ? idp.getConfig().getOrDefault("clientSecret", "") : "",
            generateIdpExtraConfig(idp)
        );
    }
    
    private String generateIdpExtraConfig(IdentityProviderRepresentation idp) {
        if (idp.getConfig() == null) return "";
        
        StringBuilder config = new StringBuilder();
        idp.getConfig().forEach((key, value) -> {
            if (!Arrays.asList("authorizationUrl", "tokenUrl", "clientId", "clientSecret").contains(key)) {
                config.append(String.format("    %s = \"%s\"\n", key, value));
            }
        });
        
        return config.toString();
    }
    
    private String generateIdentityProvidersVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateIdentityProvidersTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Authentication Flows module
    private String generateAuthenticationFlowsMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getAuthenticationFlows() != null) {
            for (AuthenticationFlowRepresentation flow : realm.getAuthenticationFlows()) {
                if (!flow.isBuiltIn()) {
                    content.append(generateAuthenticationFlowResource(realm, flow));
                }
            }
        }
        
        return content.toString();
    }
    
    private String generateAuthenticationFlowResource(RealmRepresentation realm, AuthenticationFlowRepresentation flow) {
        String flowName = sanitizeTerraformName(flow.getAlias());
        
        return String.format("""
            resource "keycloak_authentication_flow" "%s" {
              realm_id    = var.realm_id
              alias       = "%s"
              description = "%s"
              provider_id = "%s"
              top_level   = %s
            }
            
            """,
            flowName,
            flow.getAlias(),
            flow.getDescription() != null ? flow.getDescription() : "",
            flow.getProviderId() != null ? flow.getProviderId() : "basic-flow",
            flow.isTopLevel()
        );
    }
    
    private String generateAuthenticationFlowsVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateAuthenticationFlowsTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Content generation methods for Client Scopes module
    private String generateClientScopesMainContent(RealmRepresentation realm) {
        StringBuilder content = new StringBuilder();
        content.append("""
            terraform {
              required_providers {
                keycloak = {
                  source  = "keycloak/keycloak"
                  version = "~> 5.0"
                }
              }
            }
            
            """);
            
        if (realm.getClientScopes() != null) {
            for (ClientScopeRepresentation scope : realm.getClientScopes()) {
                content.append(generateClientScopeResource(realm, scope));
            }
        }
        
        return content.toString();
    }
    
    private String generateClientScopeResource(RealmRepresentation realm, ClientScopeRepresentation scope) {
        String scopeName = sanitizeTerraformName(scope.getName());
        
        return String.format("""
            resource "keycloak_openid_client_scope" "%s" {
              realm_id    = var.realm_id
              name        = "%s"
              description = "%s"
              
              consent_screen_text = "%s"
              include_in_token_scope = %s
            }
            
            """,
            scopeName,
            scope.getName(),
            scope.getDescription() != null ? scope.getDescription() : "",
            scope.getAttributes() != null ? scope.getAttributes().getOrDefault("consent.screen.text", "") : "",
            scope.getAttributes() != null ? Boolean.parseBoolean(scope.getAttributes().getOrDefault("include.in.token.scope", "true")) : true
        );
    }
    
    private String generateClientScopesVariablesContent() {
        return """
            variable "realm_id" {
              description = "The ID of the realm"
              type        = string
            }
            """;
    }
    
    private String generateClientScopesTerragruntConfig(RealmRepresentation realm) {
        return """
            include "root" {
              path = find_in_parent_folders()
            }
            
            dependency "realm" {
              config_path = "../realm"
            }
            
            terraform {
              source = "."
            }
            
            inputs = {
              realm_id = dependency.realm.outputs.realm_id
            }
            """;
    }
    
    // Root Terragrunt configuration
    private String generateRootTerragruntContent(RealmRepresentation realm) {
        return String.format("""
            include "root" {
              path = find_in_parent_folders()
            }
            
            # Dependencies between modules
            dependencies {
              paths = ["./realm"]
            }
            
            # Realm: %s
            # Generated modules:
            # - realm: Core realm configuration
            # - roles: Realm roles and composite roles
            # - groups: Group hierarchy and role assignments
            # - users: User accounts and group memberships
            # - clients: OAuth/OIDC clients and protocol mappers
            # - identity-providers: External identity providers
            # - authentication-flows: Custom authentication flows
            # - client-scopes: Reusable client scopes
            """, realm.getRealm());
    }
    
    // Helper methods
    private String sanitizeTerraformName(String name) {
        if (name == null) return "unknown";
        return name.replaceAll("[^a-zA-Z0-9_-]", "_").toLowerCase();
    }
    
    private String determineAccessType(ClientRepresentation client) {
        if (client.isPublicClient()) return "PUBLIC";
        if (client.isBearerOnly()) return "BEARER-ONLY";
        return "CONFIDENTIAL";
    }
    
    private String generatePasswordPolicyBlock(RealmRepresentation realm) {
        if (realm.getPasswordPolicy() == null || realm.getPasswordPolicy().isEmpty()) {
            return "";
        }
        
        return String.format("""
            password_policy = "%s"
            """, realm.getPasswordPolicy());
    }
    
    private String generateOtpPolicyBlock(RealmRepresentation realm) {
        if (realm.getOtpPolicyType() == null) {
            return "";
        }
        
        return String.format("""
            otp_policy {
              type                     = "%s"
              algorithm                = "%s"
              digits                   = %d
              initial_counter          = %d
              look_ahead_window        = %d
              period                   = %d
            }
            """,
            realm.getOtpPolicyType(),
            realm.getOtpPolicyAlgorithm() != null ? realm.getOtpPolicyAlgorithm() : "HmacSHA1",
            realm.getOtpPolicyDigits() != null ? realm.getOtpPolicyDigits() : 6,
            realm.getOtpPolicyInitialCounter() != null ? realm.getOtpPolicyInitialCounter() : 0,
            realm.getOtpPolicyLookAheadWindow() != null ? realm.getOtpPolicyLookAheadWindow() : 1,
            realm.getOtpPolicyPeriod() != null ? realm.getOtpPolicyPeriod() : 30
        );
    }
    
    private String generateBrowserSecurityHeadersBlock(RealmRepresentation realm) {
        if (realm.getBrowserSecurityHeaders() == null || realm.getBrowserSecurityHeaders().isEmpty()) {
            return "";
        }
        
        StringBuilder headers = new StringBuilder();
        headers.append("browser_security_headers {\n");
        
        realm.getBrowserSecurityHeaders().forEach((key, value) -> {
            headers.append(String.format("    %s = \"%s\"\n", 
                key.replaceAll("([A-Z])", "_$1").toLowerCase(), value));
        });
        
        headers.append("  }");
        
        return headers.toString();
    }
}