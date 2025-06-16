# Roles for realm: groups-test-realm
# Compatible with Keycloak provider 5.2+
terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.2.0"
    }
  }
}

resource "keycloak_role" "realm_roles" {
  for_each = { for role in try(var.roles.realm, []) : role.name => role }

  realm_id    = var.realm_id
  name        = each.value.name
  description = each.value.description
}

