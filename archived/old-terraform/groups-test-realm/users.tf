# Users for realm groups-test-realm

resource "keycloak_user" "admin_user" {
  realm_id   = keycloak_realm.groups_test_realm.id
  username   = "admin-user"
  enabled    = true
  
  email      = "admin@company.com"
  first_name = "System"
  last_name  = "Administrator"
  
  email_verified = false
}

resource "keycloak_user_password" "admin_user_password" {
  user_id   = keycloak_user.admin_user.id
  value     = "admin123"
  temporary = false
}

resource "keycloak_user" "hr_manager" {
  realm_id   = keycloak_realm.groups_test_realm.id
  username   = "hr-manager"
  enabled    = true
  
  email      = "hrmanager@company.com"
  first_name = "Jane"
  last_name  = "Smith"
  
  email_verified = false
}

resource "keycloak_user_password" "hr_manager_password" {
  user_id   = keycloak_user.hr_manager.id
  value     = "manager123"
  temporary = false
}

resource "keycloak_user" "developer" {
  realm_id   = keycloak_realm.groups_test_realm.id
  username   = "developer"
  enabled    = true
  
  email      = "dev@company.com"
  first_name = "John"
  last_name  = "Developer"
  
  email_verified = false
}

resource "keycloak_user_password" "developer_password" {
  user_id   = keycloak_user.developer.id
  value     = "dev123"
  temporary = false
}

