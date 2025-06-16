#!/usr/bin/env node

/**
 * Quick Realm Statistics Generator
 *
 * This utility quickly generates complex realms and shows statistics
 */

import fs from 'fs';
import { RealmComplexifier } from './realm-complexifier.js';

// Ultra complex configuration
const ULTRA_CONFIG = {
    users: {
        count: 100,
        generateCredentials: true,
        generateAttributes: true,
        generateFederatedIdentities: true
    },
    groups: {
        count: 30,
        maxDepth: 6,
        generateAttributes: true,
        generateSubGroups: true
    },
    roles: {
        realmRoles: 50,
        clientRoles: 40,
        generateComposites: true
    },
    clients: {
        count: 20,
        generateScopes: true,
        generateMappers: true,
        generateClientRoles: true
    },
    identityProviders: {
        count: 12,
        types: ["oidc", "saml", "github", "google", "facebook", "linkedin", "microsoft", "apple", "twitter", "discord", "reddit", "stackoverflow"]
    },
    authenticationFlows: {
        count: 15,
        generateCustomExecutors: true
    },
    features: {
        addBruteForceProtection: true,
        addPasswordPolicy: true,
        addOtpPolicy: true,
        addWebAuthnPolicy: true,
        addClientPolicies: true,
        addEvents: true,
        addInternationalization: true
    }
};

function generateUltraComplexRealm(inputFile, outputFile) {
    console.log('🎯 Generating ULTRA COMPLEX Keycloak Realm...');

    const inputRealm = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const complexifier = new RealmComplexifier(ULTRA_CONFIG);
    const complexRealm = complexifier.complexifyRealm(inputRealm);

    fs.writeFileSync(outputFile, JSON.stringify(complexRealm, null, 2));

    const stats = fs.statSync(outputFile);
    console.log(`\n🏆 ULTRA COMPLEX REALM GENERATED!`);
    console.log(`📄 File: ${outputFile}`);
    console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📝 Lines: ${fs.readFileSync(outputFile, 'utf8').split('\n').length}`);

    return complexRealm;
}

// Generate ultra complex realm from existing sample
const inputFile = 'test-samples/groups-test-realm.json';
const outputFile = 'ultra-mega-complex-enterprise-realm.json';

generateUltraComplexRealm(inputFile, outputFile);
