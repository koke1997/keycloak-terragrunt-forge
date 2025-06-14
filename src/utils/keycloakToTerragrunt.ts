
/**
 * Converts a Keycloak realm.json to modular Terraform/Terragrunt structure
 * Handles comprehensive Keycloak configurations including roles, groups, identity providers, etc.
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

  // Variables file
  files.push({
    filePath: `${realmDir}/variables.tf`,
    content: generateRealmVariables()
  });

  // Outputs file
  files.push({
    filePath: `${realmDir}/outputs.tf`,
    content: generateRealmOutputs()
  });

  // Roles submodule (realm and client roles)
  if ((Array.isArray(json.roles?.realm) && json.roles.realm.length > 0) || 
      (Array.isArray(json.roles?.client) && Object.keys(json.roles.client).length > 0)) {
    files.push({
      filePath: `${realmDir}/roles/main.tf`,
      content: generateRolesModule(json.roles, realm)
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

  // Groups submodule
  if (Array.isArray(json.groups) && json.groups.length > 0) {
    files.push({
      filePath: `${realmDir}/groups/main.tf`,
      content: generateGroupsModule(json.groups, realm)
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

  // Users submodule (if users exist)
  if (Array.isArray(json.users) && json.users.length > 0) {
    files.push({
      filePath: `${realmDir}/users/main.tf`,
      content: generateUsersModule(json.users, realm)
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

  // Clients submodule (if clients exist)
  if (Array.isArray(json.clients) && json.clients.length > 0) {
    files.push({
      filePath: `${realmDir}/clients/main.tf`,
      content: generateClientsModule(json.clients, realm)
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

  // Client Scopes submodule
  if (Array.isArray(json.clientScopes) && json.clientScopes.length > 0) {
    files.push({
      filePath: `${realmDir}/client-scopes/main.tf`,
      content: generateClientScopesModule(json.clientScopes, realm)
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

  // Identity Providers submodule
  if (Array.isArray(json.identityProviders) && json.identityProviders.length > 0) {
    files.push({
      filePath: `${realmDir}/identity-providers/main.tf`,
      content: generateIdentityProvidersModule(json.identityProviders, realm)
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

  // Authentication Flows submodule
  if (Array.isArray(json.authenticationFlows) && json.authenticationFlows.length > 0) {
    files.push({
      filePath: `${realmDir}/authentication-flows/main.tf`,
      content: generateAuthenticationFlowsModule(json.authenticationFlows, realm)
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

function generateRealmMain(json: any, realm: string): string {
  const displayName = json.displayName || "";
  const enabled = typeof json.enabled === "boolean" ? json.enabled : true;
  
  return `# Keycloak Realm: ${realm}
terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
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

# Identity Providers module
module "identity_providers" {
  source = "./identity-providers"
  count  = var.create_identity_providers ? 1 : 0
  
  realm_id           = keycloak_realm.this.id
  identity_providers = var.identity_providers
}

# Authentication Flows module
module "authentication_flows" {
  source = "./authentication-flows"
  count  = var.create_authentication_flows ? 1 : 0
  
  realm_id             = keycloak_realm.this.id
  authentication_flows = var.authentication_flows
}`;
}

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

variable "create_identity_providers" {
  description = "Whether to create identity providers"
  type        = bool
  default     = false
}

variable "create_authentication_flows" {
  description = "Whether to create authentication flows"
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

variable "authentication_flows" {
  description = "List of authentication flows to create"
  type        = list(object({
    alias       = string
    description = optional(string)
    provider_id = optional(string, "basic-flow")
    top_level   = optional(bool, true)
    built_in    = optional(bool, false)
  }))
  default = []
}`;
}

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

output "identity_providers" {
  description = "Created identity providers"
  value       = var.create_identity_providers ? module.identity_providers[0].identity_providers : {}
}

output "authentication_flows" {
  description = "Created authentication flows"
  value       = var.create_authentication_flows ? module.authentication_flows[0].authentication_flows : {}
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

function generateKeycloakMain(): string {
  return `# Main Keycloak Module
terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
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
