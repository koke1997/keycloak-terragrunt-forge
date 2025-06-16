# Roles for realm Example-Realm

resource "keycloak_role" "realm_offline_access" {
  realm_id    = keycloak_realm.Example_Realm.id
  name        = "offline_access"
  description = "${role_offline-access}"
}

resource "keycloak_role" "realm_uma_authorization" {
  realm_id    = keycloak_realm.Example_Realm.id
  name        = "uma_authorization"
  description = "${role_uma_authorization}"
}

resource "keycloak_role" "realm_default_roles_example_realm" {
  realm_id    = keycloak_realm.Example_Realm.id
  name        = "default-roles-example-realm"
  description = "${role_default-roles}"
}

