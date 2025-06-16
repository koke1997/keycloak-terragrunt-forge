# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module configuration
terraform {
  source = "."
}

# Dependencies - groups depend on realm and roles
dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

# Module-specific inputs
inputs = {
  realm_id = dependency.realm.outputs.realm_id
  realm_roles = dependency.roles.outputs.realm_role_ids
}