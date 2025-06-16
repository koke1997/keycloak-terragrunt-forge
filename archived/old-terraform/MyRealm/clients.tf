# Clients for realm MyRealm

resource "keycloak_openid_client" "account" {
  realm_id                     = keycloak_realm.MyRealm.id
  client_id                    = "account"
  name                         = "${client_account}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "CONFIDENTIAL"
  
  valid_redirect_uris = ["/auth/realms/MyRealm/account/*"]
  # web_origins = []
}

resource "keycloak_openid_client" "realm_management" {
  realm_id                     = keycloak_realm.MyRealm.id
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

resource "keycloak_openid_client" "security_admin_console" {
  realm_id                     = keycloak_realm.MyRealm.id
  client_id                    = "security-admin-console"
  name                         = "${client_security-admin-console}"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false
  
  access_type = "PUBLIC"
  
  valid_redirect_uris = ["/auth/admin/MyRealm/console/*"]
  # web_origins = []
}

resource "keycloak_openid_client" "admin_cli" {
  realm_id                     = keycloak_realm.MyRealm.id
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
  realm_id                     = keycloak_realm.MyRealm.id
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

resource "keycloak_openid_client" "MyApplication" {
  realm_id                     = keycloak_realm.MyRealm.id
  client_id                    = "MyApplication"
  name                         = "MyApplication"
  description                  = null
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = true
  service_accounts_enabled     = false
  
  access_type = "PUBLIC"
  
  valid_redirect_uris = ["http://localhost:8000/*"]
  web_origins = ["http://localhost:8000"]
}

