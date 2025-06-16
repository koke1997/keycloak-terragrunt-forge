output "roles" {
  description = "Created roles"
  value = {
    realm_roles = try(keycloak_role.realm_roles, {})
  }
}
