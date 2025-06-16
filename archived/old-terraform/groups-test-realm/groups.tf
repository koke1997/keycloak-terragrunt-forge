# Groups for realm groups-test-realm

resource "keycloak_group" "administrators" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "administrators"
  
  
  attributes = {
    department = ["IT"]
    level = ["senior"]
  }
}

resource "keycloak_group_roles" "administrators_admin" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.administrators.id
  role_ids = [keycloak_role.realm_admin.id]
}

resource "keycloak_group" "human_resources" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "human-resources"
  
  
  attributes = {
    department = ["HR"]
    level = ["management"]
  }
}

resource "keycloak_group_roles" "human_resources_manager" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.human_resources.id
  role_ids = [keycloak_role.realm_manager.id]
}

resource "keycloak_group" "human_resources_hr_managers" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "hr-managers"
  parent_id = keycloak_group.human_resources.id
  
  attributes = {
    level = ["senior"]
  }
}

resource "keycloak_group_roles" "human_resources_hr_managers_manager" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.human_resources_hr_managers.id
  role_ids = [keycloak_role.realm_manager.id]
}

resource "keycloak_group" "human_resources_hr_staff" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "hr-staff"
  parent_id = keycloak_group.human_resources.id
  
  attributes = {
    level = ["junior"]
  }
}

resource "keycloak_group_roles" "human_resources_hr_staff_employee" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.human_resources_hr_staff.id
  role_ids = [keycloak_role.realm_employee.id]
}

resource "keycloak_group" "engineering" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "engineering"
  
  
  attributes = {
    department = ["Engineering"]
    level = ["technical"]
  }
}

resource "keycloak_group_roles" "engineering_employee" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.engineering.id
  role_ids = [keycloak_role.realm_employee.id]
}

resource "keycloak_group" "engineering_frontend_team" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "frontend-team"
  parent_id = keycloak_group.engineering.id
  
  attributes = {
    stack = ["react","typescript"]
  }
}

resource "keycloak_group_roles" "engineering_frontend_team_employee" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.engineering_frontend_team.id
  role_ids = [keycloak_role.realm_employee.id]
}

resource "keycloak_group" "engineering_backend_team" {
  realm_id = keycloak_realm.groups_test_realm.id
  name     = "backend-team"
  parent_id = keycloak_group.engineering.id
  
  attributes = {
    stack = ["node","postgres"]
  }
}

resource "keycloak_group_roles" "engineering_backend_team_employee" {
  realm_id = keycloak_realm.groups_test_realm.id
  group_id = keycloak_group.engineering_backend_team.id
  role_ids = [keycloak_role.realm_employee.id]
}

