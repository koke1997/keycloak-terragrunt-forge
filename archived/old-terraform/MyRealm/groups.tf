# Groups for realm MyRealm

resource "keycloak_group" "Users" {
  realm_id = keycloak_realm.MyRealm.id
  name     = "Users"
  
  
  # No attributes
}

resource "keycloak_group_roles" "Users_user" {
  realm_id = keycloak_realm.MyRealm.id
  group_id = keycloak_group.Users.id
  role_ids = [keycloak_role.realm_user.id]
}

