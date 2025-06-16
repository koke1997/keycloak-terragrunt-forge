# Common configuration for all environments
locals {
  # Common tags
  common_tags = {
    Project     = "keycloak-terragrunt-forge"
    ManagedBy   = "terragrunt"
    Environment = local.environment
  }
  
  # Parse environment from path
  path_parts = split("/", get_terragrunt_dir())
  environment = element(local.path_parts, index(local.path_parts, "environments") + 1)
  
  # Provider configuration
  provider_version = "~> 5.0"
  terraform_version = ">= 1.0"
  
  # Keycloak configuration
  keycloak_configs = {
    dev = {
      url = "http://localhost:8090"
      admin_username = "admin"
      admin_password = "admin"
      tls_insecure_skip_verify = true
    }
    staging = {
      url = get_env("KEYCLOAK_STAGING_URL", "https://keycloak-staging.example.com")
      admin_username = get_env("KEYCLOAK_STAGING_USERNAME", "admin")
      admin_password = get_env("KEYCLOAK_STAGING_PASSWORD", "")
      tls_insecure_skip_verify = false
    }
    prod = {
      url = get_env("KEYCLOAK_PROD_URL", "https://keycloak.example.com")
      admin_username = get_env("KEYCLOAK_PROD_USERNAME", "admin")
      admin_password = get_env("KEYCLOAK_PROD_PASSWORD", "")
      tls_insecure_skip_verify = false
    }
  }
}

# Remote state configuration
remote_state {
  backend = "local"
  config = {
    path = "${get_terragrunt_dir()}/terraform.tfstate"
  }
  
  # For production, use S3 backend:
  # backend = "s3"
  # config = {
  #   bucket = "keycloak-terraform-state-${local.environment}"
  #   key    = "${path_relative_to_include()}/terraform.tfstate"
  #   region = "us-west-2"
  #   
  #   dynamodb_table = "keycloak-terraform-locks"
  #   encrypt        = true
  # }
}

# Provider configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = "${local.terraform_version}"
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "${local.provider_version}"
    }
  }
}

provider "keycloak" {
  client_id                = "admin-cli"
  username                 = var.keycloak_admin_username
  password                 = var.keycloak_admin_password
  url                      = var.keycloak_url
  initial_login            = false
  client_timeout           = 60
  tls_insecure_skip_verify = var.keycloak_tls_insecure_skip_verify
}
EOF
}

# Common variables
generate "variables" {
  path      = "variables_common.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
}

variable "keycloak_admin_username" {
  description = "Keycloak admin username"
  type        = string
}

variable "keycloak_admin_password" {
  description = "Keycloak admin password"
  type        = string
  sensitive   = true
}

variable "keycloak_tls_insecure_skip_verify" {
  description = "Skip TLS verification for Keycloak connection"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
EOF
}

# Common inputs
inputs = {
  tags = local.common_tags
  keycloak_url = local.keycloak_configs[local.environment].url
  keycloak_admin_username = local.keycloak_configs[local.environment].admin_username
  keycloak_admin_password = local.keycloak_configs[local.environment].admin_password
  keycloak_tls_insecure_skip_verify = local.keycloak_configs[local.environment].tls_insecure_skip_verify
}