# Roles for realm example-realm

resource "keycloak_role" "realm_uma_authorization" {
  realm_id    = keycloak_realm.example_realm.id
  name        = "uma_authorization"
  description = "${role_uma_authorization}"
}

resource "keycloak_role" "realm_offline_access" {
  realm_id    = keycloak_realm.example_realm.id
  name        = "offline_access"
  description = "${role_offline-access}"
}

resource "keycloak_role" "realm_admin" {
  realm_id    = keycloak_realm.example_realm.id
  name        = "admin"
  description = "Generic admin role."
}

