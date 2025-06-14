
export interface TerraformFile {
  filePath: string;
  content: string;
}

export function isValidKeycloakJson(data: any): boolean {
  return data && typeof data === 'object' && data.realm;
}

export function keycloakRealmJsonToTerragrunt(realmData: any, fileName: string): TerraformFile[] {
  const files: TerraformFile[] = [];
  const realmName = realmData.realm || 'imported-realm';
  const sanitizedRealmName = realmName.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Main terragrunt.hcl file
  files.push({
    filePath: `${sanitizedRealmName}/terragrunt.hcl`,
    content: generateMainTerragruntConfig(sanitizedRealmName)
  });

  // Core realm configuration
  files.push({
    filePath: `${sanitizedRealmName}/realm/terragrunt.hcl`,
    content: generateRealmTerragruntConfig(sanitizedRealmName)
  });

  files.push({
    filePath: `${sanitizedRealmName}/realm/main.tf`,
    content: generateRealmTerraform(realmData)
  });

  // Client Scopes module (separate from clients)
  if (realmData.clientScopes && realmData.clientScopes.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/client_scopes/terragrunt.hcl`,
      content: generateClientScopesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/client_scopes/main.tf`,
      content: generateClientScopesTerraform(realmData.clientScopes, realmName)
    });
  }

  // Default Client Scopes module
  if (realmData.defaultDefaultClientScopes || realmData.defaultOptionalClientScopes) {
    files.push({
      filePath: `${sanitizedRealmName}/default_client_scopes/terragrunt.hcl`,
      content: generateDefaultClientScopesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/default_client_scopes/main.tf`,
      content: generateDefaultClientScopesTerraform(realmData, realmName)
    });
  }

  // Users module
  if (realmData.users && realmData.users.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/users/terragrunt.hcl`,
      content: generateUsersTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/users/main.tf`,
      content: generateUsersTerraform(realmData.users, realmName)
    });
  }

  // Clients module
  if (realmData.clients && realmData.clients.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/clients/terragrunt.hcl`,
      content: generateClientsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/clients/main.tf`,
      content: generateClientsTerraform(realmData.clients, realmName)
    });

    // Generate separate protocol mapper files for complex clients
    realmData.clients.forEach((client: any, index: number) => {
      if (client.protocolMappers && client.protocolMappers.length > 5) {
        const sanitizedClientId = client.clientId.replace(/[^a-zA-Z0-9_]/g, '_');
        files.push({
          filePath: `${sanitizedRealmName}/clients/protocol_mappers_${sanitizedClientId}.tf`,
          content: generateClientProtocolMappersTerraform(client, realmName)
        });
      }
    });
  }

  // Roles module
  if (realmData.roles && (realmData.roles.realm || realmData.roles.client)) {
    files.push({
      filePath: `${sanitizedRealmName}/roles/terragrunt.hcl`,
      content: generateRolesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/roles/main.tf`,
      content: generateRolesTerraform(realmData.roles, realmName)
    });
  }

  // Composite Roles module (if there are composite roles)
  if (realmData.roles && hasCompositeRoles(realmData.roles)) {
    files.push({
      filePath: `${sanitizedRealmName}/composite_roles/terragrunt.hcl`,
      content: generateCompositeRolesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/composite_roles/main.tf`,
      content: generateCompositeRolesTerraform(realmData.roles, realmName)
    });
  }

  // Groups module
  if (realmData.groups && realmData.groups.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/groups/terragrunt.hcl`,
      content: generateGroupsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/groups/main.tf`,
      content: generateGroupsTerraform(realmData.groups, realmName)
    });
  }

  // Scope Mappings module
  if (hasRoleScopeMappings(realmData)) {
    files.push({
      filePath: `${sanitizedRealmName}/scope_mappings/terragrunt.hcl`,
      content: generateScopeMappingsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/scope_mappings/main.tf`,
      content: generateScopeMappingsTerraform(realmData, realmName)
    });
  }

  // Identity Providers module
  if (realmData.identityProviders && realmData.identityProviders.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/identity_providers/terragrunt.hcl`,
      content: generateIdpTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/identity_providers/main.tf`,
      content: generateIdpTerraform(realmData.identityProviders, realmName)
    });

    // Separate files for complex IdP mappers
    realmData.identityProviders.forEach((idp: any) => {
      if (idp.mappers && idp.mappers.length > 3) {
        const sanitizedIdpAlias = idp.alias.replace(/[^a-zA-Z0-9_]/g, '_');
        files.push({
          filePath: `${sanitizedRealmName}/identity_providers/mappers_${sanitizedIdpAlias}.tf`,
          content: generateIdpMappersTerraform(idp, realmName)
        });
      }
    });
  }

  // Authentication Flows module
  if (realmData.authenticationFlows && realmData.authenticationFlows.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/auth_flows/terragrunt.hcl`,
      content: generateAuthFlowsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/auth_flows/main.tf`,
      content: generateAuthFlowsTerraform(realmData.authenticationFlows, realmName)
    });
  }

  // Authentication Bindings module
  if (realmData.browserFlow || realmData.registrationFlow || realmData.directGrantFlow) {
    files.push({
      filePath: `${sanitizedRealmName}/auth_bindings/terragrunt.hcl`,
      content: generateAuthBindingsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/auth_bindings/main.tf`,
      content: generateAuthBindingsTerraform(realmData, realmName)
    });
  }

  // Required Actions module
  if (realmData.requiredActions && realmData.requiredActions.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/required_actions/terragrunt.hcl`,
      content: generateRequiredActionsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/required_actions/main.tf`,
      content: generateRequiredActionsTerraform(realmData.requiredActions, realmName)
    });
  }

  // User Federation module
  if (realmData.components && Object.keys(realmData.components).length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/user_federation/terragrunt.hcl`,
      content: generateUserFederationTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/user_federation/main.tf`,
      content: generateUserFederationTerraform(realmData.components, realmName)
    });

    // Separate files for federation mappers
    if (realmData.components['org.keycloak.storage.UserStorageProvider']) {
      realmData.components['org.keycloak.storage.UserStorageProvider'].forEach((provider: any, index: number) => {
        const sanitizedProviderName = (provider.name || `provider_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
        files.push({
          filePath: `${sanitizedRealmName}/user_federation/mappers_${sanitizedProviderName}.tf`,
          content: generateUserFederationMappersTerraform(provider, realmName)
        });
      });
    }
  }

  // Client Policies module
  if (realmData.clientPolicies || realmData.clientProfiles) {
    files.push({
      filePath: `${sanitizedRealmName}/client_policies/terragrunt.hcl`,
      content: generateClientPoliciesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/client_policies/main.tf`,
      content: generateClientPoliciesTerraform(realmData, realmName)
    });
  }

  // Custom Themes module
  if (realmData.loginTheme || realmData.accountTheme || realmData.adminTheme || realmData.emailTheme) {
    files.push({
      filePath: `${sanitizedRealmName}/themes/terragrunt.hcl`,
      content: generateThemesTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/themes/main.tf`,
      content: generateThemesTerraform(realmData, realmName)
    });
  }

  // Localization module
  if (realmData.internationalizationEnabled && realmData.supportedLocales) {
    files.push({
      filePath: `${sanitizedRealmName}/localization/terragrunt.hcl`,
      content: generateLocalizationTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/localization/main.tf`,
      content: generateLocalizationTerraform(realmData, realmName)
    });
  }

  // Security Policies module
  files.push({
    filePath: `${sanitizedRealmName}/security_policies/terragrunt.hcl`,
    content: generateSecurityPoliciesTerragruntConfig(sanitizedRealmName)
  });
  files.push({
    filePath: `${sanitizedRealmName}/security_policies/main.tf`,
    content: generateSecurityPoliciesTerraform(realmData, realmName)
  });

  // Events Configuration module
  files.push({
    filePath: `${sanitizedRealmName}/events/terragrunt.hcl`,
    content: generateEventsTerragruntConfig(sanitizedRealmName)
  });
  files.push({
    filePath: `${sanitizedRealmName}/events/main.tf`,
    content: generateEventsTerraform(realmData, realmName)
  });

  // OTP Policy module
  if (realmData.otpPolicyType) {
    files.push({
      filePath: `${sanitizedRealmName}/otp_policy/terragrunt.hcl`,
      content: generateOTPPolicyTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/otp_policy/main.tf`,
      content: generateOTPPolicyTerraform(realmData, realmName)
    });
  }

  // WebAuthn Policy module
  if (realmData.webAuthnPolicyRpEntityName) {
    files.push({
      filePath: `${sanitizedRealmName}/webauthn_policy/terragrunt.hcl`,
      content: generateWebAuthnPolicyTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/webauthn_policy/main.tf`,
      content: generateWebAuthnPolicyTerraform(realmData, realmName)
    });
  }

  // Keys and Certificates module
  if (realmData.publicKey || realmData.certificate || realmData.privateKey) {
    files.push({
      filePath: `${sanitizedRealmName}/realm_keys/terragrunt.hcl`,
      content: generateRealmKeysTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/realm_keys/main.tf`,
      content: generateRealmKeysTerraform(realmData, realmName)
    });
  }

  // Required Credentials module
  if (realmData.requiredCredentials && realmData.requiredCredentials.length > 0) {
    files.push({
      filePath: `${sanitizedRealmName}/required_credentials/terragrunt.hcl`,
      content: generateRequiredCredentialsTerragruntConfig(sanitizedRealmName)
    });
    files.push({
      filePath: `${sanitizedRealmName}/required_credentials/main.tf`,
      content: generateRequiredCredentialsTerraform(realmData.requiredCredentials, realmName)
    });
  }

  return files;
}

function generateMainTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} Keycloak realm
terraform {
  source = ".//"
}

# Configure OpenTofu provider versions
generate "versions" {
  path      = "versions.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.6"
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.4"
    }
  }
}
EOF
}

# Configure provider
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "keycloak" {
  client_id     = var.keycloak_client_id
  client_secret = var.keycloak_client_secret
  url           = var.keycloak_url
  realm         = var.keycloak_admin_realm
}
EOF
}

# Input variables
inputs = {
  realm_name = "${realmName}"
}
`;
}

function generateRealmTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} realm
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../"
}

inputs = {
  realm_name = dependency.realm.outputs.realm_name
}
`;
}

function generateRealmTerraform(realmData: any): string {
  const realmName = realmData.realm || 'imported-realm';
  
  return `# Main realm configuration
variable "realm_name" {
  description = "Name of the Keycloak realm"
  type        = string
  default     = "${realmName}"
}

variable "keycloak_client_id" {
  description = "Keycloak admin client ID"
  type        = string
}

variable "keycloak_client_secret" {
  description = "Keycloak admin client secret"
  type        = string
  sensitive   = true
}

variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
}

variable "keycloak_admin_realm" {
  description = "Keycloak admin realm"
  type        = string
  default     = "master"
}

resource "keycloak_realm" "realm" {
  realm                               = var.realm_name
  enabled                            = ${realmData.enabled !== false}
  display_name                       = "${realmData.displayName || realmName}"
  display_name_html                  = "${realmData.displayNameHtml || ''}"
  
  # User registration and management
  registration_allowed               = ${realmData.registrationAllowed || false}
  registration_email_as_username     = ${realmData.registrationEmailAsUsername || false}
  edit_username_allowed              = ${realmData.editUsernameAllowed || false}
  reset_password_allowed             = ${realmData.resetPasswordAllowed || false}
  remember_me                        = ${realmData.rememberMe || false}
  verify_email                       = ${realmData.verifyEmail || false}
  login_with_email_allowed          = ${realmData.loginWithEmailAllowed || false}
  duplicate_emails_allowed          = ${realmData.duplicateEmailsAllowed || false}
  
  # SSL and security
  ssl_required                       = "${realmData.sslRequired || 'external'}"
  
  # Password policy
  ${realmData.passwordPolicy ? `password_policy = "${realmData.passwordPolicy}"` : ''}
  
  # Internationalization
  ${realmData.internationalizationEnabled ? `
  internationalization {
    supported_locales = ${JSON.stringify(realmData.supportedLocales || ['en'])}
    default_locale    = "${realmData.defaultLocale || 'en'}"
  }` : ''}
  
  # Security defenses
  ${generateSecurityDefenses(realmData)}
  
  # SMTP configuration
  ${generateSmtpConfig(realmData)}
  
  # Custom attributes
  ${generateCustomAttributes(realmData)}
  
  # Browser security headers
  ${generateBrowserSecurityHeaders(realmData)}
}

output "realm_id" {
  description = "ID of the created realm"
  value       = keycloak_realm.realm.id
}

output "realm_name" {
  description = "Name of the created realm"
  value       = keycloak_realm.realm.realm
}
`;
}

function generateClientScopesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} client scopes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientScopesTerraform(clientScopes: any[], realmName: string): string {
  let terraform = `# Client Scopes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  clientScopes.forEach((scope, index) => {
    const sanitizedScopeName = (scope.name || `scope_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_openid_client_scope" "${sanitizedScopeName}" {
  realm_id               = var.realm_id
  name                   = "${scope.name || `scope_${index}`}"
  description            = "${scope.description || ''}"
  consent_screen_text    = "${scope.consentScreenText || ''}"
  include_in_token_scope = ${scope.includeInTokenScope !== false}
  gui_order              = ${scope.guiOrder || index}
}
`;

    // Generate protocol mappers for the client scope
    if (scope.protocolMappers && scope.protocolMappers.length > 0) {
      scope.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedScopeName}_${sanitizedMapperName}" {
  realm_id        = var.realm_id
  client_scope_id = keycloak_openid_client_scope.${sanitizedScopeName}.id
  name            = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
      });
    }
  });

  return terraform;
}

function generateDefaultClientScopesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} default client scopes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "client_scopes" {
  config_path = "../client_scopes"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateDefaultClientScopesTerraform(realmData: any, realmName: string): string {
  return `# Default Client Scopes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Default default client scopes
${realmData.defaultDefaultClientScopes ? `
resource "keycloak_default_default_client_scopes" "default_scopes" {
  realm_id = var.realm_id
  
  default_scopes = [
    ${realmData.defaultDefaultClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
` : ''}

# Default optional client scopes
${realmData.defaultOptionalClientScopes ? `
resource "keycloak_default_optional_client_scopes" "optional_scopes" {
  realm_id = var.realm_id
  
  optional_scopes = [
    ${realmData.defaultOptionalClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
` : ''}
`;
}

function generateUsersTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} users
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateUsersTerraform(users: any[], realmName: string): string {
  let terraform = `# Users configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  users.forEach((user, index) => {
    const userId = user.username || `user_${index}`;
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_user" "${sanitizedUserId}" {
  realm_id   = var.realm_id
  username   = "${user.username || ''}"
  enabled    = ${user.enabled !== false}
  
  email      = "${user.email || ''}"
  first_name = "${user.firstName || ''}"
  last_name  = "${user.lastName || ''}"
  
  ${user.emailVerified !== undefined ? `email_verified = ${user.emailVerified}` : ''}
  
  ${user.attributes ? `
  attributes = {
    ${Object.entries(user.attributes).map(([key, value]) => 
      `${key} = ${Array.isArray(value) ? JSON.stringify(value) : `"${value}"`}`
    ).join('\n    ')}
  }` : ''}
  
  ${user.requiredActions && user.requiredActions.length > 0 ? `
  required_actions = ${JSON.stringify(user.requiredActions)}` : ''}
  
  ${user.credentials && user.credentials.length > 0 ? `
  initial_password {
    value     = "temp-password-${index}"
    temporary = true
  }` : ''}
}
`;

    // Generate user group memberships
    if (user.groups && user.groups.length > 0) {
      user.groups.forEach((group: string, groupIndex: number) => {
        const sanitizedGroupName = group.replace(/[^a-zA-Z0-9_]/g, '_');
        terraform += `
resource "keycloak_user_groups" "${sanitizedUserId}_group_${groupIndex}" {
  realm_id = var.realm_id
  user_id  = keycloak_user.${sanitizedUserId}.id
  group_ids = [
    # Reference to group: ${group}
    # This needs to be updated with actual group resource reference
  ]
}
`;
      });
    }

    // Generate user role mappings
    if (user.realmRoles && user.realmRoles.length > 0) {
      terraform += `
resource "keycloak_user_roles" "${sanitizedUserId}_realm_roles" {
  realm_id = var.realm_id
  user_id  = keycloak_user.${sanitizedUserId}.id
  role_ids = [
    # Realm roles: ${user.realmRoles.join(', ')}
    # These need to be updated with actual role resource references
  ]
}
`;
    }
  });

  return terraform;
}

function generateClientsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} clients
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientsTerraform(clients: any[], realmName: string): string {
  let terraform = `# Clients configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  clients.forEach((client, index) => {
    if (!client.clientId) return;
    
    const sanitizedClientId = client.clientId.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id    = var.realm_id
  client_id   = "${client.clientId}"
  name        = "${client.name || client.clientId}"
  description = "${client.description || ''}"
  
  enabled                      = ${client.enabled !== false}
  access_type                  = "${client.publicClient ? 'PUBLIC' : (client.bearerOnly ? 'BEARER-ONLY' : 'CONFIDENTIAL')}"
  service_accounts_enabled     = ${client.serviceAccountsEnabled || false}
  direct_access_grants_enabled = ${client.directAccessGrantsEnabled !== false}
  standard_flow_enabled        = ${client.standardFlowEnabled !== false}
  implicit_flow_enabled        = ${client.implicitFlowEnabled || false}
  
  ${client.rootUrl ? `root_url = "${client.rootUrl}"` : ''}
  ${client.baseUrl ? `base_url = "${client.baseUrl}"` : ''}
  ${client.adminUrl ? `admin_url = "${client.adminUrl}"` : ''}
  
  ${client.redirectUris && client.redirectUris.length > 0 ? `
  valid_redirect_uris = ${JSON.stringify(client.redirectUris)}` : ''}
  
  ${client.webOrigins && client.webOrigins.length > 0 ? `
  web_origins = ${JSON.stringify(client.webOrigins)}` : ''}
  
  ${client.attributes ? `
  extra_config = {
    ${Object.entries(client.attributes).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
  
  # Authentication and authorization settings
  ${client.consentRequired !== undefined ? `consent_required = ${client.consentRequired}` : ''}
  ${client.fullScopeAllowed !== undefined ? `full_scope_allowed = ${client.fullScopeAllowed}` : ''}
  
  # Advanced settings
  access_token_lifespan               = "${client.attributes?.['access.token.lifespan'] || ''}"
  client_session_idle_timeout         = "${client.attributes?.['client.session.idle.timeout'] || ''}"
  client_session_max_lifespan         = "${client.attributes?.['client.session.max.lifespan'] || ''}"
}
`;

    // Generate client scopes (only basic ones, complex ones go to separate file)
    if (client.defaultClientScopes && client.defaultClientScopes.length > 0) {
      terraform += `
# Default client scopes for ${client.clientId}
resource "keycloak_openid_client_default_scopes" "${sanitizedClientId}_default_scopes" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  
  default_scopes = [
    ${client.defaultClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
`;
    }

    // Generate optional client scopes
    if (client.optionalClientScopes && client.optionalClientScopes.length > 0) {
      terraform += `
# Optional client scopes for ${client.clientId}
resource "keycloak_openid_client_optional_scopes" "${sanitizedClientId}_optional_scopes" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  
  optional_scopes = [
    ${client.optionalClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
`;
    }

    // Generate simple protocol mappers (complex ones go to separate file)
    if (client.protocolMappers && client.protocolMappers.length > 0 && client.protocolMappers.length <= 5) {
      client.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedClientId}_${sanitizedMapperName}" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  name      = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
      });
    }

    // Generate client roles
    if (client.roles && Object.keys(client.roles).length > 0) {
      Object.entries(client.roles).forEach(([roleName, roleData]: [string, any]) => {
        const sanitizedRoleName = roleName.replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_role" "${sanitizedClientId}_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  client_id   = keycloak_openid_client.${sanitizedClientId}.id
  name        = "${roleName}"
  description = "${roleData?.description || ''}"
}
`;
      });
    }
  });

  return terraform;
}

function generateClientProtocolMappersTerraform(client: any, realmName: string): string {
  const sanitizedClientId = client.clientId.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# Protocol Mappers for client: ${client.clientId}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  if (client.protocolMappers && client.protocolMappers.length > 0) {
    client.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
      const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedClientId}_${sanitizedMapperName}" {
  realm_id  = var.realm_id
  client_id = data.keycloak_openid_client.${sanitizedClientId}.id
  name      = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
    });
  }

  // Add data source to reference the client
  terraform = `# Data source for client reference
data "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id  = var.realm_id
  client_id = "${client.clientId}"
}

${terraform}`;

  return terraform;
}

function generateRolesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} roles
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRolesTerraform(roles: any, realmName: string): string {
  let terraform = `# Roles configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Realm roles
  if (roles.realm && roles.realm.length > 0) {
    roles.realm.forEach((role: any) => {
      const sanitizedRoleName = role.name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_role" "realm_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  name        = "${role.name}"
  description = "${role.description || ''}"
}
`;
    });
  }

  return terraform;
}

function hasCompositeRoles(roles: any): boolean {
  if (roles.realm) {
    return roles.realm.some((role: any) => role.composite);
  }
  return false;
}

function generateCompositeRolesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} composite roles
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateCompositeRolesTerraform(roles: any, realmName: string): string {
  let terraform = `# Composite Roles configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Composite realm roles
  if (roles.realm && roles.realm.length > 0) {
    roles.realm.forEach((role: any) => {
      if (role.composite && role.composites) {
        const sanitizedRoleName = role.name.replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_role" "composite_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  name        = "${role.name}"
  description = "${role.description || ''}"
  
  composite_roles = [
    ${role.composites.realm?.map((r: string) => `data.keycloak_role.${r.replace(/[^a-zA-Z0-9_]/g, '_')}.id`).join(',\n    ') || ''}
  ]
}
`;

        // Add data sources for referenced roles
        if (role.composites.realm) {
          role.composites.realm.forEach((refRole: string) => {
            const sanitizedRefRoleName = refRole.replace(/[^a-zA-Z0-9_]/g, '_');
            terraform += `
data "keycloak_role" "${sanitizedRefRoleName}" {
  realm_id = var.realm_id
  name     = "${refRole}"
}
`;
          });
        }
      }
    });
  }

  return terraform;
}

function generateGroupsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} groups
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateGroupsTerraform(groups: any[], realmName: string): string {
  let terraform = `# Groups configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  groups.forEach((group, index) => {
    const sanitizedGroupName = (group.name || `group_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_group" "${sanitizedGroupName}" {
  realm_id = var.realm_id
  name     = "${group.name || `group_${index}`}"
  
  ${group.path ? `path = "${group.path}"` : ''}
  
  ${group.attributes ? `
  attributes = {
    ${Object.entries(group.attributes).map(([key, value]) => 
      `${key} = ${Array.isArray(value) ? JSON.stringify(value) : `"${value}"`}`
    ).join('\n    ')}
  }` : ''}
}
`;

    // Generate group role mappings
    if (group.realmRoles && group.realmRoles.length > 0) {
      terraform += `
resource "keycloak_group_roles" "${sanitizedGroupName}_realm_roles" {
  realm_id = var.realm_id
  group_id = keycloak_group.${sanitizedGroupName}.id
  
  role_ids = [
    # Realm roles: ${group.realmRoles.join(', ')}
    # These need to be updated with actual role resource references
  ]
}
`;
    }
  });

  return terraform;
}

function hasRoleScopeMappings(realmData: any): boolean {
  return (realmData.scopeMappings && Object.keys(realmData.scopeMappings).length > 0) ||
         (realmData.clients && realmData.clients.some((client: any) => client.scopeMappings));
}

function generateScopeMappingsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} scope mappings
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

dependency "clients" {
  config_path = "../clients"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateScopeMappingsTerraform(realmData: any, realmName: string): string {
  let terraform = `# Scope Mappings configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Realm-level scope mappings
  if (realmData.scopeMappings) {
    Object.entries(realmData.scopeMappings).forEach(([clientId, roles]: [string, any]) => {
      const sanitizedClientId = clientId.replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Scope mappings for client: ${clientId}
resource "keycloak_openid_client_scope_mappings" "${sanitizedClientId}_scope_mappings" {
  realm_id  = var.realm_id
  client_id = data.keycloak_openid_client.${sanitizedClientId}.id
  
  role_ids = [
    ${Array.isArray(roles) ? roles.map((role: string) => `data.keycloak_role.${role.replace(/[^a-zA-Z0-9_]/g, '_')}.id`).join(',\n    ') : ''}
  ]
}

data "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id  = var.realm_id
  client_id = "${clientId}"
}
`;

      // Add data sources for roles
      if (Array.isArray(roles)) {
        roles.forEach((role: string) => {
          const sanitizedRoleName = role.replace(/[^a-zA-Z0-9_]/g, '_');
          terraform += `
data "keycloak_role" "${sanitizedRoleName}" {
  realm_id = var.realm_id
  name     = "${role}"
}
`;
        });
      }
    });
  }

  return terraform;
}

function generateIdpTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} identity providers
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateIdpTerraform(identityProviders: any[], realmName: string): string {
  let terraform = `# Identity Providers configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  identityProviders.forEach((idp, index) => {
    const sanitizedIdpAlias = idp.alias.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_oidc_identity_provider" "${sanitizedIdpAlias}" {
  realm             = var.realm_id
  alias             = "${idp.alias}"
  display_name      = "${idp.displayName || idp.alias}"
  enabled           = ${idp.enabled !== false}
  store_token       = ${idp.storeToken || false}
  add_read_token_role_on_create = ${idp.addReadTokenRoleOnCreate || false}
  
  authorization_url = "${idp.config?.authorizationUrl || ''}"
  token_url        = "${idp.config?.tokenUrl || ''}"
  client_id        = "${idp.config?.clientId || ''}"
  client_secret    = "${idp.config?.clientSecret || ''}"
  issuer           = "${idp.config?.issuer || ''}"
  
  ${idp.config?.defaultScope ? `default_scopes = "${idp.config.defaultScope}"` : ''}
  
  ${idp.config && Object.keys(idp.config).length > 0 ? `
  extra_config = {
    ${Object.entries(idp.config)
      .filter(([key]) => !['authorizationUrl', 'tokenUrl', 'clientId', 'clientSecret', 'issuer', 'defaultScope'].includes(key))
      .map(([key, value]) => `"${key}" = "${value}"`)
      .join('\n    ')}
  }` : ''}
}
`;

    // Generate simple identity provider mappers (complex ones go to separate file)
    if (idp.mappers && idp.mappers.length > 0 && idp.mappers.length <= 3) {
      idp.mappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_custom_identity_provider_mapper" "${sanitizedIdpAlias}_${sanitizedMapperName}" {
  realm                    = var.realm_id
  name                     = "${mapper.name || `mapper_${mapperIndex}`}"
  identity_provider_alias  = keycloak_oidc_identity_provider.${sanitizedIdpAlias}.alias
  identity_provider_mapper = "${mapper.identityProviderMapper || 'oidc-user-attribute-idp-mapper'}"
  
  ${mapper.config && Object.keys(mapper.config).length > 0 ? `
  extra_config = {
    ${Object.entries(mapper.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
      });
    }
  });

  return terraform;
}

function generateIdpMappersTerraform(idp: any, realmName: string): string {
  const sanitizedIdpAlias = idp.alias.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# Identity Provider Mappers for: ${idp.alias}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Data source for identity provider reference
data "keycloak_oidc_identity_provider" "${sanitizedIdpAlias}" {
  realm = var.realm_id
  alias = "${idp.alias}"
}

`;

  if (idp.mappers && idp.mappers.length > 0) {
    idp.mappers.forEach((mapper: any, mapperIndex: number) => {
      const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_custom_identity_provider_mapper" "${sanitizedIdpAlias}_${sanitizedMapperName}" {
  realm                    = var.realm_id
  name                     = "${mapper.name || `mapper_${mapperIndex}`}"
  identity_provider_alias  = data.keycloak_oidc_identity_provider.${sanitizedIdpAlias}.alias
  identity_provider_mapper = "${mapper.identityProviderMapper || 'oidc-user-attribute-idp-mapper'}"
  
  ${mapper.config && Object.keys(mapper.config).length > 0 ? `
  extra_config = {
    ${Object.entries(mapper.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
    });
  }

  return terraform;
}

function generateAuthFlowsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} authentication flows
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateAuthFlowsTerraform(authFlows: any[], realmName: string): string {
  let terraform = `# Authentication Flows configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  authFlows.forEach((flow, index) => {
    if (flow.builtIn) return; // Skip built-in flows
    
    const sanitizedFlowAlias = flow.alias.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_authentication_flow" "${sanitizedFlowAlias}" {
  realm_id    = var.realm_id
  alias       = "${flow.alias}"
  description = "${flow.description || ''}"
  
  ${flow.topLevel !== undefined ? `top_level = ${flow.topLevel}` : ''}
}
`;

    // Generate authentication executions
    if (flow.authenticationExecutions && flow.authenticationExecutions.length > 0) {
      flow.authenticationExecutions.forEach((execution: any, execIndex: number) => {
        const sanitizedExecName = `${sanitizedFlowAlias}_exec_${execIndex}`;
        
        terraform += `
resource "keycloak_authentication_execution" "${sanitizedExecName}" {
  realm_id          = var.realm_id
  parent_flow_alias = keycloak_authentication_flow.${sanitizedFlowAlias}.alias
  authenticator     = "${execution.authenticator || ''}"
  requirement       = "${execution.requirement || 'DISABLED'}"
  
  ${execution.priority !== undefined ? `priority = ${execution.priority}` : ''}
}
`;

        // Generate authentication execution config
        if (execution.authenticatorConfig) {
          terraform += `
resource "keycloak_authentication_execution_config" "${sanitizedExecName}_config" {
  realm_id     = var.realm_id
  execution_id = keycloak_authentication_execution.${sanitizedExecName}.id
  alias        = "${execution.authenticatorConfig.alias || `${execution.authenticator}-config`}"
  
  config = {
    ${Object.entries(execution.authenticatorConfig.config || {}).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }
}
`;
        }
      });
    }
  });

  return terraform;
}

function generateAuthBindingsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} authentication bindings
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "auth_flows" {
  config_path = "../auth_flows"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateAuthBindingsTerraform(realmData: any, realmName: string): string {
  return `# Authentication Bindings configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Authentication flow bindings
resource "keycloak_authentication_bindings" "realm_bindings" {
  realm_id = var.realm_id
  
  ${realmData.browserFlow ? `browser_flow = "${realmData.browserFlow}"` : ''}
  ${realmData.registrationFlow ? `registration_flow = "${realmData.registrationFlow}"` : ''}
  ${realmData.directGrantFlow ? `direct_grant_flow = "${realmData.directGrantFlow}"` : ''}
  ${realmData.resetCredentialsFlow ? `reset_credentials_flow = "${realmData.resetCredentialsFlow}"` : ''}
  ${realmData.clientAuthenticationFlow ? `client_authentication_flow = "${realmData.clientAuthenticationFlow}"` : ''}
  ${realmData.dockerAuthenticationFlow ? `docker_authentication_flow = "${realmData.dockerAuthenticationFlow}"` : ''}
}
`;
}

function generateRequiredActionsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} required actions
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRequiredActionsTerraform(requiredActions: any[], realmName: string): string {
  let terraform = `# Required Actions configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  requiredActions.forEach((action, index) => {
    const sanitizedActionAlias = (action.alias || `action_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_required_action" "${sanitizedActionAlias}" {
  realm_id = var.realm_id
  alias    = "${action.alias || `action_${index}`}"
  name     = "${action.name || action.alias || `Action ${index}`}"
  enabled  = ${action.enabled !== false}
  default_action = ${action.defaultAction || false}
  priority = ${action.priority || (index * 10)}
  
  ${action.config && Object.keys(action.config).length > 0 ? `
  config = {
    ${Object.entries(action.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
  });

  return terraform;
}

function generateUserFederationTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} user federation
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateUserFederationTerraform(components: any, realmName: string): string {
  let terraform = `# User Federation configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Handle LDAP user federation
  if (components['org.keycloak.storage.UserStorageProvider']) {
    components['org.keycloak.storage.UserStorageProvider'].forEach((provider: any, index: number) => {
      const sanitizedProviderName = (provider.name || `provider_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (provider.providerId === 'ldap') {
        terraform += `
resource "keycloak_ldap_user_federation" "${sanitizedProviderName}" {
  realm_id    = var.realm_id
  name        = "${provider.name || `provider_${index}`}"
  enabled     = ${provider.config?.enabled?.[0] !== 'false'}
  
  username_ldap_attribute = "${provider.config?.usernameLDAPAttribute?.[0] || 'uid'}"
  rdn_ldap_attribute     = "${provider.config?.rdnLDAPAttribute?.[0] || 'uid'}"
  uuid_ldap_attribute    = "${provider.config?.uuidLDAPAttribute?.[0] || 'entryUUID'}"
  
  connection_url      = "${provider.config?.connectionUrl?.[0] || ''}"
  users_dn           = "${provider.config?.usersDn?.[0] || ''}"
  bind_dn            = "${provider.config?.bindDn?.[0] || ''}"
  bind_credential    = "${provider.config?.bindCredential?.[0] || ''}"
  
  search_scope       = "${provider.config?.searchScope?.[0] || 'SUBTREE'}"
  validate_password_policy = ${provider.config?.validatePasswordPolicy?.[0] === 'true'}
  trust_email        = ${provider.config?.trustEmail?.[0] === 'true'}
  
  ${provider.config?.userObjectClasses?.[0] ? `user_object_classes = ${JSON.stringify(provider.config.userObjectClasses[0].split(',').map((s: string) => s.trim()))}` : ''}
  
  # Sync settings
  batch_size_for_sync    = ${provider.config?.batchSizeForSync?.[0] || '1000'}
  full_sync_period       = ${provider.config?.fullSyncPeriod?.[0] || '-1'}
  changed_sync_period    = ${provider.config?.changedSyncPeriod?.[0] || '-1'}
  
  # Cache settings
  cache_policy = "${provider.config?.cachePolicy?.[0] || 'DEFAULT'}"
}
`;
    });
  }

  return terraform;
}

function generateUserFederationMappersTerraform(provider: any, realmName: string): string {
  const sanitizedProviderName = (provider.name || 'provider').replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# User Federation Mappers for: ${provider.name}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Data source for user federation provider reference
data "keycloak_ldap_user_federation" "${sanitizedProviderName}" {
  realm_id = var.realm_id
  name     = "${provider.name}"
}

`;

  // Generate LDAP attribute mappers
  if (provider.config) {
    const mappers = [
      { name: 'username', ldap_attribute: provider.config.usernameLDAPAttribute?.[0] || 'uid', user_model_attribute: 'username' },
      { name: 'first_name', ldap_attribute: 'givenName', user_model_attribute: 'firstName' },
      { name: 'last_name', ldap_attribute: 'sn', user_model_attribute: 'lastName' },
      { name: 'email', ldap_attribute: 'mail', user_model_attribute: 'email' },
      { name: 'phone', ldap_attribute: 'telephoneNumber', user_model_attribute: 'phone' }
    ];

    mappers.forEach((mapper, mapperIndex) => {
      terraform += `
resource "keycloak_ldap_user_attribute_mapper" "${sanitizedProviderName}_${mapper.name}" {
  realm_id                = var.realm_id
  ldap_user_federation_id = data.keycloak_ldap_user_federation.${sanitizedProviderName}.id
  name                    = "${mapper.name}"
  ldap_attribute          = "${mapper.ldap_attribute}"
  user_model_attribute    = "${mapper.user_model_attribute}"
}
`;
    });
  }

  return terraform;
}

function generateClientPoliciesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} client policies
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientPoliciesTerraform(realmData: any, realmName: string): string {
  let terraform = `# Client Policies configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Client Profiles
  if (realmData.clientProfiles && realmData.clientProfiles.profiles) {
    realmData.clientProfiles.profiles.forEach((profile: any, index: number) => {
      const sanitizedProfileName = (profile.name || `profile_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Client Profile: ${profile.name}
resource "null_resource" "client_profile_${sanitizedProfileName}" {
  triggers = {
    profile_config = jsonencode({
      name        = "${profile.name || `profile_${index}`}"
      description = "${profile.description || ''}"
      executors   = ${JSON.stringify(profile.executors || [])}
    })
  }
  
  provisioner "local-exec" {
    command = "echo 'Client Profile ${profile.name} needs manual configuration in Keycloak Admin Console'"
  }
}
`;
    });
  }

  // Client Policies
  if (realmData.clientPolicies && realmData.clientPolicies.policies) {
    realmData.clientPolicies.policies.forEach((policy: any, index: number) => {
      const sanitizedPolicyName = (policy.name || `policy_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Client Policy: ${policy.name}
resource "null_resource" "client_policy_${sanitizedPolicyName}" {
  triggers = {
    policy_config = jsonencode({
      name        = "${policy.name || `policy_${index}`}"
      description = "${policy.description || ''}"
      enabled     = ${policy.enabled !== false}
      conditions  = ${JSON.stringify(policy.conditions || [])}
      profiles    = ${JSON.stringify(policy.profiles || [])}
    })
  }
  
  provisioner "local-exec" {
    command = "echo 'Client Policy ${policy.name} needs manual configuration in Keycloak Admin Console'"
  }
}
`;
    });
  }

  return terraform;
}

function generateThemesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} themes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateThemesTerraform(realmData: any, realmName: string): string {
  return `# Custom Themes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Note: Keycloak provider doesn't directly support theme management
# These would typically be managed outside of Terraform
# However, we can configure theme references in the realm

locals {
  themes = {
    ${realmData.loginTheme ? `login_theme = "${realmData.loginTheme}"` : ''}
    ${realmData.accountTheme ? `account_theme = "${realmData.accountTheme}"` : ''}
    ${realmData.adminTheme ? `admin_theme = "${realmData.adminTheme}"` : ''}
    ${realmData.emailTheme ? `email_theme = "${realmData.emailTheme}"` : ''}
  }
}

# Custom theme deployment would require additional tooling
# This is a placeholder for theme management
resource "null_resource" "deploy_themes" {
  triggers = {
    themes_hash = md5(jsonencode(local.themes))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Custom themes need to be deployed separately:"
      ${realmData.loginTheme ? `echo "Login Theme: ${realmData.loginTheme}"` : ''}
      ${realmData.accountTheme ? `echo "Account Theme: ${realmData.accountTheme}"` : ''}
      ${realmData.adminTheme ? `echo "Admin Theme: ${realmData.adminTheme}"` : ''}
      ${realmData.emailTheme ? `echo "Email Theme: ${realmData.emailTheme}"` : ''}
    EOT
  }
}
`;
}

function generateLocalizationTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} localization
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateLocalizationTerraform(realmData: any, realmName: string): string {
  return `# Localization configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Localization settings
locals {
  localization = {
    internationalization_enabled = ${realmData.internationalizationEnabled || false}
    supported_locales           = ${JSON.stringify(realmData.supportedLocales || ['en'])}
    default_locale             = "${realmData.defaultLocale || 'en'}"
  }
}

# Note: Keycloak provider may not fully support all localization features
# This serves as documentation for the localization configuration
resource "null_resource" "localization_config" {
  triggers = {
    localization_hash = md5(jsonencode(local.localization))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Localization Configuration:"
      echo "  Internationalization Enabled: ${realmData.internationalizationEnabled || false}"
      echo "  Supported Locales: ${(realmData.supportedLocales || ['en']).join(', ')}"
      echo "  Default Locale: ${realmData.defaultLocale || 'en'}"
    EOT
  }
}
`;
}

function generateSecurityPoliciesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} security policies
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateSecurityPoliciesTerraform(realmData: any, realmName: string): string {
  return `# Security Policies configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Password Policy
${realmData.passwordPolicy ? `
resource "keycloak_realm_keystore_aes_generated" "aes_generated" {
  realm_id  = var.realm_id
  name      = "aes-generated"
  priority  = 100
}

resource "keycloak_realm_keystore_hmac_generated" "hmac_generated" {
  realm_id  = var.realm_id
  name      = "hmac-generated"
  priority  = 100
  algorithm = "HS256"
}

resource "keycloak_realm_keystore_rsa_generated" "rsa_generated" {
  realm_id  = var.realm_id
  name      = "rsa-generated"
  priority  = 100
  algorithm = "RS256"
}
` : ''}

# OTP Policy
${realmData.otpPolicyType ? `
resource "keycloak_default_groups" "default_groups" {
  realm_id  = var.realm_id
  group_ids = []
}
` : ''}

# Brute Force Protection
locals {
  brute_force_protection = {
    enabled                    = ${realmData.bruteForceProtected || false}
    permanent_lockout         = ${realmData.permanentLockout || false}
    max_login_failures        = ${realmData.maxFailureWait || 900}
    wait_increment_seconds    = ${realmData.waitIncrementSeconds || 60}
    quick_login_check_millis  = ${realmData.quickLoginCheckMilliSeconds || 1000}
    minimum_quick_login_wait  = ${realmData.minimumQuickLoginWaitSeconds || 60}
    max_failure_wait_seconds  = ${realmData.maxFailureWait || 900}
    failure_reset_time_seconds = ${realmData.failureFactor || 30}
  }
}

# Content Security Policy
locals {
  security_headers = {
    content_security_policy           = "${realmData.browserSecurityHeaders?.contentSecurityPolicy || "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"}"
    content_security_policy_report_only = "${realmData.browserSecurityHeaders?.contentSecurityPolicyReportOnly || ''}"
    x_content_type_options           = "${realmData.browserSecurityHeaders?.xContentTypeOptions || 'nosniff'}"
    x_frame_options                  = "${realmData.browserSecurityHeaders?.xFrameOptions || 'SAMEORIGIN'}"
    x_robots_tag                     = "${realmData.browserSecurityHeaders?.xRobotsTag || 'none'}"
    x_xss_protection                 = "${realmData.browserSecurityHeaders?.xXSSProtection || '1; mode=block'}"
    strict_transport_security        = "${realmData.browserSecurityHeaders?.strictTransportSecurity || 'max-age=31536000; includeSubDomains'}"
  }
}
`;

function generateEventsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} events
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateEventsTerraform(realmData: any, realmName: string): string {
  return `# Events configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Event Listeners Configuration
locals {
  events_config = {
    events_enabled           = ${realmData.eventsEnabled || false}
    events_expiration        = ${realmData.eventsExpiration || 0}
    admin_events_enabled     = ${realmData.adminEventsEnabled || false}
    admin_events_details_enabled = ${realmData.adminEventsDetailsEnabled || false}
    
    ${realmData.eventsListeners ? `
    events_listeners = ${JSON.stringify(realmData.eventsListeners)}` : ''}
    
    ${realmData.enabledEventTypes ? `
    enabled_event_types = ${JSON.stringify(realmData.enabledEventTypes)}` : ''}
  }
}

# Custom Event Listeners (would require custom providers or external management)
${realmData.eventsListeners && realmData.eventsListeners.includes('jboss-logging') ? `
resource "null_resource" "jboss_logging_listener" {
  provisioner "local-exec" {
    command = "echo 'JBoss logging event listener configured'"
  }
}
` : ''}

${realmData.eventsListeners && realmData.eventsListeners.some((listener: string) => listener !== 'jboss-logging') ? `
resource "null_resource" "custom_event_listeners" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Custom event listeners need to be deployed:"
      ${realmData.eventsListeners.filter((l: string) => l !== 'jboss-logging').map((listener: string) => 
        `echo "  - ${listener}"`
      ).join('\n      ')}
    EOT
  }
}
` : ''}
`;

function generateOTPPolicyTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} OTP policy
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateOTPPolicyTerraform(realmData: any, realmName: string): string {
  return `# OTP Policy configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# OTP Policy Configuration
locals {
  otp_policy = {
    type                  = "${realmData.otpPolicyType || 'totp'}"
    algorithm             = "${realmData.otpPolicyAlgorithm || 'HmacSHA1'}"
    initial_counter       = ${realmData.otpPolicyInitialCounter || 0}
    digits                = ${realmData.otpPolicyDigits || 6}
    look_ahead_window     = ${realmData.otpPolicyLookAheadWindow || 1}
    period                = ${realmData.otpPolicyPeriod || 30}
    code_reusable         = ${realmData.otpPolicyCodeReusable || false}
  }
}

# Note: OTP Policy configuration may require direct realm configuration
resource "null_resource" "otp_policy_info" {
  triggers = {
    otp_policy_hash = md5(jsonencode(local.otp_policy))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "OTP Policy Configuration:"
      echo "  Type: ${realmData.otpPolicyType || 'totp'}"
      echo "  Algorithm: ${realmData.otpPolicyAlgorithm || 'HmacSHA1'}"
      echo "  Digits: ${realmData.otpPolicyDigits || 6}"
      echo "  Period: ${realmData.otpPolicyPeriod || 30}"
    EOT
  }
}
`;

function generateWebAuthnPolicyTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} WebAuthn policy
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateWebAuthnPolicyTerraform(realmData: any, realmName: string): string {
  return `# WebAuthn Policy configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# WebAuthn Policy Configuration
locals {
  webauthn_policy = {
    rp_entity_name                     = "${realmData.webAuthnPolicyRpEntityName || ''}"
    signature_algorithms               = ${JSON.stringify(realmData.webAuthnPolicySignatureAlgorithms || ['ES256'])}
    rp_id                             = "${realmData.webAuthnPolicyRpId || ''}"
    attestation_conveyance_preference = "${realmData.webAuthnPolicyAttestationConveyancePreference || 'not specified'}"
    authenticator_attachment          = "${realmData.webAuthnPolicyAuthenticatorAttachment || 'not specified'}"
    require_resident_key              = "${realmData.webAuthnPolicyRequireResidentKey || 'not specified'}"
    user_verification_requirement     = "${realmData.webAuthnPolicyUserVerificationRequirement || 'not specified'}"
    create_timeout                    = ${realmData.webAuthnPolicyCreateTimeout || 0}
    avoid_same_authenticator_register = ${realmData.webAuthnPolicyAvoidSameAuthenticatorRegister || false}
  }
}

# Note: WebAuthn Policy configuration may require direct realm configuration
resource "null_resource" "webauthn_policy_info" {
  triggers = {
    webauthn_policy_hash = md5(jsonencode(local.webauthn_policy))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "WebAuthn Policy Configuration:"
      echo "  RP Entity Name: ${realmData.webAuthnPolicyRpEntityName || ''}"
      echo "  Signature Algorithms: ${(realmData.webAuthnPolicySignatureAlgorithms || ['ES256']).join(', ')}"
      echo "  User Verification: ${realmData.webAuthnPolicyUserVerificationRequirement || 'not specified'}"
    EOT
  }
}
`;

function generateRealmKeysTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} realm keys
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRealmKeysTerraform(realmData: any, realmName: string): string {
  return `# Realm Keys and Certificates configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# RSA Key Generation
resource "keycloak_realm_keystore_rsa_generated" "realm_rsa_key" {
  realm_id  = var.realm_id
  name      = "${realmName}-rsa-generated"
  priority  = 100
  algorithm = "RS256"
  key_size  = 2048
}

# AES Key Generation
resource "keycloak_realm_keystore_aes_generated" "realm_aes_key" {
  realm_id = var.realm_id
  name     = "${realmName}-aes-generated"
  priority = 100
}

# HMAC Key Generation
resource "keycloak_realm_keystore_hmac_generated" "realm_hmac_key" {
  realm_id  = var.realm_id
  name      = "${realmName}-hmac-generated"
  priority  = 100
  algorithm = "HS256"
}

${realmData.publicKey ? `
# Custom RSA Key Pair (if provided)
resource "keycloak_realm_keystore_rsa" "custom_rsa_key" {
  realm_id    = var.realm_id
  name        = "${realmName}-custom-rsa"
  priority    = 200
  algorithm   = "RS256"
  
  private_key = "${realmData.privateKey || ''}"
  certificate = "${realmData.certificate || ''}"
}
` : ''}
`;

function generateRequiredCredentialsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} required credentials
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRequiredCredentialsTerraform(requiredCredentials: any[], realmName: string): string {
  return `# Required Credentials configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Required Credentials Configuration
locals {
  required_credentials = ${JSON.stringify(requiredCredentials, null, 2)}
}

# Note: Required credentials are typically managed at the realm level
# This configuration documents the credential requirements
resource "null_resource" "required_credentials_info" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Required credentials for realm ${realmName}:"
${requiredCredentials.map((cred: any) => 
  `      echo "  - Type: ${cred.type || 'password'}, Input: ${cred.input || false}, Secret: ${cred.secret || false}"`
).join('\n')}
    EOT
  }
}
`;
}

function generateSecurityDefenses(realmData: any): string {
  let config = '';
  
  if (realmData.bruteForceProtected) {
    config += `
  security_defenses {
    headers {
      content_security_policy           = "${realmData.browserSecurityHeaders?.contentSecurityPolicy || "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"}"
      content_security_policy_report_only = "${realmData.browserSecurityHeaders?.contentSecurityPolicyReportOnly || ''}"
      x_content_type_options           = "${realmData.browserSecurityHeaders?.xContentTypeOptions || 'nosniff'}"
      x_frame_options                  = "${realmData.browserSecurityHeaders?.xFrameOptions || 'SAMEORIGIN'}"
      x_robots_tag                     = "${realmData.browserSecurityHeaders?.xRobotsTag || 'none'}"
      x_xss_protection                 = "${realmData.browserSecurityHeaders?.xXSSProtection || '1; mode=block'}"
      strict_transport_security        = "${realmData.browserSecurityHeaders?.strictTransportSecurity || 'max-age=31536000; includeSubDomains'}"
    }
    
    brute_force_detection {
      permanent_lockout              = ${realmData.permanentLockout || false}
      max_login_failures            = ${realmData.maxFailureWait || 30}
      wait_increment_seconds        = ${realmData.waitIncrementSeconds || 60}
      quick_login_check_millis      = ${realmData.quickLoginCheckMilliSeconds || 1000}
      minimum_quick_login_wait_seconds = ${realmData.minimumQuickLoginWaitSeconds || 60}
      max_failure_wait_seconds      = ${realmData.maxFailureWait || 900}
      failure_reset_time_seconds    = ${realmData.failureFactor || 30}
    }
  }`;
  }
  
  return config;
}

function generateSmtpConfig(realmData: any): string {
  if (!realmData.smtpServer || Object.keys(realmData.smtpServer).length === 0) {
    return '';
  }
  
  return `
  smtp_server {
    host                   = "${realmData.smtpServer.host || ''}"
    port                   = "${realmData.smtpServer.port || '587'}"
    from                   = "${realmData.smtpServer.from || ''}"
    from_display_name      = "${realmData.smtpServer.fromDisplayName || ''}"
    reply_to               = "${realmData.smtpServer.replyTo || ''}"
    reply_to_display_name  = "${realmData.smtpServer.replyToDisplayName || ''}"
    envelope_from          = "${realmData.smtpServer.envelopeFrom || ''}"
    starttls               = ${realmData.smtpServer.starttls === 'true'}
    ssl                    = ${realmData.smtpServer.ssl === 'true'}
    auth                   = ${realmData.smtpServer.auth === 'true'}
    user                   = "${realmData.smtpServer.user || ''}"
    password               = "${realmData.smtpServer.password || ''}"
  }`;
}

function generateCustomAttributes(realmData: any): string {
  if (!realmData.attributes || Object.keys(realmData.attributes).length === 0) {
    return '';
  }
  
  return `
  attributes = {
    ${Object.entries(realmData.attributes).map(([key, value]) => 
      `${key} = "${value}"`
    ).join('\n    ')}
  }`;
}

function generateBrowserSecurityHeaders(realmData: any): string {
  if (!realmData.browserSecurityHeaders) {
    return '';
  }
  
  return `
  browser_security_headers {
    content_security_policy           = "${realmData.browserSecurityHeaders.contentSecurityPolicy || "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"}"
    content_security_policy_report_only = "${realmData.browserSecurityHeaders.contentSecurityPolicyReportOnly || ''}"
    x_content_type_options           = "${realmData.browserSecurityHeaders.xContentTypeOptions || 'nosniff'}"
    x_frame_options                  = "${realmData.browserSecurityHeaders.xFrameOptions || 'SAMEORIGIN'}"
    x_robots_tag                     = "${realmData.browserSecurityHeaders.xRobotsTag || 'none'}"
    x_xss_protection                 = "${realmData.browserSecurityHeaders.xXSSProtection || '1; mode=block'}"
    strict_transport_security        = "${realmData.browserSecurityHeaders.strictTransportSecurity || 'max-age=31536000; includeSubDomains'}"
  }`;
}

function generateProtocolMapperConfig(mapper: any): string {
  let config = '';
  
  switch (mapper.protocolMapper) {
    case 'oidc-usermodel-attribute-mapper':
      config = `
  user_attribute = "${mapper.config?.['user.attribute'] || ''}"
  claim_name     = "${mapper.config?.['claim.name'] || ''}"
  claim_value_type = "${mapper.config?.['jsonType.label'] || 'String'}"
  add_to_id_token     = ${mapper.config?.['id.token.claim'] === 'true'}
  add_to_access_token = ${mapper.config?.['access.token.claim'] === 'true'}
  add_to_userinfo     = ${mapper.config?.['userinfo.token.claim'] === 'true'}`;
      break;
      
    case 'oidc-usermodel-property-mapper':
      config = `
  user_property = "${mapper.config?.['user.property'] || ''}"
  claim_name    = "${mapper.config?.['claim.name'] || ''}"
  claim_value_type = "${mapper.config?.['jsonType.label'] || 'String'}"
  add_to_id_token     = ${mapper.config?.['id.token.claim'] === 'true'}
  add_to_access_token = ${mapper.config?.['access.token.claim'] === 'true'}
  add_to_userinfo     = ${mapper.config?.['userinfo.token.claim'] === 'true'}`;
      break;
      
    case 'oidc-group-membership-mapper':
      config = `
  claim_name     = "${mapper.config?.['claim.name'] || 'groups'}"
  full_path      = ${mapper.config?.['full.path'] === 'true'}
  add_to_id_token     = ${mapper.config?.['id.token.claim'] === 'true'}
  add_to_access_token = ${mapper.config?.['access.token.claim'] === 'true'}
  add_to_userinfo     = ${mapper.config?.['userinfo.token.claim'] === 'true'}`;
      break;
      
    default:
      config = `
  # Custom mapper configuration
  ${mapper.config ? Object.entries(mapper.config).map(([key, value]) => 
    `# ${key} = "${value}"`
  ).join('\n  ') : ''}`;
  }
  
  return config;
}

function generateClientScopesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} client scopes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientScopesTerraform(clientScopes: any[], realmName: string): string {
  let terraform = `# Client Scopes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  clientScopes.forEach((scope, index) => {
    const sanitizedScopeName = (scope.name || `scope_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_openid_client_scope" "${sanitizedScopeName}" {
  realm_id               = var.realm_id
  name                   = "${scope.name || `scope_${index}`}"
  description            = "${scope.description || ''}"
  consent_screen_text    = "${scope.consentScreenText || ''}"
  include_in_token_scope = ${scope.includeInTokenScope !== false}
  gui_order              = ${scope.guiOrder || index}
}
`;

    // Generate protocol mappers for the client scope
    if (scope.protocolMappers && scope.protocolMappers.length > 0) {
      scope.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedScopeName}_${sanitizedMapperName}" {
  realm_id        = var.realm_id
  client_scope_id = keycloak_openid_client_scope.${sanitizedScopeName}.id
  name            = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
      });
    }
  });

  return terraform;
}

function generateDefaultClientScopesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} default client scopes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "client_scopes" {
  config_path = "../client_scopes"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateDefaultClientScopesTerraform(realmData: any, realmName: string): string {
  return `# Default Client Scopes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Default default client scopes
${realmData.defaultDefaultClientScopes ? `
resource "keycloak_default_default_client_scopes" "default_scopes" {
  realm_id = var.realm_id
  
  default_scopes = [
    ${realmData.defaultDefaultClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
` : ''}

# Default optional client scopes
${realmData.defaultOptionalClientScopes ? `
resource "keycloak_default_optional_client_scopes" "optional_scopes" {
  realm_id = var.realm_id
  
  optional_scopes = [
    ${realmData.defaultOptionalClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
` : ''}
`;
}

function generateUsersTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} users
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateUsersTerraform(users: any[], realmName: string): string {
  let terraform = `# Users configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  users.forEach((user, index) => {
    const userId = user.username || `user_${index}`;
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_user" "${sanitizedUserId}" {
  realm_id   = var.realm_id
  username   = "${user.username || ''}"
  enabled    = ${user.enabled !== false}
  
  email      = "${user.email || ''}"
  first_name = "${user.firstName || ''}"
  last_name  = "${user.lastName || ''}"
  
  ${user.emailVerified !== undefined ? `email_verified = ${user.emailVerified}` : ''}
  
  ${user.attributes ? `
  attributes = {
    ${Object.entries(user.attributes).map(([key, value]) => 
      `${key} = ${Array.isArray(value) ? JSON.stringify(value) : `"${value}"`}`
    ).join('\n    ')}
  }` : ''}
  
  ${user.requiredActions && user.requiredActions.length > 0 ? `
  required_actions = ${JSON.stringify(user.requiredActions)}` : ''}
  
  ${user.credentials && user.credentials.length > 0 ? `
  initial_password {
    value     = "temp-password-${index}"
    temporary = true
  }` : ''}
}
`;

    // Generate user group memberships
    if (user.groups && user.groups.length > 0) {
      user.groups.forEach((group: string, groupIndex: number) => {
        const sanitizedGroupName = group.replace(/[^a-zA-Z0-9_]/g, '_');
        terraform += `
resource "keycloak_user_groups" "${sanitizedUserId}_group_${groupIndex}" {
  realm_id = var.realm_id
  user_id  = keycloak_user.${sanitizedUserId}.id
  group_ids = [
    # Reference to group: ${group}
    # This needs to be updated with actual group resource reference
  ]
}
`;
      });
    }

    // Generate user role mappings
    if (user.realmRoles && user.realmRoles.length > 0) {
      terraform += `
resource "keycloak_user_roles" "${sanitizedUserId}_realm_roles" {
  realm_id = var.realm_id
  user_id  = keycloak_user.${sanitizedUserId}.id
  role_ids = [
    # Realm roles: ${user.realmRoles.join(', ')}
    # These need to be updated with actual role resource references
  ]
}
`;
    }
  });

  return terraform;
}

function generateClientsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} clients
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientsTerraform(clients: any[], realmName: string): string {
  let terraform = `# Clients configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  clients.forEach((client, index) => {
    if (!client.clientId) return;
    
    const sanitizedClientId = client.clientId.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id    = var.realm_id
  client_id   = "${client.clientId}"
  name        = "${client.name || client.clientId}"
  description = "${client.description || ''}"
  
  enabled                      = ${client.enabled !== false}
  access_type                  = "${client.publicClient ? 'PUBLIC' : (client.bearerOnly ? 'BEARER-ONLY' : 'CONFIDENTIAL')}"
  service_accounts_enabled     = ${client.serviceAccountsEnabled || false}
  direct_access_grants_enabled = ${client.directAccessGrantsEnabled !== false}
  standard_flow_enabled        = ${client.standardFlowEnabled !== false}
  implicit_flow_enabled        = ${client.implicitFlowEnabled || false}
  
  ${client.rootUrl ? `root_url = "${client.rootUrl}"` : ''}
  ${client.baseUrl ? `base_url = "${client.baseUrl}"` : ''}
  ${client.adminUrl ? `admin_url = "${client.adminUrl}"` : ''}
  
  ${client.redirectUris && client.redirectUris.length > 0 ? `
  valid_redirect_uris = ${JSON.stringify(client.redirectUris)}` : ''}
  
  ${client.webOrigins && client.webOrigins.length > 0 ? `
  web_origins = ${JSON.stringify(client.webOrigins)}` : ''}
  
  ${client.attributes ? `
  extra_config = {
    ${Object.entries(client.attributes).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
  
  # Authentication and authorization settings
  ${client.consentRequired !== undefined ? `consent_required = ${client.consentRequired}` : ''}
  ${client.fullScopeAllowed !== undefined ? `full_scope_allowed = ${client.fullScopeAllowed}` : ''}
  
  # Advanced settings
  access_token_lifespan               = "${client.attributes?.['access.token.lifespan'] || ''}"
  client_session_idle_timeout         = "${client.attributes?.['client.session.idle.timeout'] || ''}"
  client_session_max_lifespan         = "${client.attributes?.['client.session.max.lifespan'] || ''}"
}
`;

    // Generate client scopes (only basic ones, complex ones go to separate file)
    if (client.defaultClientScopes && client.defaultClientScopes.length > 0) {
      terraform += `
# Default client scopes for ${client.clientId}
resource "keycloak_openid_client_default_scopes" "${sanitizedClientId}_default_scopes" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  
  default_scopes = [
    ${client.defaultClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
`;
    }

    // Generate optional client scopes
    if (client.optionalClientScopes && client.optionalClientScopes.length > 0) {
      terraform += `
# Optional client scopes for ${client.clientId}
resource "keycloak_openid_client_optional_scopes" "${sanitizedClientId}_optional_scopes" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  
  optional_scopes = [
    ${client.optionalClientScopes.map((scope: string) => `"${scope}"`).join(',\n    ')}
  ]
}
`;
    }

    // Generate simple protocol mappers (complex ones go to separate file)
    if (client.protocolMappers && client.protocolMappers.length > 0 && client.protocolMappers.length <= 5) {
      client.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedClientId}_${sanitizedMapperName}" {
  realm_id  = var.realm_id
  client_id = keycloak_openid_client.${sanitizedClientId}.id
  name      = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
      });
    }

    // Generate client roles
    if (client.roles && Object.keys(client.roles).length > 0) {
      Object.entries(client.roles).forEach(([roleName, roleData]: [string, any]) => {
        const sanitizedRoleName = roleName.replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_role" "${sanitizedClientId}_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  client_id   = keycloak_openid_client.${sanitizedClientId}.id
  name        = "${roleName}"
  description = "${roleData?.description || ''}"
}
`;
      });
    }
  });

  return terraform;
}

function generateClientProtocolMappersTerraform(client: any, realmName: string): string {
  const sanitizedClientId = client.clientId.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# Protocol Mappers for client: ${client.clientId}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  if (client.protocolMappers && client.protocolMappers.length > 0) {
    client.protocolMappers.forEach((mapper: any, mapperIndex: number) => {
      const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_openid_${mapper.protocolMapper || 'user_attribute'}_protocol_mapper" "${sanitizedClientId}_${sanitizedMapperName}" {
  realm_id  = var.realm_id
  client_id = data.keycloak_openid_client.${sanitizedClientId}.id
  name      = "${mapper.name || `mapper_${mapperIndex}`}"
  
  ${generateProtocolMapperConfig(mapper)}
}
`;
    });
  }

  // Add data source to reference the client
  terraform = `# Data source for client reference
data "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id  = var.realm_id
  client_id = "${client.clientId}"
}

${terraform}`;

  return terraform;
}

function generateRolesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} roles
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRolesTerraform(roles: any, realmName: string): string {
  let terraform = `# Roles configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Realm roles
  if (roles.realm && roles.realm.length > 0) {
    roles.realm.forEach((role: any) => {
      const sanitizedRoleName = role.name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_role" "realm_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  name        = "${role.name}"
  description = "${role.description || ''}"
}
`;
    });
  }

  return terraform;
}

function hasCompositeRoles(roles: any): boolean {
  if (roles.realm) {
    return roles.realm.some((role: any) => role.composite);
  }
  return false;
}

function generateCompositeRolesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} composite roles
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateCompositeRolesTerraform(roles: any, realmName: string): string {
  let terraform = `# Composite Roles configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Composite realm roles
  if (roles.realm && roles.realm.length > 0) {
    roles.realm.forEach((role: any) => {
      if (role.composite && role.composites) {
        const sanitizedRoleName = role.name.replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_role" "composite_${sanitizedRoleName}" {
  realm_id    = var.realm_id
  name        = "${role.name}"
  description = "${role.description || ''}"
  
  composite_roles = [
    ${role.composites.realm?.map((r: string) => `data.keycloak_role.${r.replace(/[^a-zA-Z0-9_]/g, '_')}.id`).join(',\n    ') || ''}
  ]
}
`;

        // Add data sources for referenced roles
        if (role.composites.realm) {
          role.composites.realm.forEach((refRole: string) => {
            const sanitizedRefRoleName = refRole.replace(/[^a-zA-Z0-9_]/g, '_');
            terraform += `
data "keycloak_role" "${sanitizedRefRoleName}" {
  realm_id = var.realm_id
  name     = "${refRole}"
}
`;
          });
        }
      }
    });
  }

  return terraform;
}

function generateGroupsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} groups
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateGroupsTerraform(groups: any[], realmName: string): string {
  let terraform = `# Groups configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  groups.forEach((group, index) => {
    const sanitizedGroupName = (group.name || `group_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_group" "${sanitizedGroupName}" {
  realm_id = var.realm_id
  name     = "${group.name || `group_${index}`}"
  
  ${group.path ? `path = "${group.path}"` : ''}
  
  ${group.attributes ? `
  attributes = {
    ${Object.entries(group.attributes).map(([key, value]) => 
      `${key} = ${Array.isArray(value) ? JSON.stringify(value) : `"${value}"`}`
    ).join('\n    ')}
  }` : ''}
}
`;

    // Generate group role mappings
    if (group.realmRoles && group.realmRoles.length > 0) {
      terraform += `
resource "keycloak_group_roles" "${sanitizedGroupName}_realm_roles" {
  realm_id = var.realm_id
  group_id = keycloak_group.${sanitizedGroupName}.id
  
  role_ids = [
    # Realm roles: ${group.realmRoles.join(', ')}
    # These need to be updated with actual role resource references
  ]
}
`;
    }
  });

  return terraform;
}

function hasRoleScopeMappings(realmData: any): boolean {
  return (realmData.scopeMappings && Object.keys(realmData.scopeMappings).length > 0) ||
         (realmData.clients && realmData.clients.some((client: any) => client.scopeMappings));
}

function generateScopeMappingsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} scope mappings
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

dependency "clients" {
  config_path = "../clients"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateScopeMappingsTerraform(realmData: any, realmName: string): string {
  let terraform = `# Scope Mappings configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Realm-level scope mappings
  if (realmData.scopeMappings) {
    Object.entries(realmData.scopeMappings).forEach(([clientId, roles]: [string, any]) => {
      const sanitizedClientId = clientId.replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Scope mappings for client: ${clientId}
resource "keycloak_openid_client_scope_mappings" "${sanitizedClientId}_scope_mappings" {
  realm_id  = var.realm_id
  client_id = data.keycloak_openid_client.${sanitizedClientId}.id
  
  role_ids = [
    ${Array.isArray(roles) ? roles.map((role: string) => `data.keycloak_role.${role.replace(/[^a-zA-Z0-9_]/g, '_')}.id`).join(',\n    ') : ''}
  ]
}

data "keycloak_openid_client" "${sanitizedClientId}" {
  realm_id  = var.realm_id
  client_id = "${clientId}"
}
`;

      // Add data sources for roles
      if (Array.isArray(roles)) {
        roles.forEach((role: string) => {
          const sanitizedRoleName = role.replace(/[^a-zA-Z0-9_]/g, '_');
          terraform += `
data "keycloak_role" "${sanitizedRoleName}" {
  realm_id = var.realm_id
  name     = "${role}"
}
`;
        });
      }
    });
  }

  return terraform;
}

function generateIdpTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} identity providers
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateIdpTerraform(identityProviders: any[], realmName: string): string {
  let terraform = `# Identity Providers configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  identityProviders.forEach((idp, index) => {
    const sanitizedIdpAlias = idp.alias.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_oidc_identity_provider" "${sanitizedIdpAlias}" {
  realm             = var.realm_id
  alias             = "${idp.alias}"
  display_name      = "${idp.displayName || idp.alias}"
  enabled           = ${idp.enabled !== false}
  store_token       = ${idp.storeToken || false}
  add_read_token_role_on_create = ${idp.addReadTokenRoleOnCreate || false}
  
  authorization_url = "${idp.config?.authorizationUrl || ''}"
  token_url        = "${idp.config?.tokenUrl || ''}"
  client_id        = "${idp.config?.clientId || ''}"
  client_secret    = "${idp.config?.clientSecret || ''}"
  issuer           = "${idp.config?.issuer || ''}"
  
  ${idp.config?.defaultScope ? `default_scopes = "${idp.config.defaultScope}"` : ''}
  
  ${idp.config && Object.keys(idp.config).length > 0 ? `
  extra_config = {
    ${Object.entries(idp.config)
      .filter(([key]) => !['authorizationUrl', 'tokenUrl', 'clientId', 'clientSecret', 'issuer', 'defaultScope'].includes(key))
      .map(([key, value]) => `"${key}" = "${value}"`)
      .join('\n    ')}
  }` : ''}
}
`;

    // Generate simple identity provider mappers (complex ones go to separate file)
    if (idp.mappers && idp.mappers.length > 0 && idp.mappers.length <= 3) {
      idp.mappers.forEach((mapper: any, mapperIndex: number) => {
        const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
        
        terraform += `
resource "keycloak_custom_identity_provider_mapper" "${sanitizedIdpAlias}_${sanitizedMapperName}" {
  realm                    = var.realm_id
  name                     = "${mapper.name || `mapper_${mapperIndex}`}"
  identity_provider_alias  = keycloak_oidc_identity_provider.${sanitizedIdpAlias}.alias
  identity_provider_mapper = "${mapper.identityProviderMapper || 'oidc-user-attribute-idp-mapper'}"
  
  ${mapper.config && Object.keys(mapper.config).length > 0 ? `
  extra_config = {
    ${Object.entries(mapper.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
      });
    }
  });

  return terraform;
}

function generateIdpMappersTerraform(idp: any, realmName: string): string {
  const sanitizedIdpAlias = idp.alias.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# Identity Provider Mappers for: ${idp.alias}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Data source for identity provider reference
data "keycloak_oidc_identity_provider" "${sanitizedIdpAlias}" {
  realm = var.realm_id
  alias = "${idp.alias}"
}

`;

  if (idp.mappers && idp.mappers.length > 0) {
    idp.mappers.forEach((mapper: any, mapperIndex: number) => {
      const sanitizedMapperName = (mapper.name || `mapper_${mapperIndex}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
resource "keycloak_custom_identity_provider_mapper" "${sanitizedIdpAlias}_${sanitizedMapperName}" {
  realm                    = var.realm_id
  name                     = "${mapper.name || `mapper_${mapperIndex}`}"
  identity_provider_alias  = data.keycloak_oidc_identity_provider.${sanitizedIdpAlias}.alias
  identity_provider_mapper = "${mapper.identityProviderMapper || 'oidc-user-attribute-idp-mapper'}"
  
  ${mapper.config && Object.keys(mapper.config).length > 0 ? `
  extra_config = {
    ${Object.entries(mapper.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
    });
  }

  return terraform;
}

function generateAuthFlowsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} authentication flows
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateAuthFlowsTerraform(authFlows: any[], realmName: string): string {
  let terraform = `# Authentication Flows configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  authFlows.forEach((flow, index) => {
    if (flow.builtIn) return; // Skip built-in flows
    
    const sanitizedFlowAlias = flow.alias.replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_authentication_flow" "${sanitizedFlowAlias}" {
  realm_id    = var.realm_id
  alias       = "${flow.alias}"
  description = "${flow.description || ''}"
  
  ${flow.topLevel !== undefined ? `top_level = ${flow.topLevel}` : ''}
}
`;

    // Generate authentication executions
    if (flow.authenticationExecutions && flow.authenticationExecutions.length > 0) {
      flow.authenticationExecutions.forEach((execution: any, execIndex: number) => {
        const sanitizedExecName = `${sanitizedFlowAlias}_exec_${execIndex}`;
        
        terraform += `
resource "keycloak_authentication_execution" "${sanitizedExecName}" {
  realm_id          = var.realm_id
  parent_flow_alias = keycloak_authentication_flow.${sanitizedFlowAlias}.alias
  authenticator     = "${execution.authenticator || ''}"
  requirement       = "${execution.requirement || 'DISABLED'}"
  
  ${execution.priority !== undefined ? `priority = ${execution.priority}` : ''}
}
`;

        // Generate authentication execution config
        if (execution.authenticatorConfig) {
          terraform += `
resource "keycloak_authentication_execution_config" "${sanitizedExecName}_config" {
  realm_id     = var.realm_id
  execution_id = keycloak_authentication_execution.${sanitizedExecName}.id
  alias        = "${execution.authenticatorConfig.alias || `${execution.authenticator}-config`}"
  
  config = {
    ${Object.entries(execution.authenticatorConfig.config || {}).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }
}
`;
        }
      });
    }
  });

  return terraform;
}

function generateAuthBindingsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} authentication bindings
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

dependency "auth_flows" {
  config_path = "../auth_flows"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateAuthBindingsTerraform(realmData: any, realmName: string): string {
  return `# Authentication Bindings configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Authentication flow bindings
resource "keycloak_authentication_bindings" "realm_bindings" {
  realm_id = var.realm_id
  
  ${realmData.browserFlow ? `browser_flow = "${realmData.browserFlow}"` : ''}
  ${realmData.registrationFlow ? `registration_flow = "${realmData.registrationFlow}"` : ''}
  ${realmData.directGrantFlow ? `direct_grant_flow = "${realmData.directGrantFlow}"` : ''}
  ${realmData.resetCredentialsFlow ? `reset_credentials_flow = "${realmData.resetCredentialsFlow}"` : ''}
  ${realmData.clientAuthenticationFlow ? `client_authentication_flow = "${realmData.clientAuthenticationFlow}"` : ''}
  ${realmData.dockerAuthenticationFlow ? `docker_authentication_flow = "${realmData.dockerAuthenticationFlow}"` : ''}
}
`;
}

function generateRequiredActionsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} required actions
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRequiredActionsTerraform(requiredActions: any[], realmName: string): string {
  let terraform = `# Required Actions configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  requiredActions.forEach((action, index) => {
    const sanitizedActionAlias = (action.alias || `action_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `
resource "keycloak_required_action" "${sanitizedActionAlias}" {
  realm_id = var.realm_id
  alias    = "${action.alias || `action_${index}`}"
  name     = "${action.name || action.alias || `Action ${index}`}"
  enabled  = ${action.enabled !== false}
  default_action = ${action.defaultAction || false}
  priority = ${action.priority || (index * 10)}
  
  ${action.config && Object.keys(action.config).length > 0 ? `
  config = {
    ${Object.entries(action.config).map(([key, value]) => 
      `"${key}" = "${value}"`
    ).join('\n    ')}
  }` : ''}
}
`;
  });

  return terraform;
}

function generateUserFederationTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} user federation
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateUserFederationTerraform(components: any, realmName: string): string {
  let terraform = `# User Federation configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Handle LDAP user federation
  if (components['org.keycloak.storage.UserStorageProvider']) {
    components['org.keycloak.storage.UserStorageProvider'].forEach((provider: any, index: number) => {
      const sanitizedProviderName = (provider.name || `provider_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (provider.providerId === 'ldap') {
        terraform += `
resource "keycloak_ldap_user_federation" "${sanitizedProviderName}" {
  realm_id    = var.realm_id
  name        = "${provider.name || `provider_${index}`}"
  enabled     = ${provider.config?.enabled?.[0] !== 'false'}
  
  username_ldap_attribute = "${provider.config?.usernameLDAPAttribute?.[0] || 'uid'}"
  rdn_ldap_attribute     = "${provider.config?.rdnLDAPAttribute?.[0] || 'uid'}"
  uuid_ldap_attribute    = "${provider.config?.uuidLDAPAttribute?.[0] || 'entryUUID'}"
  
  connection_url      = "${provider.config?.connectionUrl?.[0] || ''}"
  users_dn           = "${provider.config?.usersDn?.[0] || ''}"
  bind_dn            = "${provider.config?.bindDn?.[0] || ''}"
  bind_credential    = "${provider.config?.bindCredential?.[0] || ''}"
  
  search_scope       = "${provider.config?.searchScope?.[0] || 'SUBTREE'}"
  validate_password_policy = ${provider.config?.validatePasswordPolicy?.[0] === 'true'}
  trust_email        = ${provider.config?.trustEmail?.[0] === 'true'}
  
  ${provider.config?.userObjectClasses?.[0] ? `user_object_classes = ${JSON.stringify(provider.config.userObjectClasses[0].split(',').map((s: string) => s.trim()))}` : ''}
  
  # Sync settings
  batch_size_for_sync    = ${provider.config?.batchSizeForSync?.[0] || '1000'}
  full_sync_period       = ${provider.config?.fullSyncPeriod?.[0] || '-1'}
  changed_sync_period    = ${provider.config?.changedSyncPeriod?.[0] || '-1'}
  
  # Cache settings
  cache_policy = "${provider.config?.cachePolicy?.[0] || 'DEFAULT'}"
}
`;
      }
    });
  }

  return terraform;
}

function generateUserFederationMappersTerraform(provider: any, realmName: string): string {
  const sanitizedProviderName = (provider.name || 'provider').replace(/[^a-zA-Z0-9_]/g, '_');
  
  let terraform = `# User Federation Mappers for: ${provider.name}
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Data source for user federation provider reference
data "keycloak_ldap_user_federation" "${sanitizedProviderName}" {
  realm_id = var.realm_id
  name     = "${provider.name}"
}

`;

  // Generate LDAP attribute mappers
  if (provider.config) {
    const mappers = [
      { name: 'username', ldap_attribute: provider.config.usernameLDAPAttribute?.[0] || 'uid', user_model_attribute: 'username' },
      { name: 'first_name', ldap_attribute: 'givenName', user_model_attribute: 'firstName' },
      { name: 'last_name', ldap_attribute: 'sn', user_model_attribute: 'lastName' },
      { name: 'email', ldap_attribute: 'mail', user_model_attribute: 'email' },
      { name: 'phone', ldap_attribute: 'telephoneNumber', user_model_attribute: 'phone' }
    ];

    mappers.forEach((mapper, mapperIndex) => {
      terraform += `
resource "keycloak_ldap_user_attribute_mapper" "${sanitizedProviderName}_${mapper.name}" {
  realm_id                = var.realm_id
  ldap_user_federation_id = data.keycloak_ldap_user_federation.${sanitizedProviderName}.id
  name                    = "${mapper.name}"
  ldap_attribute          = "${mapper.ldap_attribute}"
  user_model_attribute    = "${mapper.user_model_attribute}"
}
`;
    });
  }

  return terraform;
}

function generateClientPoliciesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} client policies
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateClientPoliciesTerraform(realmData: any, realmName: string): string {
  let terraform = `# Client Policies configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

`;

  // Client Profiles
  if (realmData.clientProfiles && realmData.clientProfiles.profiles) {
    realmData.clientProfiles.profiles.forEach((profile: any, index: number) => {
      const sanitizedProfileName = (profile.name || `profile_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Client Profile: ${profile.name}
resource "null_resource" "client_profile_${sanitizedProfileName}" {
  triggers = {
    profile_config = jsonencode({
      name        = "${profile.name || `profile_${index}`}"
      description = "${profile.description || ''}"
      executors   = ${JSON.stringify(profile.executors || [])}
    })
  }
  
  provisioner "local-exec" {
    command = "echo 'Client Profile ${profile.name} needs manual configuration in Keycloak Admin Console'"
  }
}
`;
    });
  }

  // Client Policies
  if (realmData.clientPolicies && realmData.clientPolicies.policies) {
    realmData.clientPolicies.policies.forEach((policy: any, index: number) => {
      const sanitizedPolicyName = (policy.name || `policy_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `
# Client Policy: ${policy.name}
resource "null_resource" "client_policy_${sanitizedPolicyName}" {
  triggers = {
    policy_config = jsonencode({
      name        = "${policy.name || `policy_${index}`}"
      description = "${policy.description || ''}"
      enabled     = ${policy.enabled !== false}
      conditions  = ${JSON.stringify(policy.conditions || [])}
      profiles    = ${JSON.stringify(policy.profiles || [])}
    })
  }
  
  provisioner "local-exec" {
    command = "echo 'Client Policy ${policy.name} needs manual configuration in Keycloak Admin Console'"
  }
}
`;
    });
  }

  return terraform;
}

function generateThemesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} themes
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateThemesTerraform(realmData: any, realmName: string): string {
  return `# Custom Themes configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Note: Keycloak provider doesn't directly support theme management
# These would typically be managed outside of Terraform
# However, we can configure theme references in the realm

locals {
  themes = {
    ${realmData.loginTheme ? `login_theme = "${realmData.loginTheme}"` : ''}
    ${realmData.accountTheme ? `account_theme = "${realmData.accountTheme}"` : ''}
    ${realmData.adminTheme ? `admin_theme = "${realmData.adminTheme}"` : ''}
    ${realmData.emailTheme ? `email_theme = "${realmData.emailTheme}"` : ''}
  }
}

# Custom theme deployment would require additional tooling
# This is a placeholder for theme management
resource "null_resource" "deploy_themes" {
  triggers = {
    themes_hash = md5(jsonencode(local.themes))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Custom themes need to be deployed separately:"
      ${realmData.loginTheme ? `echo "Login Theme: ${realmData.loginTheme}"` : ''}
      ${realmData.accountTheme ? `echo "Account Theme: ${realmData.accountTheme}"` : ''}
      ${realmData.adminTheme ? `echo "Admin Theme: ${realmData.adminTheme}"` : ''}
      ${realmData.emailTheme ? `echo "Email Theme: ${realmData.emailTheme}"` : ''}
    EOT
  }
}
`;
}

function generateLocalizationTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} localization
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateLocalizationTerraform(realmData: any, realmName: string): string {
  return `# Localization configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Localization settings
locals {
  localization = {
    internationalization_enabled = ${realmData.internationalizationEnabled || false}
    supported_locales           = ${JSON.stringify(realmData.supportedLocales || ['en'])}
    default_locale             = "${realmData.defaultLocale || 'en'}"
  }
}

# Note: Keycloak provider may not fully support all localization features
# This serves as documentation for the localization configuration
resource "null_resource" "localization_config" {
  triggers = {
    localization_hash = md5(jsonencode(local.localization))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Localization Configuration:"
      echo "  Internationalization Enabled: ${realmData.internationalizationEnabled || false}"
      echo "  Supported Locales: ${(realmData.supportedLocales || ['en']).join(', ')}"
      echo "  Default Locale: ${realmData.defaultLocale || 'en'}"
    EOT
  }
}
`;
}

function generateSecurityPoliciesTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} security policies
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateSecurityPoliciesTerraform(realmData: any, realmName: string): string {
  return `# Security Policies configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Password Policy
${realmData.passwordPolicy ? `
resource "keycloak_realm_keystore_aes_generated" "aes_generated" {
  realm_id  = var.realm_id
  name      = "aes-generated"
  priority  = 100
}

resource "keycloak_realm_keystore_hmac_generated" "hmac_generated" {
  realm_id  = var.realm_id
  name      = "hmac-generated"
  priority  = 100
  algorithm = "HS256"
}

resource "keycloak_realm_keystore_rsa_generated" "rsa_generated" {
  realm_id  = var.realm_id
  name      = "rsa-generated"
  priority  = 100
  algorithm = "RS256"
}
` : ''}

# OTP Policy
${realmData.otpPolicyType ? `
resource "keycloak_default_groups" "default_groups" {
  realm_id  = var.realm_id
  group_ids = []
}
` : ''}

# Brute Force Protection
locals {
  brute_force_protection = {
    enabled                    = ${realmData.bruteForceProtected || false}
    permanent_lockout         = ${realmData.permanentLockout || false}
    max_login_failures        = ${realmData.maxFailureWait || 900}
    wait_increment_seconds    = ${realmData.waitIncrementSeconds || 60}
    quick_login_check_millis  = ${realmData.quickLoginCheckMilliSeconds || 1000}
    minimum_quick_login_wait  = ${realmData.minimumQuickLoginWaitSeconds || 60}
    max_failure_wait_seconds  = ${realmData.maxFailureWait || 900}
    failure_reset_time_seconds = ${realmData.failureFactor || 30}
  }
}

# Content Security Policy
locals {
  security_headers = {
    content_security_policy           = "${realmData.browserSecurityHeaders?.contentSecurityPolicy || "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"}"
    content_security_policy_report_only = "${realmData.browserSecurityHeaders?.contentSecurityPolicyReportOnly || ''}"
    x_content_type_options           = "${realmData.browserSecurityHeaders?.xContentTypeOptions || 'nosniff'}"
    x_frame_options                  = "${realmData.browserSecurityHeaders?.xFrameOptions || 'SAMEORIGIN'}"
    x_robots_tag                     = "${realmData.browserSecurityHeaders?.xRobotsTag || 'none'}"
    x_xss_protection                 = "${realmData.browserSecurityHeaders?.xXSSProtection || '1; mode=block'}"
    strict_transport_security        = "${realmData.browserSecurityHeaders?.strictTransportSecurity || 'max-age=31536000; includeSubDomains'}"
  }
}
`;
}

function generateEventsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} events
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateEventsTerraform(realmData: any, realmName: string): string {
  return `# Events configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Event Listeners Configuration
locals {
  events_config = {
    events_enabled           = ${realmData.eventsEnabled || false}
    events_expiration        = ${realmData.eventsExpiration || 0}
    admin_events_enabled     = ${realmData.adminEventsEnabled || false}
    admin_events_details_enabled = ${realmData.adminEventsDetailsEnabled || false}
    
    ${realmData.eventsListeners ? `
    events_listeners = ${JSON.stringify(realmData.eventsListeners)}` : ''}
    
    ${realmData.enabledEventTypes ? `
    enabled_event_types = ${JSON.stringify(realmData.enabledEventTypes)}` : ''}
  }
}

# Custom Event Listeners (would require custom providers or external management)
${realmData.eventsListeners && realmData.eventsListeners.includes('jboss-logging') ? `
resource "null_resource" "jboss_logging_listener" {
  provisioner "local-exec" {
    command = "echo 'JBoss logging event listener configured'"
  }
}
` : ''}

${realmData.eventsListeners && realmData.eventsListeners.some((listener: string) => listener !== 'jboss-logging') ? `
resource "null_resource" "custom_event_listeners" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Custom event listeners need to be deployed:"
      ${realmData.eventsListeners.filter((l: string) => l !== 'jboss-logging').map((listener: string) => 
        `echo "  - ${listener}"`
      ).join('\n      ')}
    EOT
  }
}
` : ''}
`;
}

function generateOTPPolicyTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} OTP policy
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateOTPPolicyTerraform(realmData: any, realmName: string): string {
  return `# OTP Policy configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# OTP Policy Configuration
locals {
  otp_policy = {
    type                  = "${realmData.otpPolicyType || 'totp'}"
    algorithm             = "${realmData.otpPolicyAlgorithm || 'HmacSHA1'}"
    initial_counter       = ${realmData.otpPolicyInitialCounter || 0}
    digits                = ${realmData.otpPolicyDigits || 6}
    look_ahead_window     = ${realmData.otpPolicyLookAheadWindow || 1}
    period                = ${realmData.otpPolicyPeriod || 30}
    code_reusable         = ${realmData.otpPolicyCodeReusable || false}
  }
}

# Note: OTP Policy configuration may require direct realm configuration
resource "null_resource" "otp_policy_info" {
  triggers = {
    otp_policy_hash = md5(jsonencode(local.otp_policy))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "OTP Policy Configuration:"
      echo "  Type: ${realmData.otpPolicyType || 'totp'}"
      echo "  Algorithm: ${realmData.otpPolicyAlgorithm || 'HmacSHA1'}"
      echo "  Digits: ${realmData.otpPolicyDigits || 6}"
      echo "  Period: ${realmData.otpPolicyPeriod || 30}"
    EOT
  }
}
`;
}

function generateWebAuthnPolicyTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} WebAuthn policy
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateWebAuthnPolicyTerraform(realmData: any, realmName: string): string {
  return `# WebAuthn Policy configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# WebAuthn Policy Configuration
locals {
  webauthn_policy = {
    rp_entity_name                     = "${realmData.webAuthnPolicyRpEntityName || ''}"
    signature_algorithms               = ${JSON.stringify(realmData.webAuthnPolicySignatureAlgorithms || ['ES256'])}
    rp_id                             = "${realmData.webAuthnPolicyRpId || ''}"
    attestation_conveyance_preference = "${realmData.webAuthnPolicyAttestationConveyancePreference || 'not specified'}"
    authenticator_attachment          = "${realmData.webAuthnPolicyAuthenticatorAttachment || 'not specified'}"
    require_resident_key              = "${realmData.webAuthnPolicyRequireResidentKey || 'not specified'}"
    user_verification_requirement     = "${realmData.webAuthnPolicyUserVerificationRequirement || 'not specified'}"
    create_timeout                    = ${realmData.webAuthnPolicyCreateTimeout || 0}
    avoid_same_authenticator_register = ${realmData.webAuthnPolicyAvoidSameAuthenticatorRegister || false}
  }
}

# Note: WebAuthn Policy configuration may require direct realm configuration
resource "null_resource" "webauthn_policy_info" {
  triggers = {
    webauthn_policy_hash = md5(jsonencode(local.webauthn_policy))
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "WebAuthn Policy Configuration:"
      echo "  RP Entity Name: ${realmData.webAuthnPolicyRpEntityName || ''}"
      echo "  Signature Algorithms: ${(realmData.webAuthnPolicySignatureAlgorithms || ['ES256']).join(', ')}"
      echo "  User Verification: ${realmData.webAuthnPolicyUserVerificationRequirement || 'not specified'}"
    EOT
  }
}
`;
}

function generateRealmKeysTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} realm keys
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRealmKeysTerraform(realmData: any, realmName: string): string {
  return `# Realm Keys and Certificates configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# RSA Key Generation
resource "keycloak_realm_keystore_rsa_generated" "realm_rsa_key" {
  realm_id  = var.realm_id
  name      = "${realmName}-rsa-generated"
  priority  = 100
  algorithm = "RS256"
  key_size  = 2048
}

# AES Key Generation
resource "keycloak_realm_keystore_aes_generated" "realm_aes_key" {
  realm_id = var.realm_id
  name     = "${realmName}-aes-generated"
  priority = 100
}

# HMAC Key Generation
resource "keycloak_realm_keystore_hmac_generated" "realm_hmac_key" {
  realm_id  = var.realm_id
  name      = "${realmName}-hmac-generated"
  priority  = 100
  algorithm = "HS256"
}

${realmData.publicKey ? `
# Custom RSA Key Pair (if provided)
resource "keycloak_realm_keystore_rsa" "custom_rsa_key" {
  realm_id    = var.realm_id
  name        = "${realmName}-custom-rsa"
  priority    = 200
  algorithm   = "RS256"
  
  private_key = "${realmData.privateKey || ''}"
  certificate = "${realmData.certificate || ''}"
}
` : ''}
`;
}

function generateRequiredCredentialsTerragruntConfig(realmName: string): string {
  return `# Terragrunt configuration for ${realmName} required credentials
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = ".//"
}

dependency "realm" {
  config_path = "../realm"
}

inputs = {
  realm_id = dependency.realm.outputs.realm_id
}
`;
}

function generateRequiredCredentialsTerraform(requiredCredentials: any[], realmName: string): string {
  return `# Required Credentials configuration
variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

# Required Credentials Configuration
locals {
  required_credentials = ${JSON.stringify(requiredCredentials, null, 2)}
}

# Note: Required credentials are typically managed at the realm level
# This configuration documents the credential requirements
resource "null_resource" "required_credentials_info" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Required credentials for realm ${realmName}:"
${requiredCredentials.map((cred: any) => 
  `      echo "  - Type: ${cred.type || 'password'}, Input: ${cred.input || false}, Secret: ${cred.secret || false}"`
).join('\n')}
    EOT
  }
}
`;
}
