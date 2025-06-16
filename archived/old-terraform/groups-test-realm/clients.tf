# Clients for realm groups-test-realm

resource "keycloak_openid_client" "company_portal" {
  realm_id                     = keycloak_realm.groups_test_realm.id
  client_id                    = "company-portal"
  name                         = "Company Portal"
  description                  = "Internal company portal"
  
  enabled                      = true
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = true
  service_accounts_enabled     = true
  
  access_type = "CONFIDENTIAL"
  
  valid_redirect_uris = ["https://portal.company.com/*"]
  web_origins = ["https://portal.company.com"]
}

