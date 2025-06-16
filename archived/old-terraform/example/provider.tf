terraform {
  required_version = ">= 1.0"
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "~> 5.0"
    }
  }
}

provider "keycloak" {
  client_id                = "admin-cli"
  username                 = var.keycloak_admin_username
  password                 = var.keycloak_admin_password
  url                      = var.keycloak_url
  initial_login            = false
  client_timeout           = 60
  tls_insecure_skip_verify = true
}