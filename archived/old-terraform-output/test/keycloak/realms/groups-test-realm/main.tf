# Main realm configuration for: groups-test-realm
# Compatible with OpenTofu and Terraform
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 5.2"
    }
  }
}

resource "keycloak_realm" "realm" {
  realm   = "groups-test-realm"
  enabled = true

  display_name = "Groups Test Realm - Enhanced Enterprise Edition"

  # Authentication settings
  login_with_email_allowed = true
  duplicate_emails_allowed = false

  # Registration settings
  registration_allowed = true
  registration_email_as_username = false

  # Password policy
  password_policy = "length(8) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and hashIterations(27500) and passwordHistory(3)"

  # Internationalization
  internationalization_enabled = true
  supported_locales = ["en","es","fr","de","it","pt","ru","ja","zh-CN"]
  default_locale = "en"

  # Security defenses
  brute_force_protected = true
  failure_factor = 5
  max_failure_wait_seconds = 900
  
  # Token lifespans (compatible with 5.2+)
  access_token_lifespan    = "300"
  sso_session_idle_timeout = "1800"
  sso_session_max_lifespan = "36000"
}

# Call submodules

module "groups" {
  source = "./groups"

  realm_id = keycloak_realm.realm.id
  groups   = var.groups
}


module "users" {
  source = "./users"

  realm_id = keycloak_realm.realm.id
  users    = var.users

  depends_on = [module.groups]
}


module "roles" {
  source = "./roles"

  realm_id = keycloak_realm.realm.id
  roles    = var.roles
}


module "clients" {
  source = "./clients"

  realm_id = keycloak_realm.realm.id
  clients  = var.clients
}