
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

    // Generate client scopes
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

    // Generate protocol mappers
    if (client.protocolMappers && client.protocolMappers.length > 0) {
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
  
  ${role.composite ? `
  composite_roles = [
    ${role.composites?.realm?.map((r: string) => `"${r}"`).join(',\n    ') || ''}
  ]` : ''}
}
`;
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

    // Generate identity provider mappers
    if (idp.mappers && idp.mappers.length > 0) {
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
      const sanitizedProviderName = (provider.name || `ldap_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (provider.providerId === 'ldap') {
        terraform += `
resource "keycloak_ldap_user_federation" "${sanitizedProviderName}" {
  realm_id    = var.realm_id
  name        = "${provider.name || `ldap_${index}`}"
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

        // Generate LDAP attribute mappers
        if (provider.config) {
          const mappers = [
            { name: 'username', ldap_attribute: provider.config.usernameLDAPAttribute?.[0] || 'uid', user_model_attribute: 'username' },
            { name: 'first_name', ldap_attribute: 'givenName', user_model_attribute: 'firstName' },
            { name: 'last_name', ldap_attribute: 'sn', user_model_attribute: 'lastName' },
            { name: 'email', ldap_attribute: 'mail', user_model_attribute: 'email' }
          ];

          mappers.forEach((mapper, mapperIndex) => {
            terraform += `
resource "keycloak_ldap_user_attribute_mapper" "${sanitizedProviderName}_${mapper.name}" {
  realm_id                = var.realm_id
  ldap_user_federation_id = keycloak_ldap_user_federation.${sanitizedProviderName}.id
  name                    = "${mapper.name}"
  ldap_attribute          = "${mapper.ldap_attribute}"
  user_model_attribute    = "${mapper.user_model_attribute}"
}
`;
          });
        }
      }
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

// Helper functions
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
