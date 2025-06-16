/**
 * Converts a Keycloak realm.json to modular Terraform/Terragrunt structure
 * Handles comprehensive Keycloak configurations including all advanced features
 */

export interface TerraformFile {
  filePath: string;
  content: string;
}

export function keycloakRealmJsonToTerragrunt(json: any, fileName: string): TerraformFile[] {
  if (!json || typeof json !== "object" || !json.realm) {
    return [{
      filePath: `keycloak/realms/${fileName.replace(/\.[^.]+$/, '')}/main.tf`,
      content: `# Could not parse realm file: missing "realm" property`
    }];
  }

  const realm = json.realm;
  const realmDir = `keycloak/realms/${realm}`;
  const files: TerraformFile[] = [];

  // Main realm module file
  files.push({
    filePath: `${realmDir}/main.tf`,
    content: generateRealmMain(json, realm)
  });

  // Variables and outputs
  files.push({
    filePath: `${realmDir}/variables.tf`,
    content: generateRealmVariables()
  });

  files.push({
    filePath: `${realmDir}/outputs.tf`,
    content: generateRealmOutputs()
  });

  // Roles submodule
  if (hasRoles(json)) {
    addRolesModule(files, realmDir, json.roles, realm);
  }

  // Groups submodule
  if (Array.isArray(json.groups) && json.groups.length > 0) {
    addGroupsModule(files, realmDir, json.groups, realm);
  }

  // Users submodule
  if (Array.isArray(json.users) && json.users.length > 0) {
    addUsersModule(files, realmDir, json.users, realm);
  }

  // Clients submodule
  if (Array.isArray(json.clients) && json.clients.length > 0) {
    addClientsModule(files, realmDir, json.clients, realm);
  }

  // Client Scopes submodule
  if (Array.isArray(json.clientScopes) && json.clientScopes.length > 0) {
    addClientScopesModule(files, realmDir, json.clientScopes, realm);
  }

  // Protocol Mappers submodule
  if (hasProtocolMappers(json)) {
    addProtocolMappersModule(files, realmDir, json, realm);
  }

  // Scope Mappings submodule
  if (Array.isArray(json.scopeMappings) && json.scopeMappings.length > 0) {
    addScopeMappingsModule(files, realmDir, json.scopeMappings, realm);
  }

  // Identity Providers submodule
  if (Array.isArray(json.identityProviders) && json.identityProviders.length > 0) {
    addIdentityProvidersModule(files, realmDir, json.identityProviders, realm);
  }

  // Identity Provider Mappers submodule
  if (hasIdentityProviderMappers(json)) {
    addIdentityProviderMappersModule(files, realmDir, json.identityProviders, realm);
  }

  // Authentication Flows submodule
  if (Array.isArray(json.authenticationFlows) && json.authenticationFlows.length > 0) {
    addAuthenticationFlowsModule(files, realmDir, json.authenticationFlows, realm);
  }

  // User Federation submodule
  if (Array.isArray(json.components) && hasUserFederation(json.components)) {
    addUserFederationModule(files, realmDir, json.components, realm);
  }

  // Required Actions submodule
  if (Array.isArray(json.requiredActions) && json.requiredActions.length > 0) {
    addRequiredActionsModule(files, realmDir, json.requiredActions, realm);
  }

  // Realm Events submodule
  if (json.eventsEnabled || json.adminEventsEnabled) {
    addRealmEventsModule(files, realmDir, json, realm);
  }

  // Client Policies submodule
  if (hasClientPolicies(json)) {
    addClientPoliciesModule(files, realmDir, json, realm);
  }

  // Root keycloak module files
  files.push({
    filePath: `keycloak/main.tf`,
    content: generateKeycloakMain()
  });

  files.push({
    filePath: `keycloak/variables.tf`,
    content: generateKeycloakVariables()
  });

  files.push({
    filePath: `keycloak/outputs.tf`,
    content: generateKeycloakOutputs()
  });

  return files;
}

// Helper functions to check for existence of various components
function hasRoles(json: any): boolean {
  return (Array.isArray(json.roles?.realm) && json.roles.realm.length > 0) || 
         (json.roles?.client && Object.keys(json.roles.client).length > 0);
}

function hasProtocolMappers(json: any): boolean {
  return Array.isArray(json.protocolMappers) && json.protocolMappers.length > 0 ||
         (Array.isArray(json.clients) && json.clients.some((c: any) => 
           Array.isArray(c.protocolMappers) && c.protocolMappers.length > 0)) ||
         (Array.isArray(json.clientScopes) && json.clientScopes.some((cs: any) => 
           Array.isArray(cs.protocolMappers) && cs.protocolMappers.length > 0));
}

function hasIdentityProviderMappers(json: any): boolean {
  return Array.isArray(json.identityProviders) && 
         json.identityProviders.some((idp: any) => 
           Array.isArray(idp.identityProviderMappers) && idp.identityProviderMappers.length > 0);
}

function hasUserFederation(components: any[]): boolean {
  return components.some((c: any) => 
    c.providerId && (c.providerId === 'ldap' || c.subType === 'ldap' || c.providerId === 'kerberos'));
}

function hasClientPolicies(json: any): boolean {
  return json.clientPolicies || json.clientProfiles;
}

// Module generators
function addRolesModule(files: TerraformFile[], realmDir: string, roles: any, realm: string) {
  files.push({
    filePath: `${realmDir}/roles/main.tf`,
    content: generateRolesModule(roles, realm)
  });
  files.push({
    filePath: `${realmDir}/roles/variables.tf`,
    content: generateRolesVariables()
  });
  files.push({
    filePath: `${realmDir}/roles/outputs.tf`,
    content: generateRolesOutputs()
  });
}

function addGroupsModule(files: TerraformFile[], realmDir: string, groups: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/groups/main.tf`,
    content: generateGroupsModule(groups, realm)
  });
  files.push({
    filePath: `${realmDir}/groups/variables.tf`,
    content: generateGroupsVariables()
  });
  files.push({
    filePath: `${realmDir}/groups/outputs.tf`,
    content: generateGroupsOutputs()
  });
}

function addUsersModule(files: TerraformFile[], realmDir: string, users: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/users/main.tf`,
    content: generateUsersModule(users, realm)
  });
  files.push({
    filePath: `${realmDir}/users/variables.tf`,
    content: generateUsersVariables()
  });
  files.push({
    filePath: `${realmDir}/users/outputs.tf`,
    content: generateUsersOutputs()
  });
}

function addClientsModule(files: TerraformFile[], realmDir: string, clients: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/clients/main.tf`,
    content: generateClientsModule(clients, realm)
  });
  files.push({
    filePath: `${realmDir}/clients/variables.tf`,
    content: generateClientsVariables()
  });
  files.push({
    filePath: `${realmDir}/clients/outputs.tf`,
    content: generateClientsOutputs()
  });
}

function addClientScopesModule(files: TerraformFile[], realmDir: string, clientScopes: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/client-scopes/main.tf`,
    content: generateClientScopesModule(clientScopes, realm)
  });
  files.push({
    filePath: `${realmDir}/client-scopes/variables.tf`,
    content: generateClientScopesVariables()
  });
  files.push({
    filePath: `${realmDir}/client-scopes/outputs.tf`,
    content: generateClientScopesOutputs()
  });
}

function addProtocolMappersModule(files: TerraformFile[], realmDir: string, json: any, realm: string) {
  files.push({
    filePath: `${realmDir}/protocol-mappers/main.tf`,
    content: generateProtocolMappersModule(json, realm)
  });
  files.push({
    filePath: `${realmDir}/protocol-mappers/variables.tf`,
    content: generateProtocolMappersVariables()
  });
  files.push({
    filePath: `${realmDir}/protocol-mappers/outputs.tf`,
    content: generateProtocolMappersOutputs()
  });
}

function addScopeMappingsModule(files: TerraformFile[], realmDir: string, scopeMappings: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/scope-mappings/main.tf`,
    content: generateScopeMappingsModule(scopeMappings, realm)
  });
  files.push({
    filePath: `${realmDir}/scope-mappings/variables.tf`,
    content: generateScopeMappingsVariables()
  });
  files.push({
    filePath: `${realmDir}/scope-mappings/outputs.tf`,
    content: generateScopeMappingsOutputs()
  });
}

function addIdentityProvidersModule(files: TerraformFile[], realmDir: string, identityProviders: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/identity-providers/main.tf`,
    content: generateIdentityProvidersModule(identityProviders, realm)
  });
  files.push({
    filePath: `${realmDir}/identity-providers/variables.tf`,
    content: generateIdentityProvidersVariables()
  });
  files.push({
    filePath: `${realmDir}/identity-providers/outputs.tf`,
    content: generateIdentityProvidersOutputs()
  });
}

function addIdentityProviderMappersModule(files: TerraformFile[], realmDir: string, identityProviders: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/identity-provider-mappers/main.tf`,
    content: generateIdentityProviderMappersModule(identityProviders, realm)
  });
  files.push({
    filePath: `${realmDir}/identity-provider-mappers/variables.tf`,
    content: generateIdentityProviderMappersVariables()
  });
  files.push({
    filePath: `${realmDir}/identity-provider-mappers/outputs.tf`,
    content: generateIdentityProviderMappersOutputs()
  });
}

function addAuthenticationFlowsModule(files: TerraformFile[], realmDir: string, authenticationFlows: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/authentication-flows/main.tf`,
    content: generateAuthenticationFlowsModule(authenticationFlows, realm)
  });
  files.push({
    filePath: `${realmDir}/authentication-flows/variables.tf`,
    content: generateAuthenticationFlowsVariables()
  });
  files.push({
    filePath: `${realmDir}/authentication-flows/outputs.tf`,
    content: generateAuthenticationFlowsOutputs()
  });
}

function addUserFederationModule(files: TerraformFile[], realmDir: string, components: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/user-federation/main.tf`,
    content: generateUserFederationModule(components, realm)
  });
  files.push({
    filePath: `${realmDir}/user-federation/variables.tf`,
    content: generateUserFederationVariables()
  });
  files.push({
    filePath: `${realmDir}/user-federation/outputs.tf`,
    content: generateUserFederationOutputs()
  });
}

function addRequiredActionsModule(files: TerraformFile[], realmDir: string, requiredActions: any[], realm: string) {
  files.push({
    filePath: `${realmDir}/required-actions/main.tf`,
    content: generateRequiredActionsModule(requiredActions, realm)
  });
  files.push({
    filePath: `${realmDir}/required-actions/variables.tf`,
    content: generateRequiredActionsVariables()
  });
  files.push({
    filePath: `${realmDir}/required-actions/outputs.tf`,
    content: generateRequiredActionsOutputs()
  });
}

function addRealmEventsModule(files: TerraformFile[], realmDir: string, json: any, realm: string) {
  files.push({
    filePath: `${realmDir}/realm-events/main.tf`,
    content: generateRealmEventsModule(json, realm)
  });
  files.push({
    filePath: `${realmDir}/realm-events/variables.tf`,
    content: generateRealmEventsVariables()
  });
  files.push({
    filePath: `${realmDir}/realm-events/outputs.tf`,
    content: generateRealmEventsOutputs()
  });
}

function addClientPoliciesModule(files: TerraformFile[], realmDir: string, json: any, realm: string) {
  files.push({
    filePath: `${realmDir}/client-policies/main.tf`,
    content: generateClientPoliciesModule(json, realm)
  });
  files.push({
    filePath: `${realmDir}/client-policies/variables.tf`,
    content: generateClientPoliciesVariables()
  });
  files.push({
    filePath: `${realmDir}/client-policies/outputs.tf`,
    content: generateClientPoliciesOutputs()
  });
}

// Generate main realm module
function generateRealmMain(json: any, realm: string): string {
  return `# Keycloak Realm: ${realm}
terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "~> 5.0"
    }
  }
}

resource "keycloak_realm" "this" {
  realm                        = var.realm_name
  display_name                 = var.display_name
  enabled                      = var.enabled
  
  # Registration and login settings
  registration_allowed         = var.registration_allowed
  registration_email_as_username = var.registration_email_as_username
  edit_username_allowed        = var.edit_username_allowed
  reset_password_allowed       = var.reset_password_allowed
  remember_me                  = var.remember_me
  verify_email                 = var.verify_email
  login_with_email_allowed     = var.login_with_email_allowed
  duplicate_emails_allowed     = var.duplicate_emails_allowed
  
  # Password policy
  password_policy = var.password_policy
  
  # SSL settings
  ssl_required = var.ssl_required
  
  # Token settings
  access_token_lifespan               = var.access_token_lifespan
  access_token_lifespan_for_implicit_flow = var.access_token_lifespan_for_implicit_flow
  sso_session_idle_timeout           = var.sso_session_idle_timeout
  sso_session_max_lifespan           = var.sso_session_max_lifespan
  offline_session_idle_timeout       = var.offline_session_idle_timeout
  offline_session_max_lifespan       = var.offline_session_max_lifespan
  
  # Internationalization
  internationalization {
    supported_locales = var.supported_locales
    default_locale    = var.default_locale
  }
  
  # Security defenses
  security_defenses {
    headers {
      x_frame_options                     = var.x_frame_options
      content_security_policy             = var.content_security_policy
      content_security_policy_report_only = var.content_security_policy_report_only
      x_content_type_options              = var.x_content_type_options
      x_robots_tag                        = var.x_robots_tag
      x_xss_protection                    = var.x_xss_protection
      strict_transport_security           = var.strict_transport_security
    }
    brute_force_detection {
      permanent_lockout                = var.brute_force_permanent_lockout
      max_login_failures              = var.brute_force_max_login_failures
      wait_increment_seconds          = var.brute_force_wait_increment_seconds
      quick_login_check_milli_seconds = var.brute_force_quick_login_check_milli_seconds
      minimum_quick_login_wait_seconds = var.brute_force_minimum_quick_login_wait_seconds
      max_failure_wait_seconds        = var.brute_force_max_failure_wait_seconds
      failure_reset_time_seconds      = var.brute_force_failure_reset_time_seconds
    }
  }
  
  # SMTP settings
  dynamic "smtp_server" {
    for_each = var.smtp_server_enabled ? [1] : []
    content {
      host      = var.smtp_server_host
      port      = var.smtp_server_port
      from      = var.smtp_server_from
      from_display_name = var.smtp_server_from_display_name
      reply_to  = var.smtp_server_reply_to
      reply_to_display_name = var.smtp_server_reply_to_display_name
      envelope_from = var.smtp_server_envelope_from
      starttls   = var.smtp_server_starttls
      ssl        = var.smtp_server_ssl
      auth {
        username = var.smtp_server_username
        password = var.smtp_server_password
      }
    }
  }
}

# Roles module
module "roles" {
  source = "./roles"
  count  = var.create_roles ? 1 : 0
  
  realm_id     = keycloak_realm.this.id
  realm_roles  = var.realm_roles
  client_roles = var.client_roles
}

# Groups module
module "groups" {
  source = "./groups"
  count  = var.create_groups ? 1 : 0
  
  realm_id = keycloak_realm.this.id
  groups   = var.groups
}

# Users module
module "users" {
  source = "./users"
  count  = var.create_users ? 1 : 0
  
  realm_id = keycloak_realm.this.id
  users    = var.users
  
  depends_on = [module.roles, module.groups]
}

# Clients module
module "clients" {
  source = "./clients"
  count  = var.create_clients ? 1 : 0
  
  realm_id = keycloak_realm.this.id
  clients  = var.clients
}

# Client Scopes module
module "client_scopes" {
  source = "./client-scopes"
  count  = var.create_client_scopes ? 1 : 0
  
  realm_id      = keycloak_realm.this.id
  client_scopes = var.client_scopes
}

# Protocol Mappers module
module "protocol_mappers" {
  source = "./protocol-mappers"
  count  = var.create_protocol_mappers ? 1 : 0
  
  realm_id         = keycloak_realm.this.id
  protocol_mappers = var.protocol_mappers
  
  depends_on = [module.clients, module.client_scopes]
}

# Scope Mappings module
module "scope_mappings" {
  source = "./scope-mappings"
  count  = var.create_scope_mappings ? 1 : 0
  
  realm_id       = keycloak_realm.this.id
  scope_mappings = var.scope_mappings
  
  depends_on = [module.roles, module.clients]
}

# Identity Providers module
module "identity_providers" {
  source = "./identity-providers"
  count  = var.create_identity_providers ? 1 : 0
  
  realm_id           = keycloak_realm.this.id
  identity_providers = var.identity_providers
}

# Identity Provider Mappers module
module "identity_provider_mappers" {
  source = "./identity-provider-mappers"
  count  = var.create_identity_provider_mappers ? 1 : 0
  
  realm_id                     = keycloak_realm.this.id
  identity_provider_mappers    = var.identity_provider_mappers
  
  depends_on = [module.identity_providers]
}

# Authentication Flows module
module "authentication_flows" {
  source = "./authentication-flows"
  count  = var.create_authentication_flows ? 1 : 0
  
  realm_id             = keycloak_realm.this.id
  authentication_flows = var.authentication_flows
}

# User Federation module
module "user_federation" {
  source = "./user-federation"
  count  = var.create_user_federation ? 1 : 0
  
  realm_id        = keycloak_realm.this.id
  user_federation = var.user_federation
}

# Required Actions module
module "required_actions" {
  source = "./required-actions"
  count  = var.create_required_actions ? 1 : 0
  
  realm_id         = keycloak_realm.this.id
  required_actions = var.required_actions
}

# Realm Events module
module "realm_events" {
  source = "./realm-events"
  count  = var.create_realm_events ? 1 : 0
  
  realm_id     = keycloak_realm.this.id
  realm_events = var.realm_events
}

# Client Policies module
module "client_policies" {
  source = "./client-policies"
  count  = var.create_client_policies ? 1 : 0
  
  realm_id        = keycloak_realm.this.id
  client_policies = var.client_policies
  client_profiles = var.client_profiles
}`;
}

// Generate variables for the main realm module
function generateRealmVariables(): string {
  return `variable "realm_name" {
  description = "Name of the Keycloak realm"
  type        = string
}

variable "display_name" {
  description = "Display name of the realm"
  type        = string
  default     = ""
}

variable "enabled" {
  description = "Whether the realm is enabled"
  type        = bool
  default     = true
}

# Registration and login settings
variable "registration_allowed" {
  description = "Whether registration is allowed"
  type        = bool
  default     = false
}

variable "registration_email_as_username" {
  description = "Whether to use email as username for registration"
  type        = bool
  default     = false
}

variable "edit_username_allowed" {
  description = "Whether users can edit their username"
  type        = bool
  default     = false
}

variable "reset_password_allowed" {
  description = "Whether password reset is allowed"
  type        = bool
  default     = false
}

variable "remember_me" {
  description = "Whether remember me is enabled"
  type        = bool
  default     = false
}

variable "verify_email" {
  description = "Whether email verification is required"
  type        = bool
  default     = false
}

variable "login_with_email_allowed" {
  description = "Whether login with email is allowed"
  type        = bool
  default     = false
}

variable "duplicate_emails_allowed" {
  description = "Whether duplicate emails are allowed"
  type        = bool
  default     = false
}

# Password policy
variable "password_policy" {
  description = "Password policy for the realm"
  type        = string
  default     = ""
}

# SSL settings
variable "ssl_required" {
  description = "SSL requirement setting"
  type        = string
  default     = "external"
}

# Token settings
variable "access_token_lifespan" {
  description = "Access token lifespan in seconds"
  type        = number
  default     = 300
}

variable "access_token_lifespan_for_implicit_flow" {
  description = "Access token lifespan for implicit flow in seconds"
  type        = number
  default     = 900
}

variable "sso_session_idle_timeout" {
  description = "SSO session idle timeout in seconds"
  type        = number
  default     = 1800
}

variable "sso_session_max_lifespan" {
  description = "SSO session max lifespan in seconds"
  type        = number
  default     = 36000
}

variable "offline_session_idle_timeout" {
  description = "Offline session idle timeout in seconds"
  type        = number
  default     = 2592000
}

variable "offline_session_max_lifespan" {
  description = "Offline session max lifespan in seconds"
  type        = number
  default     = 5184000
}

# Internationalization
variable "supported_locales" {
  description = "List of supported locales"
  type        = list(string)
  default     = ["en"]
}

variable "default_locale" {
  description = "Default locale"
  type        = string
  default     = "en"
}

# Security defenses - Headers
variable "x_frame_options" {
  description = "X-Frame-Options header value"
  type        = string
  default     = "SAMEORIGIN"
}

variable "content_security_policy" {
  description = "Content Security Policy header value"
  type        = string
  default     = ""
}

variable "content_security_policy_report_only" {
  description = "Content Security Policy Report Only header value"
  type        = string
  default     = ""
}

variable "x_content_type_options" {
  description = "X-Content-Type-Options header value"
  type        = string
  default     = "nosniff"
}

variable "x_robots_tag" {
  description = "X-Robots-Tag header value"
  type        = string
  default     = "none"
}

variable "x_xss_protection" {
  description = "X-XSS-Protection header value"
  type        = string
  default     = "1; mode=block"
}

variable "strict_transport_security" {
  description = "Strict-Transport-Security header value"
  type        = string
  default     = "max-age=31536000; includeSubDomains"
}

# Security defenses - Brute force
variable "brute_force_permanent_lockout" {
  description = "Whether to permanently lockout after max failures"
  type        = bool
  default     = false
}

variable "brute_force_max_login_failures" {
  description = "Maximum login failures before lockout"
  type        = number
  default     = 30
}

variable "brute_force_wait_increment_seconds" {
  description = "Wait increment in seconds after failed login"
  type        = number
  default     = 60
}

variable "brute_force_quick_login_check_milli_seconds" {
  description = "Quick login check in milliseconds"
  type        = number
  default     = 1000
}

variable "brute_force_minimum_quick_login_wait_seconds" {
  description = "Minimum quick login wait in seconds"
  type        = number
  default     = 60
}

variable "brute_force_max_failure_wait_seconds" {
  description = "Maximum failure wait in seconds"
  type        = number
  default     = 900
}

variable "brute_force_failure_reset_time_seconds" {
  description = "Failure reset time in seconds"
  type        = number
  default     = 43200
}

# SMTP settings
variable "smtp_server_enabled" {
  description = "Whether SMTP server is configured"
  type        = bool
  default     = false
}

variable "smtp_server_host" {
  description = "SMTP server host"
  type        = string
  default     = ""
}

variable "smtp_server_port" {
  description = "SMTP server port"
  type        = number
  default     = 587
}

variable "smtp_server_from" {
  description = "SMTP from address"
  type        = string
  default     = ""
}

variable "smtp_server_from_display_name" {
  description = "SMTP from display name"
  type        = string
  default     = ""
}

variable "smtp_server_reply_to" {
  description = "SMTP reply-to address"
  type        = string
  default     = ""
}

variable "smtp_server_reply_to_display_name" {
  description = "SMTP reply-to display name"
  type        = string
  default     = ""
}

variable "smtp_server_envelope_from" {
  description = "SMTP envelope from address"
  type        = string
  default     = ""
}

variable "smtp_server_starttls" {
  description = "Whether to use STARTTLS"
  type        = bool
  default     = true
}

variable "smtp_server_ssl" {
  description = "Whether to use SSL"
  type        = bool
  default     = false
}

variable "smtp_server_username" {
  description = "SMTP server username"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_server_password" {
  description = "SMTP server password"
  type        = string
  default     = ""
  sensitive   = true
}

# Module toggles
variable "create_roles" {
  description = "Whether to create roles"
  type        = bool
  default     = false
}

variable "create_groups" {
  description = "Whether to create groups"
  type        = bool
  default     = false
}

variable "create_users" {
  description = "Whether to create users"
  type        = bool
  default     = false
}

variable "create_clients" {
  description = "Whether to create clients"
  type        = bool
  default     = false
}

variable "create_client_scopes" {
  description = "Whether to create client scopes"
  type        = bool
  default     = false
}

variable "create_protocol_mappers" {
  description = "Whether to create protocol mappers"
  type        = bool
  default     = false
}

variable "create_scope_mappings" {
  description = "Whether to create scope mappings"
  type        = bool
  default     = false
}

variable "create_identity_providers" {
  description = "Whether to create identity providers"
  type        = bool
  default     = false
}

variable "create_identity_provider_mappers" {
  description = "Whether to create identity provider mappers"
  type        = bool
  default     = false
}

variable "create_authentication_flows" {
  description = "Whether to create authentication flows"
  type        = bool
  default     = false
}

variable "create_user_federation" {
  description = "Whether to create user federation"
  type        = bool
  default     = false
}

variable "create_required_actions" {
  description = "Whether to create required actions"
  type        = bool
  default     = false
}

variable "create_realm_events" {
  description = "Whether to create realm events configuration"
  type        = bool
  default     = false
}

variable "create_client_policies" {
  description = "Whether to create client policies"
  type        = bool
  default     = false
}

# Data variables
variable "realm_roles" {
  description = "List of realm roles to create"
  type        = list(object({
    name        = string
    description = optional(string)
    composite   = optional(bool, false)
    attributes  = optional(map(list(string)), {})
  }))
  default = []
}

variable "client_roles" {
  description = "Map of client roles organized by client ID"
  type        = map(list(object({
    name        = string
    description = optional(string)
    composite   = optional(bool, false)
    attributes  = optional(map(list(string)), {})
  })))
  default = {}
}

variable "groups" {
  description = "List of groups to create"
  type        = list(object({
    name       = string
    path       = optional(string)
    parent_id  = optional(string)
    attributes = optional(map(list(string)), {})
  }))
  default = []
}

variable "users" {
  description = "List of users to create"
  type        = list(object({
    username      = string
    email         = optional(string)
    first_name    = optional(string)
    last_name     = optional(string)
    enabled       = optional(bool, true)
    attributes    = optional(map(list(string)), {})
    groups        = optional(list(string), [])
    realm_roles   = optional(list(string), [])
    client_roles  = optional(map(list(string)), {})
  }))
  default = []
}

variable "clients" {
  description = "List of clients to create"
  type        = list(object({
    client_id                    = string
    name                         = optional(string)
    description                  = optional(string)
    enabled                      = optional(bool, true)
    access_type                  = optional(string, "CONFIDENTIAL")
    valid_redirect_uris          = optional(list(string), [])
    web_origins                  = optional(list(string), [])
    admin_url                    = optional(string)
    base_url                     = optional(string)
    root_url                     = optional(string)
    standard_flow_enabled        = optional(bool, true)
    implicit_flow_enabled        = optional(bool, false)
    direct_access_grants_enabled = optional(bool, true)
    service_accounts_enabled     = optional(bool, false)
    authorization_services_enabled = optional(bool, false)
    public_client                = optional(bool, false)
    frontchannel_logout_enabled  = optional(bool, false)
    attributes                   = optional(map(any), {})
  }))
  default = []
}

variable "client_scopes" {
  description = "List of client scopes to create"
  type        = list(object({
    name        = string
    description = optional(string)
    protocol    = optional(string, "openid-connect")
    attributes  = optional(map(any), {})
    consent_screen_text = optional(string)
  }))
  default = []
}

variable "protocol_mappers" {
  description = "Protocol mappers configuration"
  type = object({
    client_mappers = optional(list(object({
      client_id       = string
      name            = string
      protocol_mapper = string
      config          = map(string)
    })), [])
    client_scope_mappers = optional(list(object({
      client_scope_id = string
      name            = string
      protocol_mapper = string
      config          = map(string)
    })), [])
  })
  default = {
    client_mappers = []
    client_scope_mappers = []
  }
}

variable "scope_mappings" {
  description = "Scope mappings configuration"
  type = list(object({
    client_id = string
    roles     = list(string)
  }))
  default = []
}

variable "identity_providers" {
  description = "List of identity providers to create"
  type        = list(object({
    alias                     = string
    display_name              = optional(string)
    provider_id               = string
    enabled                   = optional(bool, true)
    store_token              = optional(bool, false)
    add_read_token_role_on_create = optional(bool, false)
    authenticate_by_default   = optional(bool, false)
    link_only                = optional(bool, false)
    first_broker_login_flow_alias = optional(string)
    post_broker_login_flow_alias  = optional(string)
    config                   = optional(map(string), {})
  }))
  default = []
}

variable "identity_provider_mappers" {
  description = "Identity provider mappers configuration"
  type = list(object({
    identity_provider_alias = string
    name                   = string
    mapper_type            = string
    config                 = map(string)
  }))
  default = []
}

variable "authentication_flows" {
  description = "List of authentication flows to create"
  type        = list(object({
    alias       = string
    description = optional(string)
    provider_id = optional(string, "basic-flow")
    top_level   = optional(bool, true)
    built_in    = optional(bool, false)
    executions  = optional(list(object({
      authenticator = string
      requirement   = string
      priority      = number
      config        = optional(map(string), {})
    })), [])
  }))
  default = []
}

variable "user_federation" {
  description = "User federation providers configuration"
  type = object({
    ldap_providers = optional(list(object({
      name                     = string
      enabled                  = optional(bool, true)
      priority                 = optional(number, 0)
      import_enabled           = optional(bool, true)
      edit_mode                = optional(string, "READ_ONLY")
      sync_registrations       = optional(bool, false)
      vendor                   = optional(string, "other")
      username_ldap_attribute  = optional(string, "uid")
      rdn_ldap_attribute       = optional(string, "uid")
      uuid_ldap_attribute      = optional(string, "entryUUID")
      user_object_classes      = optional(list(string), ["inetOrgPerson", "organizationalPerson"])
      connection_url           = string
      users_dn                 = string
      bind_dn                  = optional(string)
      bind_credential          = optional(string)
      search_scope             = optional(string, "1")
      connection_timeout       = optional(number, 5000)
      read_timeout             = optional(number, 10000)
      pagination               = optional(bool, false)
      batch_size_for_sync      = optional(number, 1000)
      full_sync_period         = optional(number, 86400)
      changed_sync_period      = optional(number, 43200)
    })), [])
    kerberos_providers = optional(list(object({
      name                     = string
      realm                    = string
      principal                = string
      keytab                   = string
      server_principal         = optional(string)
      key_tab                  = optional(string)
      debug                    = optional(bool, false)
      allow_password_authentication = optional(bool, false)
      update_profile_first_login = optional(bool, true)
    })), [])
  })
  default = {
    ldap_providers = []
    kerberos_providers = []
  }
}

variable "required_actions" {
  description = "Required actions configuration"
  type = list(object({
    alias         = string
    name          = string
    enabled       = optional(bool, true)
    default_action = optional(bool, false)
    priority      = optional(number, 0)
  }))
  default = []
}

variable "realm_events" {
  description = "Realm events configuration"
  type = object({
    events_enabled          = optional(bool, false)
    events_expiration       = optional(number, 0)
    events_listeners        = optional(list(string), ["jboss-logging"])
    admin_events_enabled    = optional(bool, false)
    admin_events_details_enabled = optional(bool, false)
    event_types             = optional(list(string), [])
  })
  default = {
    events_enabled = false
    admin_events_enabled = false
  }
}

variable "client_policies" {
  description = "Client policies configuration"
  type = list(object({
    name        = string
    description = optional(string)
    enabled     = optional(bool, true)
    conditions  = list(object({
      type      = string
      config    = map(string)
    }))
    profiles    = list(string)
  }))
  default = []
}

variable "client_profiles" {
  description = "Client profiles configuration"
  type = list(object({
    name        = string
    description = optional(string)
    executors   = list(object({
      type      = string
      config    = map(string)
    }))
  }))
  default = []
}`;
}

// Generate outputs for the main realm module
function generateRealmOutputs(): string {
  return `output "realm_id" {
  description = "ID of the created realm"
  value       = keycloak_realm.this.id
}

output "realm_name" {
  description = "Name of the created realm"
  value       = keycloak_realm.this.realm
}

output "roles" {
  description = "Created roles"
  value       = var.create_roles ? module.roles[0].roles : {}
}

output "groups" {
  description = "Created groups"
  value       = var.create_groups ? module.groups[0].groups : {}
}

output "users" {
  description = "Created users"
  value       = var.create_users ? module.users[0].users : {}
}

output "clients" {
  description = "Created clients"
  value       = var.create_clients ? module.clients[0].clients : {}
}

output "client_scopes" {
  description = "Created client scopes"
  value       = var.create_client_scopes ? module.client_scopes[0].client_scopes : {}
}

output "protocol_mappers" {
  description = "Created protocol mappers"
  value       = var.create_protocol_mappers ? module.protocol_mappers[0].protocol_mappers : {}
}

output "scope_mappings" {
  description = "Created scope mappings"
  value       = var.create_scope_mappings ? module.scope_mappings[0].scope_mappings : {}
}

output "identity_provider_mappers" {
  description = "Created identity provider mappers"
  value       = var.create_identity_provider_mappers ? module.identity_provider_mappers[0].identity_provider_mappers : {}
}

output "user_federation" {
  description = "Created user federation providers"
  value       = var.create_user_federation ? module.user_federation[0].user_federation : {}
}

output "required_actions" {
  description = "Created required actions"
  value       = var.create_required_actions ? module.required_actions[0].required_actions : {}
}

output "realm_events" {
  description = "Realm events configuration"
  value       = var.create_realm_events ? module.realm_events[0].realm_events : {}
}

output "client_policies" {
  description = "Created client policies and profiles"
  value       = var.create_client_policies ? module.client_policies[0].client_policies : {}
}`;
}

function generateRolesModule(roles: any, realm: string): string {
  return `# Roles for realm: ${realm}

# Realm roles
resource "keycloak_role" "realm_roles" {
  for_each = { for role in var.realm_roles : role.name => role }
  
  realm_id    = var.realm_id
  name        = each.value.name
  description = each.value.description
  composite_roles = each.value.composite ? [] : null
  
  dynamic "attributes" {
    for_each = each.value.attributes
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}

# Client roles (for each client)
resource "keycloak_role" "client_roles" {
  for_each = merge([
    for client_id, roles in var.client_roles : {
      for role in roles : "\${client_id}.\${role.name}" => {
        client_id   = client_id
        name        = role.name
        description = role.description
        composite   = role.composite
        attributes  = role.attributes
      }
    }
  ]...)
  
  realm_id    = var.realm_id
  client_id   = each.value.client_id
  name        = each.value.name
  description = each.value.description
  composite_roles = each.value.composite ? [] : null
  
  dynamic "attributes" {
    for_each = each.value.attributes
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}`;
}

function generateRolesVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "realm_roles" {
  description = "List of realm roles to create"
  type        = list(object({
    name        = string
    description = optional(string)
    composite   = optional(bool, false)
    attributes  = optional(map(list(string)), {})
  }))
  default = []
}

variable "client_roles" {
  description = "Map of client roles organized by client ID"
  type        = map(list(object({
    name        = string
    description = optional(string)
    composite   = optional(bool, false)
    attributes  = optional(map(list(string)), {})
  })))
  default = {}
}`;
}

function generateRolesOutputs(): string {
  return `output "roles" {
  description = "Map of all created roles"
  value = {
    realm_roles = {
      for k, role in keycloak_role.realm_roles : k => {
        id          = role.id
        name        = role.name
        description = role.description
      }
    }
    client_roles = {
      for k, role in keycloak_role.client_roles : k => {
        id          = role.id
        name        = role.name
        client_id   = role.client_id
        description = role.description
      }
    }
  }
}`;
}

function generateGroupsModule(groups: any[], realm: string): string {
  return `# Groups for realm: ${realm}
resource "keycloak_group" "groups" {
  for_each = { for group in var.groups : group.name => group }
  
  realm_id  = var.realm_id
  name      = each.value.name
  parent_id = each.value.parent_id
  
  dynamic "attributes" {
    for_each = each.value.attributes
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}`;
}

function generateGroupsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "groups" {
  description = "List of groups to create"
  type        = list(object({
    name       = string
    path       = optional(string)
    parent_id  = optional(string)
    attributes = optional(map(list(string)), {})
  }))
  default = []
}`;
}

function generateGroupsOutputs(): string {
  return `output "groups" {
  description = "Map of created groups"
  value = {
    for k, group in keycloak_group.groups : k => {
      id        = group.id
      name      = group.name
      path      = group.path
      parent_id = group.parent_id
    }
  }
}`;
}

function generateUsersModule(users: any[], realm: string): string {
  return `# Users for realm: ${realm}
resource "keycloak_user" "users" {
  for_each = { for user in var.users : user.username => user }
  
  realm_id   = var.realm_id
  username   = each.value.username
  email      = each.value.email
  first_name = each.value.first_name
  last_name  = each.value.last_name
  enabled    = each.value.enabled
  
  email_verified = true
  
  dynamic "attributes" {
    for_each = each.value.attributes
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}

# User group memberships
resource "keycloak_user_groups" "user_groups" {
  for_each = {
    for user in var.users : user.username => user
    if length(user.groups) > 0
  }
  
  realm_id = var.realm_id
  user_id  = keycloak_user.users[each.key].id
  group_ids = each.value.groups
}

# User realm role mappings
resource "keycloak_user_roles" "user_realm_roles" {
  for_each = {
    for user in var.users : user.username => user
    if length(user.realm_roles) > 0
  }
  
  realm_id = var.realm_id
  user_id  = keycloak_user.users[each.key].id
  role_ids = each.value.realm_roles
}`;
}

function generateUsersVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "users" {
  description = "List of users to create"
  type        = list(object({
    username      = string
    email         = optional(string)
    first_name    = optional(string)
    last_name     = optional(string)
    enabled       = optional(bool, true)
    attributes    = optional(map(list(string)), {})
    groups        = optional(list(string), [])
    realm_roles   = optional(list(string), [])
    client_roles  = optional(map(list(string)), {})
  }))
  default = []
}`;
}

function generateUsersOutputs(): string {
  return `output "users" {
  description = "Map of created users"
  value = {
    for k, user in keycloak_user.users : k => {
      id       = user.id
      username = user.username
      email    = user.email
    }
  }
}`;
}

function generateClientsModule(clients: any[], realm: string): string {
  return `# Clients for realm: ${realm}
resource "keycloak_openid_client" "clients" {
  for_each = { for client in var.clients : client.client_id => client }
  
  realm_id    = var.realm_id
  client_id   = each.value.client_id
  name        = each.value.name
  description = each.value.description
  enabled     = each.value.enabled
  
  access_type                      = each.value.access_type
  valid_redirect_uris              = each.value.valid_redirect_uris
  web_origins                      = each.value.web_origins
  admin_url                        = each.value.admin_url
  base_url                         = each.value.base_url
  root_url                         = each.value.root_url
  standard_flow_enabled            = each.value.standard_flow_enabled
  implicit_flow_enabled            = each.value.implicit_flow_enabled
  direct_access_grants_enabled     = each.value.direct_access_grants_enabled
  service_accounts_enabled         = each.value.service_accounts_enabled
  authorization_services_enabled   = each.value.authorization_services_enabled
  public_client                    = each.value.public_client
  frontchannel_logout_enabled      = each.value.frontchannel_logout_enabled
  
  dynamic "extra_config" {
    for_each = each.value.attributes
    content {
      key   = extra_config.key
      value = extra_config.value
    }
  }
}`;
}

function generateClientsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "clients" {
  description = "List of clients to create"
  type        = list(object({
    client_id                    = string
    name                         = optional(string)
    description                  = optional(string)
    enabled                      = optional(bool, true)
    access_type                  = optional(string, "CONFIDENTIAL")
    valid_redirect_uris          = optional(list(string), [])
    web_origins                  = optional(list(string), [])
    admin_url                    = optional(string)
    base_url                     = optional(string)
    root_url                     = optional(string)
    standard_flow_enabled        = optional(bool, true)
    implicit_flow_enabled        = optional(bool, false)
    direct_access_grants_enabled = optional(bool, true)
    service_accounts_enabled     = optional(bool, false)
    authorization_services_enabled = optional(bool, false)
    public_client                = optional(bool, false)
    frontchannel_logout_enabled  = optional(bool, false)
    attributes                   = optional(map(any), {})
  }))
  default = []
}`;
}

function generateClientsOutputs(): string {
  return `output "clients" {
  description = "Map of created clients"
  value = {
    for k, client in keycloak_openid_client.clients : k => {
      id        = client.id
      client_id = client.client_id
      name      = client.name
    }
  }
}`;
}

function generateClientScopesModule(clientScopes: any[], realm: string): string {
  return `# Client Scopes for realm: ${realm}
resource "keycloak_openid_client_scope" "client_scopes" {
  for_each = { for scope in var.client_scopes : scope.name => scope }
  
  realm_id               = var.realm_id
  name                   = each.value.name
  description            = each.value.description
  protocol               = each.value.protocol
  consent_screen_text    = each.value.consent_screen_text
  
  dynamic "extra_config" {
    for_each = each.value.attributes
    content {
      key   = extra_config.key
      value = extra_config.value
    }
  }
}`;
}

function generateClientScopesVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "client_scopes" {
  description = "List of client scopes to create"
  type        = list(object({
    name        = string
    description = optional(string)
    protocol    = optional(string, "openid-connect")
    attributes  = optional(map(any), {})
    consent_screen_text = optional(string)
  }))
  default = []
}`;
}

function generateClientScopesOutputs(): string {
  return `output "client_scopes" {
  description = "Map of created client scopes"
  value = {
    for k, scope in keycloak_openid_client_scope.client_scopes : k => {
      id          = scope.id
      name        = scope.name
      description = scope.description
    }
  }
}`;
}

function generateProtocolMappersModule(json: any, realm: string): string {
  return `# Protocol Mappers for realm: ${realm}

# Client protocol mappers
resource "keycloak_openid_user_attribute_protocol_mapper" "client_user_attribute_mappers" {
  for_each = {
    for mapper in var.client_protocol_mappers : "\${mapper.client_id}.\${mapper.name}" => mapper
    if mapper.protocol_mapper == "oidc-usermodel-attribute-mapper"
  }
  
  realm_id    = var.realm_id
  client_id   = each.value.client_id
  name        = each.value.name
  
  user_attribute      = each.value.config.user_attribute
  claim_name          = each.value.config.claim_name
  claim_value_type    = each.value.config.claim_value_type
  add_to_id_token     = tobool(lookup(each.value.config, "id.token.claim", "false"))
  add_to_access_token = tobool(lookup(each.value.config, "access.token.claim", "false"))
  add_to_userinfo     = tobool(lookup(each.value.config, "userinfo.token.claim", "false"))
}

resource "keycloak_openid_group_membership_protocol_mapper" "client_group_mappers" {
  for_each = {
    for mapper in var.client_protocol_mappers : "\${mapper.client_id}.\${mapper.name}" => mapper
    if mapper.protocol_mapper == "oidc-group-membership-mapper"
  }
  
  realm_id    = var.realm_id
  client_id   = each.value.client_id
  name        = each.value.name
  
  claim_name          = each.value.config.claim_name
  full_path           = tobool(lookup(each.value.config, "full.path", "true"))
  add_to_id_token     = tobool(lookup(each.value.config, "id.token.claim", "false"))
  add_to_access_token = tobool(lookup(each.value.config, "access.token.claim", "false"))
  add_to_userinfo     = tobool(lookup(each.value.config, "userinfo.token.claim", "false"))
}

resource "keycloak_openid_audience_protocol_mapper" "client_audience_mappers" {
  for_each = {
    for mapper in var.client_protocol_mappers : "\${mapper.client_id}.\${mapper.name}" => mapper
    if mapper.protocol_mapper == "oidc-audience-mapper"
  }
  
  realm_id    = var.realm_id
  client_id   = each.value.client_id
  name        = each.value.name
  
  included_client_audience = lookup(each.value.config, "included.client.audience", "")
  included_custom_audience = lookup(each.value.config, "included.custom.audience", "")
  add_to_id_token         = tobool(lookup(each.value.config, "id.token.claim", "false"))
  add_to_access_token     = tobool(lookup(each.value.config, "access.token.claim", "false"))
}

# Client Scope protocol mappers
resource "keycloak_openid_user_attribute_protocol_mapper" "client_scope_user_attribute_mappers" {
  for_each = {
    for mapper in var.client_scope_protocol_mappers : "\${mapper.client_scope_id}.\${mapper.name}" => mapper
    if mapper.protocol_mapper == "oidc-usermodel-attribute-mapper"
  }
  
  realm_id        = var.realm_id
  client_scope_id = each.value.client_scope_id
  name            = each.value.name
  
  user_attribute      = each.value.config.user_attribute
  claim_name          = each.value.config.claim_name
  claim_value_type    = each.value.config.claim_value_type
  add_to_id_token     = tobool(lookup(each.value.config, "id.token.claim", "false"))
  add_to_access_token = tobool(lookup(each.value.config, "access.token.claim", "false"))
  add_to_userinfo     = tobool(lookup(each.value.config, "userinfo.token.claim", "false"))
}`;
}

function generateProtocolMappersVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "client_protocol_mappers" {
  description = "List of client protocol mappers"
  type        = list(object({
    client_id        = string
    name             = string
    protocol_mapper  = string
    config           = map(string)
  }))
  default = []
}

variable "client_scope_protocol_mappers" {
  description = "List of client scope protocol mappers"
  type        = list(object({
    client_scope_id  = string
    name             = string
    protocol_mapper  = string
    config           = map(string)
  }))
  default = []
}`;
}

function generateProtocolMappersOutputs(): string {
  return `output "protocol_mappers" {
  description = "Map of created protocol mappers"
  value = {
    client_user_attribute_mappers = {
      for k, mapper in keycloak_openid_user_attribute_protocol_mapper.client_user_attribute_mappers : k => {
        id   = mapper.id
        name = mapper.name
      }
    }
    client_group_mappers = {
      for k, mapper in keycloak_openid_group_membership_protocol_mapper.client_group_mappers : k => {
        id   = mapper.id
        name = mapper.name
      }
    }
    client_audience_mappers = {
      for k, mapper in keycloak_openid_audience_protocol_mapper.client_audience_mappers : k => {
        id   = mapper.id
        name = mapper.name
      }
    }
  }
}`;
}

function generateScopeMappingsModule(scopeMappings: any[], realm: string): string {
  return `# Scope Mappings for realm: ${realm}
resource "keycloak_generic_client_role_mapper" "client_role_mappings" {
  for_each = {
    for idx, mapping in var.scope_mappings : "\${mapping.client_id}-\${idx}" => mapping
  }
  
  realm_id  = var.realm_id
  client_id = each.value.client_id
  role_id   = each.value.role_id
}`;
}

function generateScopeMappingsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "scope_mappings" {
  description = "List of scope mappings"
  type = list(object({
    client_id = string
    role_id   = string
  }))
  default = []
}`;
}

function generateScopeMappingsOutputs(): string {
  return `output "scope_mappings" {
  description = "Map of created scope mappings"
  value = {
    for k, mapping in keycloak_generic_client_role_mapper.client_role_mappings : k => {
      id        = mapping.id
      client_id = mapping.client_id
      role_id   = mapping.role_id
    }
  }
}`;
}

function generateIdentityProvidersModule(identityProviders: any[], realm: string): string {
  return `# Identity Providers for realm: ${realm}
resource "keycloak_oidc_identity_provider" "oidc_providers" {
  for_each = {
    for idp in var.identity_providers : idp.alias => idp
    if idp.provider_id == "oidc" || idp.provider_id == "keycloak-oidc"
  }
  
  realm                      = var.realm_id
  alias                      = each.value.alias
  display_name               = each.value.display_name
  enabled                    = each.value.enabled
  store_token               = each.value.store_token
  add_read_token_role_on_create = each.value.add_read_token_role_on_create
  authenticate_by_default    = each.value.authenticate_by_default
  link_only                 = each.value.link_only
  first_broker_login_flow_alias = each.value.first_broker_login_flow_alias
  post_broker_login_flow_alias  = each.value.post_broker_login_flow_alias
  
  authorization_url = lookup(each.value.config, "authorizationUrl", "")
  token_url         = lookup(each.value.config, "tokenUrl", "")
  client_id         = lookup(each.value.config, "clientId", "")
  client_secret     = lookup(each.value.config, "clientSecret", "")
  issuer            = lookup(each.value.config, "issuer", "")
  
  dynamic "extra_config" {
    for_each = each.value.config
    content {
      key   = extra_config.key
      value = extra_config.value
    }
  }
}

resource "keycloak_saml_identity_provider" "saml_providers" {
  for_each = {
    for idp in var.identity_providers : idp.alias => idp
    if idp.provider_id == "saml"
  }
  
  realm                      = var.realm_id
  alias                      = each.value.alias
  display_name               = each.value.display_name
  enabled                    = each.value.enabled
  store_token               = each.value.store_token
  add_read_token_role_on_create = each.value.add_read_token_role_on_create
  authenticate_by_default    = each.value.authenticate_by_default
  link_only                 = each.value.link_only
  first_broker_login_flow_alias = each.value.first_broker_login_flow_alias
  post_broker_login_flow_alias  = each.value.post_broker_login_flow_alias
  
  single_sign_on_service_url = lookup(each.value.config, "singleSignOnServiceUrl", "")
  single_logout_service_url  = lookup(each.value.config, "singleLogoutServiceUrl", "")
  entity_id                  = lookup(each.value.config, "entityId", "")
  
  dynamic "extra_config" {
    for_each = each.value.config
    content {
      key   = extra_config.key
      value = extra_config.value
    }
  }
}`;
}

function generateIdentityProvidersVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "identity_providers" {
  description = "List of identity providers to create"
  type        = list(object({
    alias                     = string
    display_name              = optional(string)
    provider_id               = string
    enabled                   = optional(bool, true)
    store_token              = optional(bool, false)
    add_read_token_role_on_create = optional(bool, false)
    authenticate_by_default   = optional(bool, false)
    link_only                = optional(bool, false)
    first_broker_login_flow_alias = optional(string)
    post_broker_login_flow_alias  = optional(string)
    config                   = optional(map(string), {})
  }))
  default = []
}`;
}

function generateIdentityProvidersOutputs(): string {
  return `output "identity_providers" {
  description = "Map of created identity providers"
  value = merge(
    {
      for k, idp in keycloak_oidc_identity_provider.oidc_providers : k => {
        alias        = idp.alias
        display_name = idp.display_name
        provider_id  = "oidc"
      }
    },
    {
      for k, idp in keycloak_saml_identity_provider.saml_providers : k => {
        alias        = idp.alias
        display_name = idp.display_name
        provider_id  = "saml"
      }
    }
  )
}`;
}

function generateIdentityProviderMappersModule(identityProviders: any[], realm: string): string {
  return `# Identity Provider Mappers for realm: ${realm}
resource "keycloak_identity_provider_mapper" "idp_mappers" {
  for_each = {
    for mapper in var.identity_provider_mappers : "\${mapper.identity_provider_alias}.\${mapper.name}" => mapper
  }
  
  realm                   = var.realm_id
  name                    = each.value.name
  identity_provider_alias = each.value.identity_provider_alias
  mapper_type             = each.value.mapper_type
  
  dynamic "extra_config" {
    for_each = each.value.config
    content {
      key   = extra_config.key
      value = extra_config.value
    }
  }
}`;
}

function generateIdentityProviderMappersVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "identity_provider_mappers" {
  description = "List of identity provider mappers"
  type = list(object({
    identity_provider_alias = string
    name                   = string
    mapper_type            = string
    config                 = map(string)
  }))
  default = []
}`;
}

function generateIdentityProviderMappersOutputs(): string {
  return `output "identity_provider_mappers" {
  description = "Map of created identity provider mappers"
  value = {
    for k, mapper in keycloak_identity_provider_mapper.idp_mappers : k => {
      id                     = mapper.id
      name                   = mapper.name
      identity_provider_alias = mapper.identity_provider_alias
      mapper_type            = mapper.mapper_type
    }
  }
}`;
}

function generateAuthenticationFlowsModule(authenticationFlows: any[], realm: string): string {
  return `# Authentication Flows for realm: ${realm}
resource "keycloak_authentication_flow" "flows" {
  for_each = { for flow in var.authentication_flows : flow.alias => flow }
  
  realm_id    = var.realm_id
  alias       = each.value.alias
  description = each.value.description
  provider_id = each.value.provider_id
  top_level   = each.value.top_level
  built_in    = each.value.built_in
}

# Authentication flow executions
resource "keycloak_authentication_execution" "executions" {
  for_each = merge([
    for flow_idx, flow in var.authentication_flows : {
      for exec_idx, execution in flow.executions : "\${flow.alias}.\${exec_idx}" => {
        flow_alias    = flow.alias
        authenticator = execution.authenticator
        requirement   = execution.requirement
        priority      = execution.priority
        config        = execution.config
      }
    }
  ]...)
  
  realm_id          = var.realm_id
  parent_flow_alias = each.value.flow_alias
  authenticator     = each.value.authenticator
  requirement       = each.value.requirement
  priority          = each.value.priority
  
  depends_on = [keycloak_authentication_flow.flows]
  
  dynamic "config" {
    for_each = each.value.config
    content {
      key   = config.key
      value = config.value
    }
  }
}`;
}

function generateAuthenticationFlowsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "authentication_flows" {
  description = "List of authentication flows to create"
  type        = list(object({
    alias       = string
    description = optional(string)
    provider_id = optional(string, "basic-flow")
    top_level   = optional(bool, true)
    built_in    = optional(bool, false)
    executions  = optional(list(object({
      authenticator = string
      requirement   = string
      priority      = number
      config        = optional(map(string), {})
    })), [])
  }))
  default = []
}`;
}

function generateAuthenticationFlowsOutputs(): string {
  return `output "authentication_flows" {
  description = "Map of created authentication flows"
  value = {
    for k, flow in keycloak_authentication_flow.flows : k => {
      id          = flow.id
      alias       = flow.alias
      description = flow.description
    }
  }
}`;
}

function generateUserFederationModule(components: any[], realm: string): string {
  return `# User Federation for realm: ${realm}
resource "keycloak_ldap_user_federation" "ldap_providers" {
  for_each = { for provider in var.user_federation.ldap_providers : provider.name => provider }
  
  realm_id    = var.realm_id
  name        = each.value.name
  enabled     = each.value.enabled
  priority    = each.value.priority
  
  import_enabled          = each.value.import_enabled
  edit_mode               = each.value.edit_mode
  sync_registrations      = each.value.sync_registrations
  vendor                  = each.value.vendor
  username_ldap_attribute = each.value.username_ldap_attribute
  rdn_ldap_attribute      = each.value.rdn_ldap_attribute
  uuid_ldap_attribute     = each.value.uuid_ldap_attribute
  user_object_classes     = each.value.user_object_classes
  connection_url          = each.value.connection_url
  users_dn                = each.value.users_dn
  bind_dn                 = each.value.bind_dn
  bind_credential         = each.value.bind_credential
  search_scope            = each.value.search_scope
  connection_timeout      = each.value.connection_timeout
  read_timeout            = each.value.read_timeout
  pagination              = each.value.pagination
  batch_size_for_sync     = each.value.batch_size_for_sync
  full_sync_period        = each.value.full_sync_period
  changed_sync_period     = each.value.changed_sync_period
}

resource "keycloak_custom_user_federation" "kerberos_providers" {
  for_each = { for provider in var.user_federation.kerberos_providers : provider.name => provider }
  
  realm_id    = var.realm_id
  name        = each.value.name
  provider_id = "kerberos"
  enabled     = true
  
  config = {
    serverPrincipal         = each.value.server_principal
    keyTab                  = each.value.key_tab
    kerberosRealm           = each.value.realm
    debug                   = each.value.debug ? "true" : "false"
    allowPasswordAuthentication = each.value.allow_password_authentication ? "true" : "false"
    updateProfileFirstLogin = each.value.update_profile_first_login ? "true" : "false"
  }
}`;
}

function generateUserFederationVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "user_federation" {
  description = "User federation providers configuration"
  type = object({
    ldap_providers = optional(list(object({
      name                     = string
      enabled                  = optional(bool, true)
      priority                 = optional(number, 0)
      import_enabled           = optional(bool, true)
      edit_mode                = optional(string, "READ_ONLY")
      sync_registrations       = optional(bool, false)
      vendor                   = optional(string, "other")
      username_ldap_attribute  = optional(string, "uid")
      rdn_ldap_attribute       = optional(string, "uid")
      uuid_ldap_attribute      = optional(string, "entryUUID")
      user_object_classes      = optional(list(string), ["inetOrgPerson", "organizationalPerson"])
      connection_url           = string
      users_dn                 = string
      bind_dn                  = optional(string)
      bind_credential          = optional(string)
      search_scope             = optional(string, "1")
      connection_timeout       = optional(number, 5000)
      read_timeout             = optional(number, 10000)
      pagination               = optional(bool, false)
      batch_size_for_sync      = optional(number, 1000)
      full_sync_period         = optional(number, 86400)
      changed_sync_period      = optional(number, 43200)
    })), [])
    kerberos_providers = optional(list(object({
      name                     = string
      realm                    = string
      server_principal         = string
      key_tab                  = string
      debug                    = optional(bool, false)
      allow_password_authentication = optional(bool, false)
      update_profile_first_login = optional(bool, true)
    })), [])
  })
  default = {
    ldap_providers = []
    kerberos_providers = []
  }
}`;
}

function generateUserFederationOutputs(): string {
  return `output "user_federation" {
  description = "Map of created user federation providers"
  value = {
    ldap_providers = {
      for k, provider in keycloak_ldap_user_federation.ldap_providers : k => {
        id   = provider.id
        name = provider.name
      }
    }
    kerberos_providers = {
      for k, provider in keycloak_custom_user_federation.kerberos_providers : k => {
        id   = provider.id
        name = provider.name
      }
    }
  }
}`;
}

function generateRequiredActionsModule(requiredActions: any[], realm: string): string {
  return `# Required Actions for realm: ${realm}
resource "keycloak_required_action" "required_actions" {
  for_each = { for action in var.required_actions : action.alias => action }
  
  realm_id        = var.realm_id
  alias           = each.value.alias
  name            = each.value.name
  enabled         = each.value.enabled
  default_action  = each.value.default_action
  priority        = each.value.priority
}`;
}

function generateRequiredActionsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "required_actions" {
  description = "List of required actions"
  type = list(object({
    alias         = string
    name          = string
    enabled       = optional(bool, true)
    default_action = optional(bool, false)
    priority      = optional(number, 0)
  }))
  default = []
}`;
}

function generateRequiredActionsOutputs(): string {
  return `output "required_actions" {
  description = "Map of created required actions"
  value = {
    for k, action in keycloak_required_action.required_actions : k => {
      id     = action.id
      alias  = action.alias
      name   = action.name
    }
  }
}`;
}

function generateRealmEventsModule(json: any, realm: string): string {
  return `# Realm Events for realm: ${realm}
resource "keycloak_realm_events" "events" {
  realm_id = var.realm_id
  
  events_enabled          = var.realm_events.events_enabled
  events_expiration       = var.realm_events.events_expiration
  admin_events_enabled    = var.realm_events.admin_events_enabled
  admin_events_details_enabled = var.realm_events.admin_events_details_enabled
  
  events_listeners = var.realm_events.events_listeners
  enabled_event_types = var.realm_events.event_types
}`;
}

function generateRealmEventsVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "realm_events" {
  description = "Realm events configuration"
  type = object({
    events_enabled          = optional(bool, false)
    events_expiration       = optional(number, 0)
    events_listeners        = optional(list(string), ["jboss-logging"])
    admin_events_enabled    = optional(bool, false)
    admin_events_details_enabled = optional(bool, false)
    event_types             = optional(list(string), [])
  })
  default = {
    events_enabled = false
    admin_events_enabled = false
  }
}`;
}

function generateRealmEventsOutputs(): string {
  return `output "realm_events" {
  description = "Realm events configuration"
  value = {
    events_enabled = keycloak_realm_events.events.events_enabled
    admin_events_enabled = keycloak_realm_events.events.admin_events_enabled
  }
}`;
}

function generateClientPoliciesModule(json: any, realm: string): string {
  return `# Client Policies for realm: ${realm}
# Note: Client policies are a newer feature and may require custom resources
# This is a placeholder for client policies implementation
# Actual implementation would depend on the Terraform provider's support

resource "keycloak_generic_client_protocol_mapper" "client_policy_mappers" {
  for_each = { for policy in var.client_policies : policy.name => policy }
  
  realm_id  = var.realm_id
  client_id = "realm-management"
  name      = "client-policy-\${each.value.name}"
  protocol  = "openid-connect"
  
  # This is a placeholder - actual implementation would be different
  # depending on how the provider supports client policies
}`;
}

function generateClientPoliciesVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "client_policies" {
  description = "Client policies configuration"
  type = list(object({
    name        = string
    description = optional(string)
    enabled     = optional(bool, true)
    conditions  = list(object({
      type      = string
      config    = map(string)
    }))
    profiles    = list(string)
  }))
  default = []
}

variable "client_profiles" {
  description = "Client profiles configuration"
  type = list(object({
    name        = string
    description = optional(string)
    executors   = list(object({
      type      = string
      config    = map(string)
    }))
  }))
  default = []
}`;
}

function generateClientPoliciesOutputs(): string {
  return `output "client_policies" {
  description = "Map of created client policies"
  value = {
    for k, policy in keycloak_generic_client_protocol_mapper.client_policy_mappers : k => {
      id   = policy.id
      name = policy.name
    }
  }
}`;
}

function generateKeycloakMain(): string {
  return `# Main Keycloak Module
terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "~> 5.0"
    }
  }
}

# Configure the Keycloak Provider
provider "keycloak" {
  client_id     = var.keycloak_client_id
  client_secret = var.keycloak_client_secret
  url           = var.keycloak_url
}`;
}

function generateKeycloakVariables(): string {
  return `variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
}

variable "keycloak_client_id" {
  description = "Keycloak admin client ID"
  type        = string
}

variable "keycloak_client_secret" {
  description = "Keycloak admin client secret"
  type        = string
  sensitive   = true
}`;
}

function generateKeycloakOutputs(): string {
  return `output "keycloak_url" {
  description = "Keycloak server URL"
  value       = var.keycloak_url
}`;
}

/**
 * Validate if a given file content is a Keycloak realm export (minimal check)
 */
export function isValidKeycloakJson(json: any): boolean {
  return typeof json === "object" && !!json.realm;
}
