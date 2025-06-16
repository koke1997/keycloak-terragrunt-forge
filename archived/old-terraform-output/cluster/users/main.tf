# Users for realm: groups-test-realm
# Compatible with Keycloak provider 5.2+
terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.2.0"
    }
  }
}

resource "keycloak_user" "users" {
  for_each = { for user in var.users : user.username => user }

  realm_id   = var.realm_id
  username   = each.value.username
  email      = each.value.email
  first_name = each.value.first_name
  last_name  = each.value.last_name
  enabled    = each.value.enabled

  email_verified = true

  # Attributes handled directly as map in provider 5.2+
  attributes = each.value.attributes
}

# User group memberships
resource "keycloak_user_groups" "user_groups" {
  for_each = {
    for user in var.users : user.username => user
    if length(user.groups) > 0
  }

  realm_id  = var.realm_id
  user_id   = keycloak_user.users[each.key].id
  group_ids = each.value.groups
}
