# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module configuration
terraform {
  source = "."
}

# Dependencies - realm is typically created first
dependencies {
  paths = []
}

# Module-specific inputs
inputs = {
  # Realm configuration will be provided by environment-specific configs
}