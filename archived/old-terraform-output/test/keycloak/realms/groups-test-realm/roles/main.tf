# Roles for realm: groups-test-realm

resource "keycloak_role" "realm_roles" {
  for_each = { for role in var.roles.realm : role.name => role }

  realm_id    = var.realm_id
  name        = each.value.name
  description = each.value.description
}

