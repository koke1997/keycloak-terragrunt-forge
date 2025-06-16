#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Terraform Validation Test');
console.log('============================');

async function validateTerraform() {
    const testDir = './terraform-test-output/keycloak/realms/groups-test-realm';

    console.log(`📁 Validating Terraform files in: ${testDir}`);

    // Check if directory exists
    if (!fs.existsSync(testDir)) {
        console.log('❌ Test directory does not exist');
        return;
    }

    // List all .tf files
    const tfFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.tf'));
    console.log(`📄 Found ${tfFiles.length} .tf files: ${tfFiles.join(', ')}`);

    // Also check subdirectories
    const subdirs = fs.readdirSync(testDir).filter(item => {
        const itemPath = path.join(testDir, item);
        return fs.statSync(itemPath).isDirectory();
    });

    console.log(`📂 Found ${subdirs.length} subdirectories: ${subdirs.join(', ')}`);

    // Check each subdir for .tf files
    for (const subdir of subdirs) {
        const subdirPath = path.join(testDir, subdir);
        const subTfFiles = fs.readdirSync(subdirPath).filter(f => f.endsWith('.tf'));
        console.log(`   ${subdir}/: ${subTfFiles.join(', ')}`);
    }

    // Test terraform commands
    try {
        console.log('\n🔧 Testing terraform version...');
        const { stdout: versionOutput } = await execAsync('terraform version');
        console.log(`✅ Terraform version: ${versionOutput.trim()}`);

        console.log('\n🔧 Testing terraform init...');
        const { stdout: initOutput, stderr: initError } = await execAsync(`cd ${testDir} && terraform init -backend=false`);

        if (initError) {
            console.log('⚠️  Terraform init warnings/errors:');
            console.log(initError);
        }

        console.log('✅ Terraform init output:');
        console.log(initOutput);

        console.log('\n🔧 Testing terraform validate...');
        const { stdout: validateOutput, stderr: validateError } = await execAsync(`cd ${testDir} && terraform validate`);

        if (validateError) {
            console.log('⚠️  Terraform validate warnings/errors:');
            console.log(validateError);
        }

        console.log('✅ Terraform validate output:');
        console.log(validateOutput);

    } catch (error) {
        console.log('❌ Terraform validation failed:');
        console.log('Error:', error.message);
        if (error.stdout) console.log('stdout:', error.stdout);
        if (error.stderr) console.log('stderr:', error.stderr);
    }
}

validateTerraform().catch(console.error);
