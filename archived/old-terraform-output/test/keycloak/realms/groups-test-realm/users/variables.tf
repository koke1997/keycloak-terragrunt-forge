variable "realm_id" {
  description = "ID of the Keycloak realm"
  type        = string
}

variable "users" {
  description = "List of users to create"
  type        = list(object({
    username      = string
    email         = optional(string)
    first_name    = optional(string)
    last_name     = optional(string)
    enabled       = optional(bool, true)
    attributes    = optional(map(list(string)), {})
    groups        = optional(list(string), [])
    realm_roles   = optional(list(string), [])
    client_roles  = optional(map(list(string)), {})
  }))
  default = []
}