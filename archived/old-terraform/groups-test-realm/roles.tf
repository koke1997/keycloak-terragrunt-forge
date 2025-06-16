# Roles for realm groups-test-realm

resource "keycloak_role" "realm_admin" {
  realm_id    = keycloak_realm.groups_test_realm.id
  name        = "admin"
  description = "Administrator role"
}

resource "keycloak_role" "realm_manager" {
  realm_id    = keycloak_realm.groups_test_realm.id
  name        = "manager"
  description = "Manager role"
}

resource "keycloak_role" "realm_employee" {
  realm_id    = keycloak_realm.groups_test_realm.id
  name        = "employee"
  description = "Employee role"
}

