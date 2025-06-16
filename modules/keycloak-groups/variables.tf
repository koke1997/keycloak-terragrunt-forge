# Keycloak groups variables
variable "realm_id" {
  description = "The ID of the realm where groups will be created"
  type        = string
}

variable "groups" {
  description = "Map of groups to create"
  type = map(object({
    name = string
    path = string
    attributes = optional(map(list(string)), {})
    realm_roles = optional(list(string), [])
    subGroups = optional(map(object({
      name = string
      path = string
      attributes = optional(map(list(string)), {})
      realm_roles = optional(list(string), [])
    })), {})
  }))
  default = {}
}

variable "realm_roles" {
  description = "Map of realm role names to role IDs"
  type        = map(string)
  default     = {}
}

# Common variables
variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}