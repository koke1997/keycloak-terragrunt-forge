# Clients for realm example

resource "keycloak_openid_client" "dashboard_client" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "dashboard-client"
  name                         = "dashboard-client"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = true
  service_accounts_enabled     = true
  
  access_type = "CONFIDENTIAL"
  
  valid_redirect_uris = ["http://localhost:8180/*"]
  # web_origins = []
}

resource "keycloak_openid_client" "admin_cli" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "admin-cli"
  name                         = "${client_admin-cli}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = false
  implicit_flow_enabled        = false
  direct_access_grants_enabled = true
  service_accounts_enabled     = false
  
  access_type = "PUBLIC"
  
  # valid_redirect_uris = []
  # web_origins = []
}

resource "keycloak_openid_client" "broker" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "broker"
  name                         = "${client_broker}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "CONFIDENTIAL"
  
  # valid_redirect_uris = []
  # web_origins = []
}

resource "keycloak_openid_client" "security_admin_console" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "security-admin-console"
  name                         = "${client_security-admin-console}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "PUBLIC"
  
  valid_redirect_uris = ["/auth/admin/example/console/*"]
  # web_origins = []
}

resource "keycloak_openid_client" "account" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "account"
  name                         = "${client_account}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "CONFIDENTIAL"
  
  valid_redirect_uris = ["/auth/realms/example/account/*"]
  # web_origins = []
}

resource "keycloak_openid_client" "realm_management" {
  realm_id                     = keycloak_realm.example.id
  client_id                    = "realm-management"
  name                         = "${client_realm-management}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "CONFIDENTIAL"
  
  # valid_redirect_uris = []
  # web_origins = []
}

