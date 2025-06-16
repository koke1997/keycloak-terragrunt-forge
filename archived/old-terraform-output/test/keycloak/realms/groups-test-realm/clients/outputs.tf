output "clients" {
  description = "Created clients"
  value = {
    for k, client in keycloak_openid_client.clients : k => {
      id        = client.id
      client_id = client.client_id
      name      = client.name
    }
  }
}