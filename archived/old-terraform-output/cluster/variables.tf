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

variable "roles" {
  description = "Realm and client roles"
  type        = any
  default     = {}
}

variable "clients" {
  description = "List of clients to create"
  type        = any
  default     = []
}