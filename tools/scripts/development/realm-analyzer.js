#!/usr/bin/env node

/**
 * Realm Statistics Analyzer
 *
 * This script analyzes a generated complex realm JSON file and provides
 * detailed statistics about its structure and contents.
 */

import fs from 'fs';

function analyzeRealm(filePath) {
    console.log(`🔍 Analyzing realm file: ${filePath}`);

    try {
        const realmData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log('\n📊 REALM STATISTICS');
        console.log('='.repeat(50));
        console.log(`Realm Name: ${realmData.realm}`);
        console.log(`Display Name: ${realmData.displayName}`);
        console.log(`File Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);

        // Users analysis
        const users = realmData.users || [];
        console.log(`\n👥 USERS (${users.length})`);
        console.log('-'.repeat(30));

        const usersWithGroups = users.filter(u => u.groups && u.groups.length > 0);
        const usersWithRoles = users.filter(u => u.realmRoles && u.realmRoles.length > 0);
        const usersWithCredentials = users.filter(u => u.credentials && u.credentials.length > 0);

        console.log(`Users with Group Assignments: ${usersWithGroups.length}`);
        console.log(`Users with Role Mappings: ${usersWithRoles.length}`);
        console.log(`Users with Credentials: ${usersWithCredentials.length}`);

        if (users.length > 0) {
            const sampleUser = users[0];
            console.log(`\nSample User: ${sampleUser.username}`);
            console.log(`  Department: ${sampleUser.attributes?.department?.[0] || 'N/A'}`);
            console.log(`  Company: ${sampleUser.attributes?.company?.[0] || 'N/A'}`);
            console.log(`  Groups: ${sampleUser.groups?.length || 0}`);
            console.log(`  Realm Roles: ${sampleUser.realmRoles?.length || 0}`);
        }

        // Groups analysis
        const groups = realmData.groups || [];
        console.log(`\n🏢 GROUPS (${countAllGroups(groups)})`);
        console.log('-'.repeat(30));

        console.log(`Root Groups: ${groups.length}`);

        let maxDepth = 0;
        let totalAttributes = 0;
        let groupsWithRoles = 0;

        function analyzeGroupHierarchy(groupList, depth = 0) {
            maxDepth = Math.max(maxDepth, depth);

            for (const group of groupList) {
                if (group.attributes) {
                    totalAttributes += Object.keys(group.attributes).length;
                }
                if (group.realmRoles && group.realmRoles.length > 0) {
                    groupsWithRoles++;
                }

                if (group.subGroups && group.subGroups.length > 0) {
                    analyzeGroupHierarchy(group.subGroups, depth + 1);
                }
            }
        }

        analyzeGroupHierarchy(groups);

        console.log(`Maximum Depth: ${maxDepth}`);
        console.log(`Groups with Role Mappings: ${groupsWithRoles}`);
        console.log(`Total Group Attributes: ${totalAttributes}`);

        if (groups.length > 0) {
            console.log(`\nSample Group Hierarchy:`);
            printGroupHierarchy(groups.slice(0, 2), 0, 3);
        }

        // Roles analysis
        const realmRoles = realmData.roles?.realm || [];
        console.log(`\n🔐 ROLES (${realmRoles.length})`);
        console.log('-'.repeat(30));

        const compositeRoles = realmRoles.filter(r => r.composite);
        const rolesWithAttributes = realmRoles.filter(r => r.attributes);

        console.log(`Composite Roles: ${compositeRoles.length}`);
        console.log(`Roles with Attributes: ${rolesWithAttributes.length}`);

        // Clients analysis
        const clients = realmData.clients || [];
        console.log(`\n🔗 CLIENTS (${clients.length})`);
        console.log('-'.repeat(30));

        const clientsWithMappers = clients.filter(c => c.protocolMappers && c.protocolMappers.length > 0);
        const serviceAccountClients = clients.filter(c => c.serviceAccountsEnabled);

        console.log(`Clients with Protocol Mappers: ${clientsWithMappers.length}`);
        console.log(`Service Account Enabled: ${serviceAccountClients.length}`);

        // Identity Providers analysis
        const identityProviders = realmData.identityProviders || [];
        console.log(`\n🆔 IDENTITY PROVIDERS (${identityProviders.length})`);
        console.log('-'.repeat(30));

        const providerTypes = [...new Set(identityProviders.map(p => p.providerId))];
        console.log(`Provider Types: ${providerTypes.join(', ')}`);

        // Authentication Flows analysis
        const authFlows = realmData.authenticationFlows || [];
        console.log(`\n🔄 AUTHENTICATION FLOWS (${authFlows.length})`);
        console.log('-'.repeat(30));

        const customFlows = authFlows.filter(f => !f.builtIn);
        console.log(`Custom Flows: ${customFlows.length}`);

        console.log('\n✅ Analysis completed!');

    } catch (error) {
        console.error(`❌ Error analyzing realm: ${error.message}`);
    }
}

function countAllGroups(groups) {
    let count = groups.length;
    for (const group of groups) {
        if (group.subGroups) {
            count += countAllGroups(group.subGroups);
        }
    }
    return count;
}

function printGroupHierarchy(groups, depth, maxDepth) {
    if (depth >= maxDepth) return;

    for (const group of groups) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}├─ ${group.name} (${group.path})`);

        if (group.attributes) {
            const attrKeys = Object.keys(group.attributes);
            if (attrKeys.length > 0) {
                console.log(`${indent}   📋 Attributes: ${attrKeys.slice(0, 3).join(', ')}${attrKeys.length > 3 ? '...' : ''}`);
            }
        }

        if (group.realmRoles && group.realmRoles.length > 0) {
            console.log(`${indent}   🔐 Roles: ${group.realmRoles.slice(0, 3).join(', ')}${group.realmRoles.length > 3 ? '...' : ''}`);
        }

        if (group.subGroups && group.subGroups.length > 0 && depth < maxDepth - 1) {
            printGroupHierarchy(group.subGroups.slice(0, 2), depth + 1, maxDepth);
        }
    }
}

// Main execution
if (process.argv.length < 3) {
    console.log('Usage: node realm-analyzer.js <realm-file.json>');
    process.exit(1);
}

const realmFile = process.argv[2];
if (!fs.existsSync(realmFile)) {
    console.error(`File not found: ${realmFile}`);
    process.exit(1);
}

analyzeRealm(realmFile);
