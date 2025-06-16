# Generated from example-realm.json
# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source  
terraform {
  source = "../../../../../../modules/keycloak-realm"
}

# Dependencies
dependencies {
  paths = []
}

# Realm-specific inputs
inputs = {
  realm_name = "example-realm"
  enabled = true
  display_name = "Example Keycloak Sign-In"
  
  # Generated from realm.json - 2025-06-15T16:07:56.990Z
  # Original file: example-realm.json
  # Components: users, clients
}