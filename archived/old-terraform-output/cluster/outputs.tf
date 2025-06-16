output "realm_id" {
  description = "ID of the created realm"
  value       = keycloak_realm.realm.id
}

output "realm_name" {
  description = "Name of the created realm"
  value       = keycloak_realm.realm.realm
}

output "groups" {
  description = "Created groups"
  value       = try(module.groups.groups, {})
}

output "users" {
  description = "Created users"
  value       = try(module.users.users, {})
}

output "roles" {
  description = "Created roles"
  value       = try(module.roles.roles, {})
}

output "clients" {
  description = "Created clients"
  value       = try(module.clients.clients, {})
}