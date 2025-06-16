#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Test script to validate the new Terragrunt DRY structure
 * Tests conversion using existing realm.json files
 */

// Test realm files
const testFiles = [
  './data/samples/groups-test-realm.json',
  './data/samples/example-realm.json',
  './data/samples/api-key-realm.json'
];

console.log('🧪 Testing Terragrunt DRY Conversion\n');

function generateTerragruntConfig(realmData, environment = 'dev') {
  const realmName = realmData.realm;
  const safeName = realmName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Generate terragrunt.hcl for the realm
  const terragruntConfig = `# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../../modules/keycloak-realm"
}

# Dependencies - none for realm (it's created first)
dependencies {
  paths = []
}

# Environment-specific inputs
inputs = {
  # Realm configuration
  realm_name = "${realmName}"
  enabled = ${realmData.enabled || true}
  display_name = "${realmData.displayName || realmName}"
  display_name_html = ${realmData.displayNameHtml ? `"${realmData.displayNameHtml.replace(/"/g, '\\"')}"` : 'null'}
  
  # Login settings
  registration_allowed = ${realmData.registrationAllowed || true}
  registration_email_as_username = ${realmData.registrationEmailAsUsername || false}
  remember_me = ${realmData.rememberMe || true}
  verify_email = ${realmData.verifyEmail || false}
  login_with_email_allowed = ${realmData.loginWithEmailAllowed || false}
  duplicate_emails_allowed = ${realmData.duplicateEmailsAllowed !== false}
  reset_password_allowed = ${realmData.resetPasswordAllowed !== false}
  edit_username_allowed = ${realmData.editUsernameAllowed || false}
  
  # Session settings
  sso_session_idle_timeout = ${realmData.ssoSessionIdleTimeout || 1800}
  sso_session_max_lifespan = ${realmData.ssoSessionMaxLifespan || 36000}
  offline_session_idle_timeout = ${realmData.offlineSessionIdleTimeout || 2592000}
  offline_session_max_lifespan = ${realmData.offlineSessionMaxLifespan || 5184000}
  offline_session_max_lifespan_enabled = ${realmData.offlineSessionMaxLifespanEnabled || false}
  
  # Token settings
  access_token_lifespan = ${realmData.accessTokenLifespan || 300}
  access_token_lifespan_for_implicit_flow = ${realmData.accessTokenLifespanForImplicitFlow || 900}
  access_code_lifespan = ${realmData.accessCodeLifespan || 60}
  access_code_lifespan_user_action = ${realmData.accessCodeLifespanUserAction || 300}
  access_code_lifespan_login = ${realmData.accessCodeLifespanLogin || 1800}
  action_token_generated_by_admin_lifespan = ${realmData.actionTokenGeneratedByAdminLifespan || 43200}
  action_token_generated_by_user_lifespan = ${realmData.actionTokenGeneratedByUserLifespan || 300}
  
  # Security settings
  ssl_required = "${realmData.sslRequired || 'external'}"
  brute_force_protected = ${realmData.bruteForceProtected || false}
  permanent_lockout = ${realmData.permanentLockout || false}
  max_failure_wait_seconds = ${realmData.maxFailureWaitSeconds || 900}
  minimum_quick_login_wait_seconds = ${realmData.minimumQuickLoginWaitSeconds || 60}
  wait_increment_seconds = ${realmData.waitIncrementSeconds || 60}
  quick_login_check_millis = ${realmData.quickLoginCheckMilliSeconds || 1000}
  max_delta_time_seconds = ${realmData.maxDeltaTimeSeconds || 43200}
  failure_factor = ${realmData.failureFactor || 30}
  
  # Token refresh settings
  revoke_refresh_token = ${realmData.revokeRefreshToken || false}
  refresh_token_max_reuse = ${realmData.refreshTokenMaxReuse || 0}
}`;

  return terragruntConfig;
}

function generateGroupsConfig(realmData) {
  if (!realmData.groups || realmData.groups.length === 0) {
    return null;
  }

  const groupsVar = JSON.stringify(realmData.groups, null, 2)
    .replace(/"/g, '\\"')
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');

  return `# Include common configuration
include "root" {
  path = find_in_parent_folders("common.hcl")
}

# Module source
terraform {
  source = "../../../../../../modules/keycloak-groups"
}

# Dependencies - groups depend on realm and roles
dependency "realm" {
  config_path = "../realm"
}

dependency "roles" {
  config_path = "../roles"
}

# Groups configuration
inputs = {
  realm_id = dependency.realm.outputs.realm_id
  realm_roles = dependency.roles.outputs.realm_role_ids
  
  groups = {${realmData.groups.map((group, index) => `
    "${group.name || `group_${index}`}" = {
      name = "${group.name}"
      path = "${group.path || `/${group.name}`}"
      attributes = ${group.attributes ? JSON.stringify(group.attributes) : '{}'}
      realm_roles = ${group.realmRoles ? JSON.stringify(group.realmRoles) : '[]'}
      subGroups = ${group.subGroups ? JSON.stringify(group.subGroups) : '{}'}
    }`).join('')}
  }
}`;
}

function testRealmConversion(filePath) {
  console.log(`\n📁 Testing: ${path.basename(filePath)}`);
  
  try {
    // Read and parse realm file
    const realmData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`   ✅ Parsed realm: ${realmData.realm}`);
    
    // Test realm module generation
    const realmConfig = generateTerragruntConfig(realmData);
    console.log(`   ✅ Generated realm terragrunt.hcl (${realmConfig.length} chars)`);
    
    // Test groups module if present
    if (realmData.groups && realmData.groups.length > 0) {
      const groupsConfig = generateGroupsConfig(realmData);
      console.log(`   ✅ Generated groups terragrunt.hcl for ${realmData.groups.length} groups`);
    } else {
      console.log(`   ⚠️  No groups found in realm`);
    }
    
    // Test components detection
    const components = {
      realm: true,
      groups: realmData.groups?.length > 0,
      users: realmData.users?.length > 0,
      roles: realmData.roles?.realm?.length > 0,
      clients: realmData.clients?.length > 0,
      identityProviders: realmData.identityProviders?.length > 0
    };
    
    console.log(`   📊 Components detected:`, 
      Object.entries(components)
        .filter(([_, exists]) => exists)
        .map(([name]) => name)
        .join(', '));
    
    // Write test output
    const outputDir = `./test-output/${realmData.realm}`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(`${outputDir}/terragrunt.hcl`, realmConfig);
    console.log(`   ✅ Written to: ${outputDir}/terragrunt.hcl`);
    
    if (realmData.groups) {
      const groupsConfig = generateGroupsConfig(realmData);
      if (groupsConfig) {
        fs.writeFileSync(`${outputDir}/groups-terragrunt.hcl`, groupsConfig);
        console.log(`   ✅ Written to: ${outputDir}/groups-terragrunt.hcl`);
      }
    }
    
    return {
      success: true,
      realm: realmData.realm,
      components: Object.keys(components).filter(k => components[k])
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      realm: path.basename(filePath),
      error: error.message
    };
  }
}

// Clean up old test output
if (fs.existsSync('./test-output')) {
  fs.rmSync('./test-output', { recursive: true });
}
fs.mkdirSync('./test-output', { recursive: true });

// Run tests
const results = [];
for (const testFile of testFiles) {
  if (fs.existsSync(testFile)) {
    results.push(testRealmConversion(testFile));
  } else {
    console.log(`\n❌ File not found: ${testFile}`);
    results.push({
      success: false,
      realm: path.basename(testFile),
      error: 'File not found'
    });
  }
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`✅ Successful conversions: ${successful.length}`);
console.log(`❌ Failed conversions: ${failed.length}`);

if (successful.length > 0) {
  console.log('\n✅ Successfully converted realms:');
  successful.forEach(result => {
    console.log(`   - ${result.realm} (${result.components.length} components)`);
  });
}

if (failed.length > 0) {
  console.log('\n❌ Failed conversions:');
  failed.forEach(result => {
    console.log(`   - ${result.realm}: ${result.error}`);
  });
}

console.log(`\n🎯 Overall success rate: ${Math.round(successful.length / results.length * 100)}%`);

// Test Terragrunt validation if available
console.log('\n🔧 Testing Terragrunt validation...');
try {
  const { execSync } = require('child_process');
  
  // Check if terragrunt is available
  execSync('which terragrunt', { stdio: 'ignore' });
  console.log('   ✅ Terragrunt CLI available');
  
  // Test one of the generated configs
  if (successful.length > 0) {
    const testRealm = successful[0].realm;
    console.log(`   🧪 Validating generated config for: ${testRealm}`);
    
    // This would validate the generated terragrunt.hcl
    // execSync(`cd test-output/${testRealm} && terragrunt validate`, { stdio: 'inherit' });
    console.log('   ⚠️  Terragrunt validation skipped (requires full module setup)');
  }
  
} catch (error) {
  console.log('   ⚠️  Terragrunt CLI not available - skipping validation');
}

console.log('\n🎉 Testing completed!');
console.log(`📁 Generated files available in: ./test-output/`);