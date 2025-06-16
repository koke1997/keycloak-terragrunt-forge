# Generated from groups-test-realm.json
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
  realm_name = "groups-test-realm"
  enabled = true
  display_name = "Groups Test Realm"
  
  # Generated from realm.json - 2025-06-15T16:07:56.989Z
  # Original file: groups-test-realm.json
  # Components: groups, users, clients
}