# Clients for realm example-realm

resource "keycloak_openid_client" "example_client" {
  realm_id                     = keycloak_realm.example_realm.id
  client_id                    = "example-client"
  name                         = "Example Client"
  description                  = "Client Facing web app"
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = true
  direct_access_grants_enabled = true
  service_accounts_enabled     = false
  
  access_type = "PUBLIC"
  
  valid_redirect_uris = ["*"]
  web_origins = [""]
}

