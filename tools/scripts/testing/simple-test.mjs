#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Simple Conversion Test');
console.log('========================');

// Check if our test files exist
const testFiles = [
    'ultimate-complex-realm.json',
    'ultra-complex-realm-with-groups.json'
];

console.log('📊 Checking test files...');

for (const file of testFiles) {
    try {
        const stats = fs.statSync(file);
        const content = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(content);

        console.log(`✅ ${file}:`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
        console.log(`   Realm: ${json.realm}`);
        console.log(`   Groups: ${json.groups?.length || 0}`);
        console.log(`   Users: ${json.users?.length || 0}`);
        console.log(`   Clients: ${json.clients?.length || 0}`);

    } catch (error) {
        console.log(`❌ ${file}: ${error.message}`);
    }
}

console.log('\n🚀 Files are ready for conversion testing!');
