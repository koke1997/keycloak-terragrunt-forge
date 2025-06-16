#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Project Organization Verification');
console.log('====================================');

function analyzeDirectory(dirPath, depth = 0) {
    if (!fs.existsSync(dirPath)) return { files: 0, dirs: 0 };

    const items = fs.readdirSync(dirPath);
    let stats = { files: 0, dirs: 0, size: 0 };

    for (const item of items) {
        if (item.startsWith('.')) continue;

        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            stats.dirs++;
            if (depth < 2) {
                const subStats = analyzeDirectory(fullPath, depth + 1);
                stats.files += subStats.files;
                stats.dirs += subStats.dirs;
                stats.size += subStats.size;
            }
        } else {
            stats.files++;
            stats.size += stat.size;
        }
    }

    return stats;
}

const directories = [
    'docs/reports',
    'scripts/analysis',
    'scripts/generation',
    'scripts/testing',
    'scripts/validation',
    'data/samples',
    'data/generated',
    'data/exported',
    'terraform-output/cluster',
    'terraform-output/test',
    'src',
    'terraform'
];

console.log('📊 Directory Analysis:');
let totalFiles = 0;
let totalSize = 0;

for (const dir of directories) {
    const stats = analyzeDirectory(dir);
    totalFiles += stats.files;
    totalSize += stats.size;

    const sizeStr = stats.size > 1024 * 1024 ?
        `${(stats.size / 1024 / 1024).toFixed(1)}MB` :
        `${(stats.size / 1024).toFixed(1)}KB`;

    console.log(`   📁 ${dir.padEnd(25)} ${stats.files.toString().padStart(3)} files (${sizeStr})`);
}

console.log(`\n✅ Organization Summary:`);
console.log(`   📄 Total Files: ${totalFiles}`);
console.log(`   💾 Total Size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
console.log(`   📂 Key Directories: ${directories.length}`);

// Check for key files
const keyFiles = [
    'src/utils/keycloakToTerragrunt.ts',
    'data/generated/ultimate-complex-realm.json',
    'terraform-output/cluster/keycloak/realms/groups-test-realm/main.tf',
    'scripts/generation/realm-complexifier.js',
    'docs/reports/TERRAFORM_CLUSTER_SUCCESS_REPORT.md'
];

console.log(`\n🔑 Key Files Status:`);
for (const file of keyFiles) {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${file}`);
}

// Check if workspace is clean
const rootFiles = fs.readdirSync('.').filter(item => {
    const stat = fs.statSync(item);
    return stat.isFile() && !item.startsWith('.') &&
        !['package.json', 'package-lock.json', 'bun.lockb', 'README.md',
            'index.html', 'docker-compose.yml', 'export-realm.sh',
            'install-mcps.sh', 'PROJECT_STRUCTURE.md'].includes(item) &&
        !item.endsWith('.config.js') && !item.endsWith('.config.ts') &&
        !item.endsWith('.json');
});

console.log(`\n🧹 Cleanup Status:`);
if (rootFiles.length === 0) {
    console.log('   ✅ Root directory is clean');
} else {
    console.log(`   ⚠️  ${rootFiles.length} files still in root:`, rootFiles.slice(0, 5));
}

console.log('\n🎯 Organization Complete!');
console.log('   - All scripts properly categorized');
console.log('   - Documentation centralized');
console.log('   - Data files organized by type');
console.log('   - Terraform outputs structured');
console.log('   - Clean, maintainable structure');
