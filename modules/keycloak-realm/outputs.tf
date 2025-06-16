# Keycloak realm outputs
output "realm_id" {
  description = "The ID of the created realm"
  value       = keycloak_realm.realm.id
}

output "realm_name" {
  description = "The name of the created realm"
  value       = keycloak_realm.realm.realm
}

output "realm_enabled" {
  description = "Whether the realm is enabled"
  value       = keycloak_realm.realm.enabled
}

output "realm_display_name" {
  description = "The display name of the realm"
  value       = keycloak_realm.realm.display_name
}

output "realm_login_theme" {
  description = "The login theme of the realm"
  value       = keycloak_realm.realm.login_theme
}

output "realm_account_theme" {
  description = "The account theme of the realm"
  value       = keycloak_realm.realm.account_theme
}

output "realm_admin_theme" {
  description = "The admin theme of the realm"
  value       = keycloak_realm.realm.admin_theme
}

output "realm_email_theme" {
  description = "The email theme of the realm"
  value       = keycloak_realm.realm.email_theme
}

# Session settings outputs
output "sso_session_idle_timeout" {
  description = "SSO session idle timeout"
  value       = keycloak_realm.realm.sso_session_idle_timeout
}

output "sso_session_max_lifespan" {
  description = "SSO session max lifespan"
  value       = keycloak_realm.realm.sso_session_max_lifespan
}

# Token settings outputs
output "access_token_lifespan" {
  description = "Access token lifespan"
  value       = keycloak_realm.realm.access_token_lifespan
}

output "access_code_lifespan" {
  description = "Access code lifespan"
  value       = keycloak_realm.realm.access_code_lifespan
}

# Security settings outputs
output "ssl_required" {
  description = "SSL requirement level"
  value       = keycloak_realm.realm.ssl_required
}

output "brute_force_protected" {
  description = "Whether brute force protection is enabled"
  value       = keycloak_realm.realm.brute_force_protected
}