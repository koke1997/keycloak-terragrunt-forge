variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
  default     = "http://localhost:8090"
}

variable "keycloak_admin_username" {
  description = "Keycloak admin username"
  type        = string
  default     = "admin"
}

variable "keycloak_admin_password" {
  description = "Keycloak admin password"
  type        = string
  default     = "admin123"
  sensitive   = true
}