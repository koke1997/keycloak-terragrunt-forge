# Clients for realm: groups-test-realm
# Compatible with Keycloak provider 5.2+
terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.2.0"
    }
  }
}

resource "keycloak_openid_client" "clients" {
  for_each = { for client in var.clients : client.clientId => client }

  realm_id    = var.realm_id
  client_id   = each.value.clientId
  name        = each.value.name
  description = try(each.value.description, "")
  enabled     = try(each.value.enabled, true)

  access_type = try(each.value.publicClient, false) ? "PUBLIC" : "CONFIDENTIAL"

  valid_redirect_uris = try(each.value.redirectUris, [])
  web_origins         = try(each.value.webOrigins, [])

  standard_flow_enabled        = try(each.value.standardFlowEnabled, true)
  implicit_flow_enabled        = try(each.value.implicitFlowEnabled, false)
  direct_access_grants_enabled = try(each.value.directAccessGrantsEnabled, false)
  service_accounts_enabled     = try(each.value.serviceAccountsEnabled, false)

  # Access token lifespan
  access_token_lifespan = try(each.value.accessTokenLifespan, "")

  # Client authentication
  client_authenticator_type = try(each.value.clientAuthenticatorType, "client-secret")
}
