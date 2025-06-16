output "groups" {
  description = "Map of created groups"
  value = {
    for k, group in keycloak_group.groups : k => {
      id        = group.id
      name      = group.name
      path      = group.path
      parent_id = group.parent_id
    }
  }
}