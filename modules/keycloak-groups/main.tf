# Keycloak groups module
locals {
  # Flatten groups for creation
  all_groups = flatten([
    for group_key, group in var.groups : [
      {
        key = group_key
        name = group.name
        path = group.path
        parent_key = null
        attributes = group.attributes
        realm_roles = group.realm_roles
      },
      [
        for subgroup_key, subgroup in lookup(group, "subGroups", {}) : {
          key = "${group_key}_${subgroup_key}"
          name = subgroup.name
          path = subgroup.path
          parent_key = group_key
          attributes = subgroup.attributes
          realm_roles = subgroup.realm_roles
        }
      ]...
    ]
  ])
  
  # Create lookup maps
  groups_map = {
    for group in local.all_groups :
    group.key => group
  }
  
  # Separate parent and child groups
  parent_groups = {
    for key, group in local.groups_map :
    key => group
    if group.parent_key == null
  }
  
  child_groups = {
    for key, group in local.groups_map :
    key => group
    if group.parent_key != null
  }
}

# Create parent groups first
resource "keycloak_group" "parent_groups" {
  for_each = local.parent_groups
  
  realm_id = var.realm_id
  name     = each.value.name
  
  dynamic "attributes" {
    for_each = each.value.attributes != null ? each.value.attributes : {}
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}

# Create child groups with parent dependencies
resource "keycloak_group" "child_groups" {
  for_each = local.child_groups
  
  realm_id  = var.realm_id
  name      = each.value.name
  parent_id = keycloak_group.parent_groups[each.value.parent_key].id
  
  dynamic "attributes" {
    for_each = each.value.attributes != null ? each.value.attributes : {}
    content {
      name   = attributes.key
      values = attributes.value
    }
  }
}

# Create group role mappings for parent groups
resource "keycloak_group_roles" "parent_group_roles" {
  for_each = {
    for key, group in local.parent_groups :
    key => group
    if group.realm_roles != null && length(group.realm_roles) > 0
  }
  
  realm_id = var.realm_id
  group_id = keycloak_group.parent_groups[each.key].id
  role_ids = [
    for role_name in each.value.realm_roles :
    var.realm_roles[role_name]
  ]
}

# Create group role mappings for child groups
resource "keycloak_group_roles" "child_group_roles" {
  for_each = {
    for key, group in local.child_groups :
    key => group
    if group.realm_roles != null && length(group.realm_roles) > 0
  }
  
  realm_id = var.realm_id
  group_id = keycloak_group.child_groups[each.key].id
  role_ids = [
    for role_name in each.value.realm_roles :
    var.realm_roles[role_name]
  ]
}