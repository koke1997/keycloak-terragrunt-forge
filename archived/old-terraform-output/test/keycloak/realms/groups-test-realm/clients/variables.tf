variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "clients" {
  description = "List of clients to create"
  type        = any
  default     = []
}