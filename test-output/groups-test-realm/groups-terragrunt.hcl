# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../../modules/keycloak-groups"
}

# Dependencies - groups depend on realm and roles
dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

# Groups configuration
inputs = {
  realm_id = dependency.realm.outputs.realm_id
  realm_roles = dependency.roles.outputs.realm_role_ids
  
  groups = {
    "administrators" = {
      name = "administrators"
      path = "/administrators"
      attributes = {"department":["IT"],"level":["senior"]}
      realm_roles = ["admin"]
      subGroups = []
    }
    "human-resources" = {
      name = "human-resources"
      path = "/human-resources"
      attributes = {"department":["HR"],"level":["management"]}
      realm_roles = ["manager"]
      subGroups = [{"id":"hr-managers-id","name":"hr-managers","path":"/human-resources/hr-managers","attributes":{"level":["senior"]},"realmRoles":["manager"],"subGroups":[]},{"id":"hr-staff-id","name":"hr-staff","path":"/human-resources/hr-staff","attributes":{"level":["junior"]},"realmRoles":["employee"],"subGroups":[]}]
    }
    "engineering" = {
      name = "engineering"
      path = "/engineering"
      attributes = {"department":["Engineering"],"level":["technical"]}
      realm_roles = ["employee"]
      subGroups = [{"id":"frontend-team-id","name":"frontend-team","path":"/engineering/frontend-team","attributes":{"stack":["react","typescript"]},"realmRoles":["employee"],"subGroups":[]},{"id":"backend-team-id","name":"backend-team","path":"/engineering/backend-team","attributes":{"stack":["node","postgres"]},"realmRoles":["employee"],"subGroups":[]}]
    }
  }
}