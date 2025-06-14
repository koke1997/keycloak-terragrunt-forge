
/**
 * Converts a Keycloak realm.json to modular Terraform/Terragrunt structure
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
  const displayName = json.displayName || "";
  const enabled = typeof json.enabled === "boolean" ? json.enabled : true;
  const realmDir = `keycloak/realms/${realm}`;
  const files: TerraformFile[] = [];

  // Main realm module file
  files.push({
    filePath: `${realmDir}/main.tf`,
    content: generateRealmMain(realm, displayName, enabled)
  });

  // Variables file
  files.push({
    filePath: `${realmDir}/variables.tf`,
    content: generateRealmVariables()
  });

  // Outputs file
  files.push({
    filePath: `${realmDir}/outputs.tf`,
    content: generateRealmOutputs(realm)
  });

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
      content: generateUsersOutputs(json.users)
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
      content: generateClientsOutputs(json.clients)
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

function generateRealmMain(realm: string, displayName: string, enabled: boolean): string {
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
  realm                = var.realm_name
  display_name         = var.display_name
  enabled              = var.enabled
  
  # Additional realm configuration
  registration_allowed = var.registration_allowed
  reset_password_allowed = var.reset_password_allowed
  remember_me          = var.remember_me
  verify_email         = var.verify_email
  login_with_email_allowed = var.login_with_email_allowed
  duplicate_emails_allowed = var.duplicate_emails_allowed
}

# Users module
module "users" {
  source = "./users"
  count  = var.create_users ? 1 : 0
  
  realm_id = keycloak_realm.this.id
  users    = var.users
}

# Clients module
module "clients" {
  source = "./clients"
  count  = var.create_clients ? 1 : 0
  
  realm_id = keycloak_realm.this.id
  clients  = var.clients
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

variable "registration_allowed" {
  description = "Whether registration is allowed"
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

variable "create_users" {
  description = "Whether to create users"
  type        = bool
  default     = false
}

variable "users" {
  description = "List of users to create"
  type        = list(object({
    username   = string
    email      = optional(string)
    first_name = optional(string)
    last_name  = optional(string)
    enabled    = optional(bool, true)
  }))
  default = []
}

variable "create_clients" {
  description = "Whether to create clients"
  type        = bool
  default     = false
}

variable "clients" {
  description = "List of clients to create"
  type        = list(object({
    client_id    = string
    name         = optional(string)
    description  = optional(string)
    enabled      = optional(bool, true)
    access_type  = optional(string, "CONFIDENTIAL")
  }))
  default = []
}`;
}

function generateRealmOutputs(realm: string): string {
  return `output "realm_id" {
  description = "ID of the created realm"
  value       = keycloak_realm.this.id
}

output "realm_name" {
  description = "Name of the created realm"
  value       = keycloak_realm.this.realm
}

output "users" {
  description = "Created users"
  value       = var.create_users ? module.users[0].users : {}
}

output "clients" {
  description = "Created clients"
  value       = var.create_clients ? module.clients[0].clients : {}
}`;
}

function generateUsersModule(users: any[], realm: string): string {
  let content = `# Users for realm: ${realm}
resource "keycloak_user" "users" {
  for_each = { for user in var.users : user.username => user }
  
  realm_id   = var.realm_id
  username   = each.value.username
  email      = each.value.email
  first_name = each.value.first_name
  last_name  = each.value.last_name
  enabled    = each.value.enabled
  
  email_verified = true
}`;

  return content;
}

function generateUsersVariables(): string {
  return `variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "users" {
  description = "List of users to create"
  type        = list(object({
    username   = string
    email      = optional(string)
    first_name = optional(string)
    last_name  = optional(string)
    enabled    = optional(bool, true)
  }))
}`;
}

function generateUsersOutputs(users: any[]): string {
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
  
  access_type                = each.value.access_type
  valid_redirect_uris        = each.value.valid_redirect_uris
  standard_flow_enabled      = true
  implicit_flow_enabled      = false
  direct_access_grants_enabled = true
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
    client_id             = string
    name                  = optional(string)
    description           = optional(string)
    enabled               = optional(bool, true)
    access_type           = optional(string, "CONFIDENTIAL")
    valid_redirect_uris   = optional(list(string), [])
  }))
}`;
}

function generateClientsOutputs(clients: any[]): string {
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
