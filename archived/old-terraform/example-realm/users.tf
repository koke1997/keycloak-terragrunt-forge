# Users for realm example-realm

resource "keycloak_user" "user" {
  realm_id   = keycloak_realm.example_realm.id
  username   = "user"
  enabled    = true
  
  email      = "example@keycloak.org"
  first_name = "Example"
  last_name  = "User"
  
  email_verified = false
}

resource "keycloak_user_password" "user_password" {
  user_id   = keycloak_user.user.id
  value     = "password"
  temporary = true
}

