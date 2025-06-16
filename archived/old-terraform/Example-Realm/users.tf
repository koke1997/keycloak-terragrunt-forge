# Users for realm Example-Realm

resource "keycloak_user" "christina" {
  realm_id   = keycloak_realm.Example_Realm.id
  username   = "christina"
  enabled    = true
  
  email      = "christina@test.com"
  first_name = "Christina"
  last_name  = "Travis"
  
  email_verified = false
}

resource "keycloak_user_password" "christina_password" {
  user_id   = keycloak_user.christina.id
  value     = "test"
  temporary = true
}

resource "keycloak_user" "hanna" {
  realm_id   = keycloak_realm.Example_Realm.id
  username   = "hanna"
  enabled    = true
  
  email      = "hanna@test.com"
  first_name = "Hanna"
  last_name  = "Davis"
  
  email_verified = false
}

resource "keycloak_user_password" "hanna_password" {
  user_id   = keycloak_user.hanna.id
  value     = "test"
  temporary = true
}

resource "keycloak_user" "carlo" {
  realm_id   = keycloak_realm.Example_Realm.id
  username   = "carlo"
  enabled    = true
  
  email      = "carlo@test.com"
  first_name = "Carlo"
  last_name  = "Velazquez"
  
  email_verified = false
}

resource "keycloak_user_password" "carlo_password" {
  user_id   = keycloak_user.carlo.id
  value     = "test"
  temporary = true
}

resource "keycloak_user" "noel" {
  realm_id   = keycloak_realm.Example_Realm.id
  username   = "noel"
  enabled    = true
  
  email      = "noel@test.com"
  first_name = "Noel"
  last_name  = "Horton"
  
  email_verified = false
}

resource "keycloak_user_password" "noel_password" {
  user_id   = keycloak_user.noel.id
  value     = "test"
  temporary = true
}

