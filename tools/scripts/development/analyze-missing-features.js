#!/usr/bin/env node

import fs from 'fs';

// Comprehensive analysis of what's implemented vs tested vs missing
function analyzeTestCoverageGaps() {
    console.log('🔍 COMPREHENSIVE TEST COVERAGE GAP ANALYSIS');
    console.log('=============================================');
    
    // Features implemented in the converter (from keycloakToTerragrunt.ts)
    const implementedGenerators = [
        'realm',
        'roles',
        'groups', 
        'users',
        'clients',
        'clientScopes',
        'protocolMappers',
        'scopeMappings',
        'identityProviders',
        'identityProviderMappers',
        'authenticationFlows',
        'userFederation',
        'requiredActions',
        'realmEvents',
        'clientPolicies'
    ];
    
    // Check what complex features exist in test files
    const testFiles = [
        'test-samples/docker-realm.json',
        'test-samples/api-key-realm.json', 
        'test-samples/another_test.json',
        'test-samples/example-realm.json',
        'test-samples/groups-test-realm.json'
    ];
    
    const featureAnalysis = {};
    
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const content = JSON.parse(fs.readFileSync(file, 'utf8'));
                const fileName = file.split('/').pop();
                
                featureAnalysis[fileName] = {
                    // Core features
                    realm: content.realm || null,
                    users: Array.isArray(content.users) ? content.users.length : 0,
                    roles: {
                        realm: Array.isArray(content.roles?.realm) ? content.roles.realm.length : 0,
                        client: content.roles?.client ? Object.keys(content.roles.client).length : 0
                    },
                    clients: Array.isArray(content.clients) ? content.clients.length : 0,
                    groups: Array.isArray(content.groups) ? content.groups.length : 0,
                    
                    // Complex features
                    clientScopes: Array.isArray(content.clientScopes) ? content.clientScopes.length : 0,
                    identityProviders: Array.isArray(content.identityProviders) ? content.identityProviders.length : 0,
                    authenticationFlows: Array.isArray(content.authenticationFlows) ? content.authenticationFlows.length : 0,
                    components: content.components ? Object.keys(content.components).length : 0,
                    requiredActions: Array.isArray(content.requiredActions) ? content.requiredActions.length : 0,
                    scopeMappings: Array.isArray(content.scopeMappings) ? content.scopeMappings.length : 0,
                    
                    // Advanced features  
                    protocolMappers: checkProtocolMappers(content),
                    eventsEnabled: content.eventsEnabled || false,
                    adminEventsEnabled: content.adminEventsEnabled || false,
                    clientPolicies: content.clientPolicies ? Object.keys(content.clientPolicies).length : 0,
                    clientProfiles: content.clientProfiles ? Object.keys(content.clientProfiles).length : 0,
                    smtpServer: !!content.smtpServer,
                    
                    // Federation
                    userFederation: checkUserFederation(content.components),
                    
                    // Other complex features
                    browserSecurityHeaders: !!content.browserSecurityHeaders,
                    internationalization: content.internationalizationEnabled || false,
                    supportedLocales: Array.isArray(content.supportedLocales) ? content.supportedLocales.length : 0
                };
            } catch (error) {
                console.log(`❌ Error parsing ${file}: ${error.message}`);
            }
        }
    });
    
    // Print detailed analysis
    console.log('\n📊 FEATURE PRESENCE IN TEST FILES:');
    console.log('===================================');
    
    Object.entries(featureAnalysis).forEach(([file, features]) => {
        console.log(`\n📄 ${file}:`);
        console.log(`   Basic: realm(${features.realm}), users(${features.users}), clients(${features.clients}), groups(${features.groups})`);
        console.log(`   Roles: realm(${features.roles.realm}), client(${features.roles.client})`);
        console.log(`   Complex: clientScopes(${features.clientScopes}), authFlows(${features.authenticationFlows}), idps(${features.identityProviders})`);
        console.log(`   Advanced: components(${features.components}), protocolMappers(${features.protocolMappers}), events(${features.eventsEnabled})`);
        console.log(`   Federation: userFed(${features.userFederation}), smtp(${features.smtpServer}), i18n(${features.internationalization})`);
    });
    
    // Identify missing test coverage
    console.log('\n🎯 CRITICAL TEST COVERAGE GAPS:');
    console.log('================================');
    
    console.log('\n1. ❌ ZERO COVERAGE (No Test Data):');
    const zeroCoverageFeatures = [];
    
    Object.keys(featureAnalysis).forEach(file => {
        const features = featureAnalysis[file];
        if (features.identityProviders === 0) zeroCoverageFeatures.push('identityProviders');
        if (features.userFederation === 0) zeroCoverageFeatures.push('userFederation'); 
        if (features.requiredActions === 0) zeroCoverageFeatures.push('requiredActions');
        if (features.scopeMappings === 0) zeroCoverageFeatures.push('scopeMappings');
        if (!features.smtpServer) zeroCoverageFeatures.push('smtpServer');
        if (features.clientPolicies === 0) zeroCoverageFeatures.push('clientPolicies');
        if (features.supportedLocales === 0) zeroCoverageFeatures.push('internationalization');
    });
    
    const uniqueZeroCoverage = [...new Set(zeroCoverageFeatures)];
    uniqueZeroCoverage.forEach(feature => {
        console.log(`   • ${feature}: No test files contain this feature`);
    });
    
    console.log('\n2. ⚠️  PARTIAL COVERAGE (Some Data, Needs More):');
    
    // Identity Providers
    const idpCounts = Object.values(featureAnalysis).map(f => f.identityProviders);
    const maxIdps = Math.max(...idpCounts);
    if (maxIdps > 0 && maxIdps < 3) {
        console.log(`   • Identity Providers: Max ${maxIdps} found - need SAML, OIDC, social providers`);
    }
    
    // Protocol Mappers
    const protocolMapperCounts = Object.values(featureAnalysis).map(f => f.protocolMappers);
    const maxMappers = Math.max(...protocolMapperCounts);
    console.log(`   • Protocol Mappers: Max ${maxMappers} found - need user attributes, groups, audience mappers`);
    
    // Authentication Flows  
    const authFlowCounts = Object.values(featureAnalysis).map(f => f.authenticationFlows);
    const maxFlows = Math.max(...authFlowCounts);
    console.log(`   • Authentication Flows: Max ${maxFlows} found - need custom flows, conditional flows`);
    
    console.log('\n3. 🔴 MISSING COMPLEX SCENARIOS:');
    console.log('   • Multi-IdP configurations (SAML + OIDC + Social)');
    console.log('   • Complex authentication flows with conditions');
    console.log('   • User federation with both LDAP and Kerberos');
    console.log('   • Advanced protocol mappers (groups, roles, custom attributes)');
    console.log('   • Client policies with multiple conditions');
    console.log('   • Scope mappings between clients and roles');
    console.log('   • Required actions with custom configurations');
    console.log('   • Event configurations with external listeners');
    console.log('   • SMTP and email template configurations');
    console.log('   • Internationalization with multiple locales');
    
    console.log('\n4. 🚨 DEPLOYMENT TESTING GAPS:');
    console.log('   • No actual Terraform deployment tests');
    console.log('   • No round-trip validation (JSON → Terraform → Keycloak → Export)');
    console.log('   • No integration with real Keycloak instances');
    console.log('   • No validation of generated Terraform syntax');
    console.log('   • No testing with different Keycloak versions');
    
    // Generate recommendations
    console.log('\n🎯 RECOMMENDATIONS FOR 100% COVERAGE:');
    console.log('=====================================');
    
    console.log('\n1. CREATE COMPREHENSIVE TEST REALMS:');
    console.log('   • Create identity-providers-test-realm.json with SAML, OIDC, GitHub, Google');
    console.log('   • Create user-federation-test-realm.json with LDAP and Kerberos');
    console.log('   • Create protocol-mappers-test-realm.json with all mapper types');
    console.log('   • Create client-policies-test-realm.json with complex policies');
    console.log('   • Create internationalization-test-realm.json with multiple locales');
    console.log('   • Create events-test-realm.json with external event listeners');
    
    console.log('\n2. ADD INTEGRATION TESTS:');
    console.log('   • Deploy generated Terraform with terraform apply');
    console.log('   • Export realm from deployed Keycloak instance');  
    console.log('   • Compare original vs exported realm configurations');
    console.log('   • Test with multiple Keycloak versions (20.x, 21.x, 22.x, 23.x)');
    
    console.log('\n3. ADD VALIDATION TESTS:');
    console.log('   • terraform validate on all generated files');
    console.log('   • terraform plan to check resource dependencies');
    console.log('   • Check for required provider versions');
    console.log('   • Validate that all variables are properly defined');
    
    return featureAnalysis;
}

function checkProtocolMappers(content) {
    let count = 0;
    
    // Check realm-level protocol mappers
    if (Array.isArray(content.protocolMappers)) {
        count += content.protocolMappers.length;
    }
    
    // Check client protocol mappers
    if (Array.isArray(content.clients)) {
        content.clients.forEach(client => {
            if (Array.isArray(client.protocolMappers)) {
                count += client.protocolMappers.length;
            }
        });
    }
    
    // Check client scope protocol mappers
    if (Array.isArray(content.clientScopes)) {
        content.clientScopes.forEach(scope => {
            if (Array.isArray(scope.protocolMappers)) {
                count += scope.protocolMappers.length;
            }
        });
    }
    
    return count;
}

function checkUserFederation(components) {
    if (!components) return 0;
    
    let count = 0;
    Object.values(components).forEach(providerArray => {
        if (Array.isArray(providerArray)) {
            providerArray.forEach(provider => {
                if (provider.providerId === 'ldap' || provider.providerId === 'kerberos') {
                    count++;
                }
            });
        }
    });
    
    return count;
}

// Run the analysis
analyzeTestCoverageGaps();