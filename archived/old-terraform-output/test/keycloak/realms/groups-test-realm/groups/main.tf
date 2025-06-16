# Groups for realm: groups-test-realm
# Compatible with Keycloak provider 5.2+
terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 5.2"
    }
  }
}

resource "keycloak_group" "groups" {
  for_each = { for group in var.groups : group.name => group }

  realm_id  = var.realm_id
  name      = each.value.name
  parent_id = each.value.parent_id

  # Attributes are handled directly as a map in provider 5.2+
  attributes = each.value.attributes
}