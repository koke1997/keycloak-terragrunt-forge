# Keycloak groups outputs
output "parent_group_ids" {
  description = "Map of parent group keys to their IDs"
  value = {
    for key, group in keycloak_group.parent_groups :
    key => group.id
  }
}

output "child_group_ids" {
  description = "Map of child group keys to their IDs"
  value = {
    for key, group in keycloak_group.child_groups :
    key => group.id
  }
}

output "all_group_ids" {
  description = "Map of all group keys to their IDs"
  value = merge(
    {
      for key, group in keycloak_group.parent_groups :
      key => group.id
    },
    {
      for key, group in keycloak_group.child_groups :
      key => group.id
    }
  )
}

output "parent_group_names" {
  description = "Map of parent group keys to their names"
  value = {
    for key, group in keycloak_group.parent_groups :
    key => group.name
  }
}

output "child_group_names" {
  description = "Map of child group keys to their names"
  value = {
    for key, group in keycloak_group.child_groups :
    key => group.name
  }
}

output "groups_with_roles" {
  description = "Map of groups that have role mappings"
  value = merge(
    {
      for key, roles in keycloak_group_roles.parent_group_roles :
      key => {
        group_id = roles.group_id
        role_ids = roles.role_ids
      }
    },
    {
      for key, roles in keycloak_group_roles.child_group_roles :
      key => {
        group_id = roles.group_id
        role_ids = roles.role_ids
      }
    }
  )
}