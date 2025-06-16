# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../../modules/keycloak-realm"
}

# Dependencies - none for realm (it's created first)
dependencies {
  paths = []
}

# Environment-specific inputs
inputs = {
  # Realm configuration
  realm_name = "example"
  enabled = true
  display_name = "example"
  display_name_html = null
  
  # Login settings
  registration_allowed = true
  registration_email_as_username = true
  remember_me = true
  verify_email = false
  login_with_email_allowed = true
  duplicate_emails_allowed = false
  reset_password_allowed = false
  edit_username_allowed = false
  
  # Session settings
  sso_session_idle_timeout = 1800
  sso_session_max_lifespan = 36000
  offline_session_idle_timeout = 2592000
  offline_session_max_lifespan = 5184000
  offline_session_max_lifespan_enabled = false
  
  # Token settings
  access_token_lifespan = 300
  access_token_lifespan_for_implicit_flow = 900
  access_code_lifespan = 60
  access_code_lifespan_user_action = 300
  access_code_lifespan_login = 1800
  action_token_generated_by_admin_lifespan = 43200
  action_token_generated_by_user_lifespan = 300
  
  # Security settings
  ssl_required = "external"
  brute_force_protected = false
  permanent_lockout = false
  max_failure_wait_seconds = 900
  minimum_quick_login_wait_seconds = 60
  wait_increment_seconds = 60
  quick_login_check_millis = 1000
  max_delta_time_seconds = 43200
  failure_factor = 30
  
  # Token refresh settings
  revoke_refresh_token = false
  refresh_token_max_reuse = 0
}