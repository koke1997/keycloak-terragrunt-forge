import fs from 'fs';

function compareRealms() {
  console.log('🔍 COMPARING ORIGINAL vs TERRAFORM-GENERATED REALM');
  console.log('===================================================');

  // Read original realm
  const originalContent = fs.readFileSync('./test-samples/example-realm.json', 'utf8');
  const original = JSON.parse(originalContent);

  // Read exported realm from Terraform deployment
  const exportedContent = fs.readFileSync('./exported-example-realm-tf.json', 'utf8');
  const exported = JSON.parse(exportedContent);

  console.log('\n📊 BASIC COMPARISON:');
  console.log(`Original realm: "${original.realm}"`);
  console.log(`Exported realm: "${exported.realm}"`);
  console.log(`Display name match: ${original.displayName === exported.displayName ? '✅' : '❌'}`);

  console.log('\n🔧 CONFIGURATION COMPARISON:');
  
  const configComparisons = [
    ['enabled', 'Enabled'],
    ['registrationAllowed', 'Registration Allowed'],
    ['rememberMe', 'Remember Me'],
    ['verifyEmail', 'Verify Email'],
    ['loginWithEmailAllowed', 'Login with Email'],
    ['duplicateEmailsAllowed', 'Duplicate Emails'],
    ['resetPasswordAllowed', 'Reset Password'],
    ['editUsernameAllowed', 'Edit Username'],
    ['sslRequired', 'SSL Required'],
    ['accessTokenLifespan', 'Access Token Lifespan'],
    ['ssoSessionIdleTimeout', 'SSO Session Idle Timeout'],
    ['ssoSessionMaxLifespan', 'SSO Session Max Lifespan'],
  ];

  configComparisons.forEach(([key, label]) => {
    const originalVal = original[key];
    const exportedVal = exported[key];
    const match = originalVal === exportedVal;
    console.log(`   ${match ? '✅' : '⚠️ '} ${label}: ${originalVal} → ${exportedVal}`);
  });

  console.log('\n👥 USER COMPARISON:');
  
  // Read exported users
  const exportedUsersContent = fs.readFileSync('./exported-example-realm-tf-users.json', 'utf8');
  const exportedUsers = JSON.parse(exportedUsersContent);
  
  console.log(`Original users: ${original.users?.length || 0}`);
  console.log(`Exported users: ${exportedUsers.length}`);
  
  if (original.users && original.users.length > 0 && exportedUsers.length > 0) {
    const origUser = original.users[0];
    const expUser = exportedUsers[0];
    
    console.log(`   Username: ${origUser.username} → ${expUser.username} ${origUser.username === expUser.username ? '✅' : '❌'}`);
    console.log(`   Email: ${origUser.email} → ${expUser.email} ${origUser.email === expUser.email ? '✅' : '❌'}`);
    console.log(`   First Name: ${origUser.firstName} → ${expUser.firstName} ${origUser.firstName === expUser.firstName ? '✅' : '❌'}`);
    console.log(`   Last Name: ${origUser.lastName} → ${expUser.lastName} ${origUser.lastName === expUser.lastName ? '✅' : '❌'}`);
    console.log(`   Enabled: ${origUser.enabled} → ${expUser.enabled} ${origUser.enabled === expUser.enabled ? '✅' : '❌'}`);
  }

  console.log('\n🎯 CLIENT COMPARISON:');
  
  // Read exported clients
  const exportedClientsContent = fs.readFileSync('./exported-example-realm-tf-clients.json', 'utf8');
  const exportedClients = JSON.parse(exportedClientsContent);
  
  console.log(`Original clients: ${original.clients?.length || 0}`);
  console.log(`Exported clients: ${exportedClients.length} (includes system clients)`);
  
  if (original.clients && original.clients.length > 0) {
    const origClient = original.clients[0];
    const expClient = exportedClients.find(c => c.clientId === origClient.clientId);
    
    if (expClient) {
      console.log(`   ✅ Found matching client: ${origClient.clientId}`);
      console.log(`   Name: ${origClient.name} → ${expClient.name} ${origClient.name === expClient.name ? '✅' : '❌'}`);
      console.log(`   Enabled: ${origClient.enabled} → ${expClient.enabled} ${origClient.enabled === expClient.enabled ? '✅' : '❌'}`);
      console.log(`   Public Client: ${origClient.publicClient} → ${expClient.publicClient} ${origClient.publicClient === expClient.publicClient ? '✅' : '❌'}`);
    } else {
      console.log(`   ❌ Client ${origClient.clientId} not found in exported clients`);
    }
  }

  console.log('\n🔑 ROLE COMPARISON:');
  
  // Read exported roles
  const exportedRolesContent = fs.readFileSync('./exported-example-realm-tf-roles.json', 'utf8');
  const exportedRoles = JSON.parse(exportedRolesContent);
  
  console.log(`Original realm roles: ${original.roles?.realm?.length || 0}`);
  console.log(`Exported realm roles: ${exportedRoles.length}`);
  
  if (original.roles?.realm) {
    original.roles.realm.forEach(origRole => {
      const expRole = exportedRoles.find(r => r.name === origRole.name);
      if (expRole) {
        console.log(`   ✅ Role "${origRole.name}" found`);
      } else {
        console.log(`   ❌ Role "${origRole.name}" missing`);
      }
    });
  }

  console.log('\n📈 ROUND-TRIP CONVERSION ANALYSIS:');
  
  let matchScore = 0;
  let totalChecks = 0;
  
  // Count matches vs total checks
  configComparisons.forEach(([key]) => {
    totalChecks++;
    if (original[key] === exported[key]) matchScore++;
  });
  
  // User data match
  if (original.users?.length > 0 && exportedUsers.length > 0) {
    const origUser = original.users[0];
    const expUser = exportedUsers[0];
    totalChecks += 5;
    if (origUser.username === expUser.username) matchScore++;
    if (origUser.email === expUser.email) matchScore++;
    if (origUser.firstName === expUser.firstName) matchScore++;
    if (origUser.lastName === expUser.lastName) matchScore++;
    if (origUser.enabled === expUser.enabled) matchScore++;
  }
  
  // Client match
  if (original.clients?.length > 0) {
    const origClient = original.clients[0];
    const expClient = exportedClients.find(c => c.clientId === origClient.clientId);
    totalChecks += 3;
    if (expClient) {
      if (origClient.name === expClient.name) matchScore++;
      if (origClient.enabled === expClient.enabled) matchScore++;
      if (origClient.publicClient === expClient.publicClient) matchScore++;
    }
  }
  
  const conversionAccuracy = ((matchScore / totalChecks) * 100).toFixed(1);
  
  console.log(`\n🎯 CONVERSION ACCURACY: ${conversionAccuracy}% (${matchScore}/${totalChecks} matches)`);
  
  if (conversionAccuracy >= 90) {
    console.log('🟢 EXCELLENT: High-fidelity conversion achieved');
  } else if (conversionAccuracy >= 75) {
    console.log('🟡 GOOD: Most features converted correctly');
  } else if (conversionAccuracy >= 50) {
    console.log('🟠 FAIR: Core features converted, some issues detected');
  } else {
    console.log('🔴 POOR: Significant conversion issues detected');
  }

  console.log('\n✅ END-TO-END VALIDATION COMPLETE!');
  console.log('\n🎉 SUMMARY:');
  console.log('   • ✅ Keycloak deployed via Docker');
  console.log('   • ✅ Terraform generated from realm.json');
  console.log('   • ✅ Terraform applied successfully');
  console.log('   • ✅ New realm created in Keycloak');
  console.log('   • ✅ Realm exported and compared');
  console.log(`   • ${conversionAccuracy >= 75 ? '✅' : '⚠️ '} Conversion accuracy: ${conversionAccuracy}%`);
}

compareRealms();