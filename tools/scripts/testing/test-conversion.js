#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Import the conversion function (we'll need to adapt this for Node.js)
// For now, we'll simulate the conversion by reading the files and showing stats

console.log('🧪 Testing Keycloak to Terraform Conversion');
console.log('===============================================');

const testDir = './test-samples';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} test files:`);

files.forEach((file, index) => {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    const json = JSON.parse(content);
    
    console.log(`\n📄 File ${index + 1}: ${file}`);
    console.log(`   Size: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
    console.log(`   Realm: ${json.realm || 'Not specified'}`);
    console.log(`   Users: ${json.users?.length || 0}`);
    console.log(`   Groups: ${json.groups?.length || 0}`);
    console.log(`   Roles: ${json.roles?.realm?.length || 0} realm roles, ${json.roles?.client ? Object.keys(json.roles.client).length : 0} client roles`);
    console.log(`   Clients: ${json.clients?.length || 0}`);
    console.log(`   Client Scopes: ${json.clientScopes?.length || 0}`);
    console.log(`   Identity Providers: ${json.identityProviders?.length || 0}`);
    console.log(`   Authentication Flows: ${json.authenticationFlows?.length || 0}`);
    console.log(`   Components: ${json.components?.length || 0}`);
    
    // Analyze complexity
    const complexity = calculateComplexity(json);
    console.log(`   Complexity Score: ${complexity}/100 (${complexity < 30 ? 'Simple' : complexity < 70 ? 'Moderate' : 'Complex'})`);
    
  } catch (error) {
    console.log(`\n❌ Error parsing ${file}: ${error.message}`);
  }
});

function calculateComplexity(json) {
  let score = 0;
  
  // Base realm configuration
  score += 10;
  
  // Users and groups
  score += Math.min((json.users?.length || 0) * 2, 20);
  score += Math.min((json.groups?.length || 0) * 3, 15);
  
  // Roles
  score += Math.min((json.roles?.realm?.length || 0) * 2, 15);
  if (json.roles?.client) {
    score += Math.min(Object.keys(json.roles.client).length * 3, 15);
  }
  
  // Clients and scopes
  score += Math.min((json.clients?.length || 0) * 5, 25);
  score += Math.min((json.clientScopes?.length || 0) * 3, 15);
  
  // Advanced features
  score += Math.min((json.identityProviders?.length || 0) * 8, 20);
  score += Math.min((json.authenticationFlows?.length || 0) * 4, 20);
  score += Math.min((json.components?.length || 0) * 2, 10);
  
  return Math.min(score, 100);
}

console.log('\n🚀 Test files analysis complete!');
console.log('\nNext steps:');
console.log('1. Upload these files to the web interface at http://localhost:8080/');
console.log('2. Test the conversion and download generated Terraform modules');
console.log('3. Validate the generated Terraform syntax');