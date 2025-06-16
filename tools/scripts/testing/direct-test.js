import fs from 'fs';
import path from 'path';

// Mock the conversion function structure
function simulateConversion(jsonData, fileName) {
  const realm = jsonData.realm || 'unknown';
  const files = [];
  
  // Main realm file
  files.push({
    filePath: `keycloak/realms/${realm}/main.tf`,
    content: generateMainTerraform(jsonData)
  });
  
  // Variables file
  files.push({
    filePath: `keycloak/realms/${realm}/variables.tf`,
    content: generateVariablesTerraform()
  });
  
  // Outputs file
  files.push({
    filePath: `keycloak/realms/${realm}/outputs.tf`,
    content: generateOutputsTerraform()
  });
  
  // Add modules based on content
  if (jsonData.users && jsonData.users.length > 0) {
    files.push({
      filePath: `keycloak/realms/${realm}/users/main.tf`,
      content: generateUsersTerraform(jsonData.users)
    });
  }
  
  if (jsonData.clients && jsonData.clients.length > 0) {
    files.push({
      filePath: `keycloak/realms/${realm}/clients/main.tf`,
      content: generateClientsTerraform(jsonData.clients)
    });
  }
  
  if (jsonData.roles && (jsonData.roles.realm || jsonData.roles.client)) {
    files.push({
      filePath: `keycloak/realms/${realm}/roles/main.tf`,
      content: generateRolesTerraform(jsonData.roles)
    });
  }
  
  return files;
}

function generateMainTerraform(json) {
  return `# Keycloak Realm: ${json.realm}
# Generated from realm export

terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
    }
  }
}

resource "keycloak_realm" "${json.realm.replace(/-/g, '_')}" {
  realm                     = "${json.realm}"
  enabled                   = ${json.enabled || true}
  display_name             = ${json.displayName ? `"${json.displayName}"` : 'null'}
  
  # Session settings
  sso_session_idle_timeout = ${json.ssoSessionIdleTimeout || 1800}
  sso_session_max_lifespan = ${json.ssoSessionMaxLifespan || 36000}
  
  # Token settings
  access_token_lifespan           = ${json.accessTokenLifespan || 300}
  access_code_lifespan           = ${json.accessCodeLifespan || 60}
  
  # Security settings
  ssl_required                = "${json.sslRequired || 'external'}"
  registration_allowed        = ${json.registrationAllowed || false}
  remember_me                = ${json.rememberMe || false}
  verify_email               = ${json.verifyEmail || false}
  login_with_email_allowed   = ${json.loginWithEmailAllowed || true}
  duplicate_emails_allowed   = ${json.duplicateEmailsAllowed || false}
  reset_password_allowed     = ${json.resetPasswordAllowed || true}
  edit_username_allowed      = ${json.editUsernameAllowed || false}
  
  # Brute force protection
  brute_force_protected      = ${json.bruteForceProtected || false}
}`;
}

function generateVariablesTerraform() {
  return `# Variables for Keycloak realm configuration

variable "keycloak_url" {
  description = "Keycloak server URL"
  type        = string
}

variable "keycloak_realm" {
  description = "Keycloak admin realm"
  type        = string
  default     = "master"
}

variable "keycloak_username" {
  description = "Keycloak admin username"
  type        = string
}

variable "keycloak_password" {
  description = "Keycloak admin password"
  type        = string
  sensitive   = true
}`;
}

function generateOutputsTerraform() {
  return `# Outputs for Keycloak realm

output "realm_id" {
  description = "The ID of the realm"
  value       = keycloak_realm.*.id
}

output "realm_name" {
  description = "The name of the realm"  
  value       = keycloak_realm.*.realm
}`;
}

function generateUsersTerraform(users) {
  let terraform = `# Keycloak Users Module

`;
  
  users.forEach((user, index) => {
    terraform += `resource "keycloak_user" "user_${index}" {
  realm_id   = var.realm_id
  username   = "${user.username}"
  enabled    = ${user.enabled || true}
  
  email      = "${user.email || ''}"
  first_name = "${user.firstName || ''}"
  last_name  = "${user.lastName || ''}"
  
  initial_password {
    value     = var.user_${index}_password
    temporary = true
  }
}

`;
  });
  
  return terraform;
}

function generateClientsTerraform(clients) {
  let terraform = `# Keycloak Clients Module

`;
  
  clients.forEach((client, index) => {
    terraform += `resource "keycloak_openid_client" "client_${client.clientId?.replace(/[^a-zA-Z0-9_]/g, '_') || index}" {
  realm_id    = var.realm_id
  client_id   = "${client.clientId}"
  name        = "${client.name || client.clientId}"
  description = "${client.description || ''}"
  
  enabled                      = ${client.enabled !== false}
  standard_flow_enabled       = ${client.standardFlowEnabled !== false}
  implicit_flow_enabled       = ${client.implicitFlowEnabled || false}
  direct_access_grants_enabled = ${client.directAccessGrantsEnabled !== false}
  service_accounts_enabled    = ${client.serviceAccountsEnabled || false}
  
  access_type = "${client.publicClient === false ? 'CONFIDENTIAL' : 'PUBLIC'}"
  
  ${client.redirectUris ? `valid_redirect_uris = ${JSON.stringify(client.redirectUris)}` : ''}
  ${client.webOrigins ? `web_origins = ${JSON.stringify(client.webOrigins)}` : ''}
}

`;
  });
  
  return terraform;
}

function generateRolesTerraform(roles) {
  let terraform = `# Keycloak Roles Module

`;
  
  if (roles.realm) {
    roles.realm.forEach((role, index) => {
      terraform += `resource "keycloak_role" "realm_role_${role.name?.replace(/[^a-zA-Z0-9_]/g, '_') || index}" {
  realm_id    = var.realm_id
  name        = "${role.name}"
  description = "${role.description || ''}"
}

`;
    });
  }
  
  return terraform;
}

async function testConversions() {
  console.log('🧪 Testing Direct Conversion Functionality');
  console.log('==========================================');
  
  const testDir = './test-samples';
  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));
  
  // Create output directory
  if (!fs.existsSync('terraform-output')) {
    fs.mkdirSync('terraform-output', { recursive: true });
  }
  
  for (const file of files) {
    console.log(`\n📄 Processing: ${file}`);
    
    try {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      
      // Convert to Terraform
      const terraformFiles = simulateConversion(json, file);
      
      console.log(`   ✅ Generated ${terraformFiles.length} Terraform files`);
      
      // Save files
      const outputDir = `terraform-output/${json.realm}`;
      terraformFiles.forEach(tfFile => {
        const fullPath = path.join(outputDir, path.basename(tfFile.filePath));
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, tfFile.content);
      });
      
      console.log(`   💾 Saved to: ${outputDir}`);
      console.log(`   📊 Files: ${terraformFiles.map(f => path.basename(f.filePath)).join(', ')}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Conversion testing complete!');
  console.log('\n📁 Generated files structure:');
  
  // Show directory structure
  function showDirectory(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach((item, index) => {
      const itemPath = path.join(dir, item);
      const isLast = index === items.length - 1;
      const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
      
      console.log(currentPrefix + item);
      
      if (fs.statSync(itemPath).isDirectory()) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        showDirectory(itemPath, nextPrefix);
      }
    });
  }
  
  showDirectory('./terraform-output');
}

testConversions().catch(console.error);