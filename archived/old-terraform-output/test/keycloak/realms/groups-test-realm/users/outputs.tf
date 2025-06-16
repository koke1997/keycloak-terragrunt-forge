output "users" {
  description = "Map of created users"
  value = {
    for k, user in keycloak_user.users : k => {
      id       = user.id
      username = user.username
      email    = user.email
    }
  }
}