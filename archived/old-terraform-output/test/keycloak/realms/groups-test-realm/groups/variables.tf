variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "groups" {
  description = "List of groups to create"
  type        = list(object({
    name       = string
    path       = optional(string)
    parent_id  = optional(string)
    attributes = optional(map(list(string)), {})
  }))
  default = []
}