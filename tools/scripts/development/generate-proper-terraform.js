import fs from 'fs';
import path from 'path';

// Generate proper Terraform with correct syntax
function generateProperTerraform(jsonData, fileName) {
  const realm = jsonData.realm || 'unknown';
  const files = [];
  
  // Provider configuration
  files.push({
    filePath: `terraform/${realm}/provider.tf`,
    content: `terraform {
  required_version = ">= 1.0"
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
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
  tls_insecure_skip_verify = true
}`
  });

  // Variables
  files.push({
    filePath: `terraform/${realm}/variables.tf`,
    content: `variable "keycloak_url" {
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
}`
  });

  // Main realm configuration
  files.push({
    filePath: `terraform/${realm}/realm.tf`,
    content: generateRealmTerraform(jsonData)
  });

  // Users
  if (jsonData.users && jsonData.users.length > 0) {
    files.push({
      filePath: `terraform/${realm}/users.tf`,
      content: generateUsersTerraform(jsonData.users, realm)
    });
  }

  // Roles
  if (jsonData.roles && (jsonData.roles.realm || jsonData.roles.client)) {
    files.push({
      filePath: `terraform/${realm}/roles.tf`,
      content: generateRolesTerraform(jsonData.roles, realm)
    });
  }

  // Clients
  if (jsonData.clients && jsonData.clients.length > 0) {
    files.push({
      filePath: `terraform/${realm}/clients.tf`,
      content: generateClientsTerraform(jsonData.clients, realm)
    });
  }

  // Groups
  if (jsonData.groups && jsonData.groups.length > 0) {
    files.push({
      filePath: `terraform/${realm}/groups.tf`,
      content: generateGroupsTerraform(jsonData.groups, realm)
    });
  }

  return files;
}

function generateRealmTerraform(json) {
  const realm = json.realm;
  const safeName = realm.replace(/[^a-zA-Z0-9_]/g, '_');
  
  return `resource "keycloak_realm" "${safeName}" {
  realm                        = "${realm}"
  enabled                      = ${json.enabled !== false}
  display_name                 = ${json.displayName ? `"${json.displayName}"` : 'null'}
  display_name_html            = ${json.displayNameHtml ? `"${json.displayNameHtml.replace(/"/g, '\\"')}"` : 'null'}
  
  # Login settings
  registration_allowed         = ${json.registrationAllowed || false}
  registration_email_as_username = ${json.registrationEmailAsUsername || false}
  remember_me                  = ${json.rememberMe || false}
  verify_email                 = ${json.verifyEmail || false}
  login_with_email_allowed     = ${json.loginWithEmailAllowed !== false}
  duplicate_emails_allowed     = ${json.duplicateEmailsAllowed || false}
  reset_password_allowed       = ${json.resetPasswordAllowed !== false}
  edit_username_allowed        = ${json.editUsernameAllowed || false}
  
  # Session settings
  sso_session_idle_timeout     = ${json.ssoSessionIdleTimeout || 1800}
  sso_session_max_lifespan     = ${json.ssoSessionMaxLifespan || 36000}
  offline_session_idle_timeout = ${json.offlineSessionIdleTimeout || 2592000}
  offline_session_max_lifespan = ${json.offlineSessionMaxLifespan || 5184000}
  offline_session_max_lifespan_enabled = ${json.offlineSessionMaxLifespanEnabled || false}
  
  # Token settings
  access_token_lifespan               = ${json.accessTokenLifespan || 300}
  access_token_lifespan_for_implicit_flow = ${json.accessTokenLifespanForImplicitFlow || 900}
  access_code_lifespan                = ${json.accessCodeLifespan || 60}
  access_code_lifespan_user_action    = ${json.accessCodeLifespanUserAction || 300}
  access_code_lifespan_login          = ${json.accessCodeLifespanLogin || 1800}
  action_token_generated_by_admin_lifespan = ${json.actionTokenGeneratedByAdminLifespan || 43200}
  action_token_generated_by_user_lifespan  = ${json.actionTokenGeneratedByUserLifespan || 300}
  
  # Security settings
  ssl_required                 = "${json.sslRequired || 'external'}"
  brute_force_protected        = ${json.bruteForceProtected || false}
  permanent_lockout            = ${json.permanentLockout || false}
  max_failure_wait_seconds     = ${json.maxFailureWaitSeconds || 900}
  minimum_quick_login_wait_seconds = ${json.minimumQuickLoginWaitSeconds || 60}
  wait_increment_seconds       = ${json.waitIncrementSeconds || 60}
  quick_login_check_millis     = ${json.quickLoginCheckMilliSeconds || 1000}
  max_delta_time_seconds       = ${json.maxDeltaTimeSeconds || 43200}
  failure_factor               = ${json.failureFactor || 30}
  
  # Token refresh settings
  revoke_refresh_token         = ${json.revokeRefreshToken || false}
  refresh_token_max_reuse      = ${json.refreshTokenMaxReuse || 0}
}`;
}

function generateUsersTerraform(users, realm) {
  const safeName = realm.replace(/[^a-zA-Z0-9_]/g, '_');
  let terraform = `# Users for realm ${realm}\n\n`;
  
  users.forEach((user, index) => {
    const userSafeName = (user.username || `user_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `resource "keycloak_user" "${userSafeName}" {
  realm_id   = keycloak_realm.${safeName}.id
  username   = "${user.username || `user_${index}`}"
  enabled    = ${user.enabled !== false}
  
  email      = ${user.email ? `"${user.email}"` : 'null'}
  first_name = ${user.firstName ? `"${user.firstName}"` : 'null'}
  last_name  = ${user.lastName ? `"${user.lastName}"` : 'null'}
  
  email_verified = ${user.emailVerified || false}
}

`;

    // Add user credentials if present
    if (user.credentials && user.credentials.length > 0) {
      const passwordCred = user.credentials.find(c => c.type === 'password');
      if (passwordCred) {
        terraform += `resource "keycloak_user_password" "${userSafeName}_password" {
  user_id   = keycloak_user.${userSafeName}.id
  value     = "${passwordCred.value || 'changeme'}"
  temporary = ${passwordCred.temporary !== false}
}

`;
      }
    }
  });
  
  return terraform;
}

function generateRolesTerraform(roles, realm) {
  const safeName = realm.replace(/[^a-zA-Z0-9_]/g, '_');
  let terraform = `# Roles for realm ${realm}\n\n`;
  
  // Realm roles
  if (roles.realm && roles.realm.length > 0) {
    roles.realm.forEach((role, index) => {
      const roleSafeName = (role.name || `role_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      
      terraform += `resource "keycloak_role" "realm_${roleSafeName}" {
  realm_id    = keycloak_realm.${safeName}.id
  name        = "${role.name}"
  description = ${role.description ? `"${role.description}"` : 'null'}
}

`;
    });
  }
  
  return terraform;
}

function generateClientsTerraform(clients, realm) {
  const safeName = realm.replace(/[^a-zA-Z0-9_]/g, '_');
  let terraform = `# Clients for realm ${realm}\n\n`;
  
  clients.forEach((client, index) => {
    const clientSafeName = (client.clientId || `client_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
    
    terraform += `resource "keycloak_openid_client" "${clientSafeName}" {
  realm_id                     = keycloak_realm.${safeName}.id
  client_id                    = "${client.clientId}"
  name                         = ${client.name ? `"${client.name}"` : `"${client.clientId}"`}
  description                  = ${client.description ? `"${client.description}"` : 'null'}
  
  enabled                      = ${client.enabled !== false}
  standard_flow_enabled        = ${client.standardFlowEnabled !== false}
  implicit_flow_enabled        = ${client.implicitFlowEnabled || false}
  direct_access_grants_enabled = ${client.directAccessGrantsEnabled !== false}
  service_accounts_enabled     = ${client.serviceAccountsEnabled || false}
  
  access_type = "${client.publicClient === false ? 'CONFIDENTIAL' : 'PUBLIC'}"
  
  ${client.redirectUris && client.redirectUris.length > 0 ? 
    `valid_redirect_uris = ${JSON.stringify(client.redirectUris)}` : 
    '# valid_redirect_uris = []'}
  ${client.webOrigins && client.webOrigins.length > 0 ? 
    `web_origins = ${JSON.stringify(client.webOrigins)}` : 
    '# web_origins = []'}
}

`;
  });
  
  return terraform;
}

function generateGroupsTerraform(groups, realm) {
  const safeName = realm.replace(/[^a-zA-Z0-9_]/g, '_');
  let terraform = `# Groups for realm ${realm}\n\n`;
  
  // First pass: create all groups (parent groups first)
  function processGroups(groupList, parentPath = '') {
    groupList.forEach((group, index) => {
      const groupSafeName = (group.name || `group_${index}`).replace(/[^a-zA-Z0-9_]/g, '_');
      const fullSafeName = parentPath ? `${parentPath}_${groupSafeName}` : groupSafeName;
      
      terraform += `resource "keycloak_group" "${fullSafeName}" {
  realm_id = keycloak_realm.${safeName}.id
  name     = "${group.name}"
  ${parentPath ? `parent_id = keycloak_group.${parentPath}.id` : ''}
  
  ${group.attributes && Object.keys(group.attributes).length > 0 ? 
    `attributes = {${Object.entries(group.attributes).map(([key, values]) => 
      `\n    ${key} = ${JSON.stringify(Array.isArray(values) ? values : [values])}`
    ).join('')}\n  }` : '# No attributes'}
}

`;

      // Add group role mappings if present
      if (group.realmRoles && group.realmRoles.length > 0) {
        group.realmRoles.forEach(roleName => {
          const roleSafeName = roleName.replace(/[^a-zA-Z0-9_]/g, '_');
          terraform += `resource "keycloak_group_roles" "${fullSafeName}_${roleSafeName}" {
  realm_id = keycloak_realm.${safeName}.id
  group_id = keycloak_group.${fullSafeName}.id
  role_ids = [keycloak_role.realm_${roleSafeName}.id]
}

`;
        });
      }

      // Process subgroups recursively
      if (group.subGroups && group.subGroups.length > 0) {
        processGroups(group.subGroups, fullSafeName);
      }
    });
  }
  
  processGroups(groups);
  return terraform;
}

async function generateAllTerraform() {
  console.log('🔧 Generating Proper Terraform Configurations');
  console.log('===============================================');
  
  const testDir = './test-samples';
  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    console.log(`\n📄 Processing: ${file}`);
    
    try {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      
      // Generate proper Terraform
      const terraformFiles = generateProperTerraform(json, file);
      
      console.log(`   ✅ Generated ${terraformFiles.length} Terraform files`);
      
      // Save files
      terraformFiles.forEach(tfFile => {
        const fullPath = tfFile.filePath;
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, tfFile.content);
      });
      
      console.log(`   💾 Saved to: terraform/${json.realm}`);
      console.log(`   📊 Files: ${terraformFiles.map(f => path.basename(f.filePath)).join(', ')}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Terraform generation complete!');
}

generateAllTerraform().catch(console.error);