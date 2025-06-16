# Roles for realm MyRealm

resource "keycloak_role" "realm_uma_authorization" {
  realm_id    = keycloak_realm.MyRealm.id
  name        = "uma_authorization"
  description = null
}

resource "keycloak_role" "realm_offline_access" {
  realm_id    = keycloak_realm.MyRealm.id
  name        = "offline_access"
  description = "${role_offline-access}"
}

resource "keycloak_role" "realm_user" {
  realm_id    = keycloak_realm.MyRealm.id
  name        = "user"
  description = null
}

