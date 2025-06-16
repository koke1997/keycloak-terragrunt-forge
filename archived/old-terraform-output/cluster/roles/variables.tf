variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "roles" {
  description = "Realm and client roles"
  type        = any
  default     = {}
}