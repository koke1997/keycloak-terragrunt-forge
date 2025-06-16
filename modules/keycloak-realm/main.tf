# Keycloak realm module
resource "keycloak_realm" "realm" {
  realm                        = var.realm_name
  enabled                      = var.enabled
  display_name                 = var.display_name
  display_name_html            = var.display_name_html
  
  # Login settings
  registration_allowed         = var.registration_allowed
  registration_email_as_username = var.registration_email_as_username
  remember_me                  = var.remember_me
  verify_email                 = var.verify_email
  login_with_email_allowed     = var.login_with_email_allowed
  duplicate_emails_allowed     = var.duplicate_emails_allowed
  reset_password_allowed       = var.reset_password_allowed
  edit_username_allowed        = var.edit_username_allowed
  
  # Session settings
  sso_session_idle_timeout     = var.sso_session_idle_timeout
  sso_session_max_lifespan     = var.sso_session_max_lifespan
  offline_session_idle_timeout = var.offline_session_idle_timeout
  offline_session_max_lifespan = var.offline_session_max_lifespan
  offline_session_max_lifespan_enabled = var.offline_session_max_lifespan_enabled
  
  # Token settings
  access_token_lifespan               = var.access_token_lifespan
  access_token_lifespan_for_implicit_flow = var.access_token_lifespan_for_implicit_flow
  access_code_lifespan                = var.access_code_lifespan
  access_code_lifespan_user_action    = var.access_code_lifespan_user_action
  access_code_lifespan_login          = var.access_code_lifespan_login
  action_token_generated_by_admin_lifespan = var.action_token_generated_by_admin_lifespan
  action_token_generated_by_user_lifespan  = var.action_token_generated_by_user_lifespan
  
  # Security settings
  ssl_required                 = var.ssl_required
  brute_force_protected        = var.brute_force_protected
  permanent_lockout            = var.permanent_lockout
  max_failure_wait_seconds     = var.max_failure_wait_seconds
  minimum_quick_login_wait_seconds = var.minimum_quick_login_wait_seconds
  wait_increment_seconds       = var.wait_increment_seconds
  quick_login_check_millis     = var.quick_login_check_millis
  max_delta_time_seconds       = var.max_delta_time_seconds
  failure_factor               = var.failure_factor
  
  # Token refresh settings
  revoke_refresh_token         = var.revoke_refresh_token
  refresh_token_max_reuse      = var.refresh_token_max_reuse
  
  # Additional attributes
  dynamic "attributes" {
    for_each = var.attributes
    content {
      name  = attributes.key
      value = attributes.value
    }
  }
}