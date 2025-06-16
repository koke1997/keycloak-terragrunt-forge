# Clients for realm: groups-test-realm
resource "keycloak_openid_client" "clients" {
  for_each = { for client in var.clients : client.clientId => client }

  realm_id    = var.realm_id
  client_id   = each.value.clientId
  name        = each.value.name
  description = each.value.description
  enabled     = each.value.enabled

  access_type = each.value.publicClient ? "PUBLIC" : "CONFIDENTIAL"

  valid_redirect_uris = each.value.redirectUris
  web_origins         = each.value.webOrigins

  standard_flow_enabled          = each.value.standardFlowEnabled
  implicit_flow_enabled          = each.value.implicitFlowEnabled
  direct_access_grants_enabled   = each.value.directAccessGrantsEnabled
  service_accounts_enabled       = each.value.serviceAccountsEnabled
}