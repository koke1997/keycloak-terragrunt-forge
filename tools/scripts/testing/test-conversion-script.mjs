
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
  const fullPath = `${outputDir}/${file.filePath}`;
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, file.content);
});

console.log('✅ Conversion complete! Files saved to:', outputDir);
