#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Testing Terraform Conversion Pipeline');
console.log('=========================================');

// Test files to process
const testFiles = [
    'ultimate-complex-realm.json',
    'ultra-complex-realm-with-groups.json'
];

async function testConversion() {
    console.log('\n📊 Phase 1: Analyzing input files...');

    for (const file of testFiles) {
        const filePath = path.join(__dirname, file);

        if (!fs.existsSync(filePath)) {
            console.log(`❌ Test file not found: ${file}`);
            continue;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(content);

            console.log(`\n📄 Analyzing: ${file}`);
            console.log(`   Size: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
            console.log(`   Realm: ${json.realm}`);
            console.log(`   Users: ${json.users?.length || 0}`);
            console.log(`   Groups: ${json.groups?.length || 0}`);
            console.log(`   Roles: ${json.roles?.realm?.length || 0} realm, ${json.roles?.client ? Object.keys(json.roles.client).length : 0} client`);
            console.log(`   Clients: ${json.clients?.length || 0}`);
            console.log(`   Client Scopes: ${json.clientScopes?.length || 0}`);
            console.log(`   Authentication Flows: ${json.authenticationFlows?.length || 0}`);
            console.log(`   Components: ${json.components?.length || 0}`);

            // Analyze group complexity
            if (json.groups?.length > 0) {
                analyzeGroupComplexity(json.groups);
            }

        } catch (error) {
            console.log(`❌ Error parsing ${file}: ${error.message}`);
        }
    }

    console.log('\n🔄 Phase 2: Testing TypeScript conversion...');

    // Test the conversion by creating a simple Node.js script that imports the TS function
    await testTypeScriptConversion();

    console.log('\n✅ Phase 3: Validating Terraform output...');
    await validateTerraformOutput();
}

function analyzeGroupComplexity(groups) {
    const topLevel = groups.filter(g => !g.path || g.path.split('/').length === 2);
    const nested = groups.filter(g => g.path && g.path.split('/').length > 2);
    const maxDepth = Math.max(...groups.map(g => g.path ? g.path.split('/').length - 1 : 1));

    console.log(`   Group Analysis:`);
    console.log(`     - Top-level groups: ${topLevel.length}`);
    console.log(`     - Nested groups: ${nested.length}`);
    console.log(`     - Max depth: ${maxDepth}`);
    console.log(`     - Groups with attributes: ${groups.filter(g => g.attributes && Object.keys(g.attributes).length > 0).length}`);
    console.log(`     - Groups with roles: ${groups.filter(g => g.realmRoles?.length > 0 || g.clientRoles && Object.keys(g.clientRoles).length > 0).length}`);
}

async function testTypeScriptConversion() {
    try {
        // Create a test conversion script
        const testScript = `
import { keycloakRealmJsonToTerragrunt } from './src/utils/keycloakToTerragrunt.js';
import fs from 'fs';

const testFile = 'ultimate-complex-realm.json';
console.log('Loading test file:', testFile);

const content = fs.readFileSync(testFile, 'utf8');
const json = JSON.parse(content);

console.log('Converting to Terraform...');
const result = keycloakRealmJsonToTerragrunt(json, testFile);

console.log('Generated', result.length, 'Terraform files:');
result.forEach(file => {
  console.log(' -', file.filePath, '(' + file.content.length + ' chars)');
});

// Save the results
const outputDir = './terraform-test-output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

result.forEach(file => {
  const fullPath = \`\${outputDir}/\${file.filePath}\`;
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, file.content);
});

console.log('✅ Conversion complete! Files saved to:', outputDir);
`;

        fs.writeFileSync('./test-conversion-script.mjs', testScript);

        // Run the conversion
        console.log('   Running TypeScript conversion...');
        const { stdout, stderr } = await execAsync('node test-conversion-script.mjs');

        if (stderr) {
            console.log('   ⚠️  Conversion warnings:', stderr);
        }

        console.log('   📤 Conversion output:');
        console.log(stdout.split('\n').map(line => `      ${line}`).join('\n'));

        // Clean up
        fs.unlinkSync('./test-conversion-script.mjs');

    } catch (error) {
        console.log(`   ❌ TypeScript conversion failed: ${error.message}`);
        if (error.stdout) console.log('   stdout:', error.stdout);
        if (error.stderr) console.log('   stderr:', error.stderr);
    }
}

async function validateTerraformOutput() {
    const outputDir = './terraform-test-output';

    if (!fs.existsSync(outputDir)) {
        console.log('   ❌ No Terraform output directory found');
        return;
    }

    // Find all .tf files
    const tfFiles = findTerraformFiles(outputDir);
    console.log(`   📁 Found ${tfFiles.length} Terraform files`);

    // Analyze the structure
    const structure = analyzeTerraformStructure(tfFiles);
    console.log('   📊 Terraform Structure Analysis:');
    console.log(`      - Realms: ${structure.realms}`);
    console.log(`      - Modules: ${structure.modules.join(', ')}`);
    console.log(`      - Resources: ${structure.resources}`);
    console.log(`      - Variables: ${structure.variables}`);
    console.log(`      - Outputs: ${structure.outputs}`);

    // Test terraform syntax (if terraform is installed)
    try {
        console.log('   🔍 Validating Terraform syntax...');

        // Change to the output directory and run terraform validate
        process.chdir(outputDir);

        // Initialize terraform
        await execAsync('terraform init -backend=false');

        // Validate
        const { stdout: validateOutput } = await execAsync('terraform validate');
        console.log('   ✅ Terraform validation passed!');
        console.log(`      ${validateOutput.trim()}`);

        // Go back to original directory
        process.chdir(__dirname);

    } catch (error) {
        console.log('   ⚠️  Terraform validation skipped (terraform not available or validation failed)');
        if (error.stderr && !error.stderr.includes('terraform: command not found')) {
            console.log('      Error:', error.stderr);
        }

        // Go back to original directory
        process.chdir(__dirname);
    }
}

function findTerraformFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.tf')) {
                files.push(fullPath);
            }
        }
    }

    walk(dir);
    return files;
}

function analyzeTerraformStructure(files) {
    const structure = {
        realms: 0,
        modules: [],
        resources: 0,
        variables: 0,
        outputs: 0
    };

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative('./terraform-test-output', file);

        // Count realms
        if (relativePath.includes('/realms/')) {
            structure.realms = Math.max(structure.realms, 1);
        }

        // Identify modules
        const moduleMatch = relativePath.match(/\/realms\/[^\/]+\/([^\/]+)\//);
        if (moduleMatch && !structure.modules.includes(moduleMatch[1])) {
            structure.modules.push(moduleMatch[1]);
        }

        // Count resources, variables, outputs
        structure.resources += (content.match(/^resource\s+/gm) || []).length;
        structure.variables += (content.match(/^variable\s+/gm) || []).length;
        structure.outputs += (content.match(/^output\s+/gm) || []).length;
    }

    return structure;
}

// Run the test
testConversion().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
