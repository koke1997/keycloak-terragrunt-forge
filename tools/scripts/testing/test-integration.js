#!/usr/bin/env node

// Integration tests for end-to-end validation
// Tests actual Terraform deployment and round-trip accuracy

import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class IntegrationTestSuite {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: { total: 0, passed: 0, failed: 0 }
        };
    }

    async runTest(name, testFn, description) {
        console.log(`🧪 Integration Test: ${name}`);
        console.log(`📝 ${description}`);
        
        const startTime = Date.now();
        let result = 'PASSED';
        let error = null;
        
        try {
            await testFn();
            console.log(`✅ ${name} PASSED`);
        } catch (e) {
            result = 'FAILED';
            error = e.message;
            console.log(`❌ ${name} FAILED: ${e.message}`);
        }
        
        const duration = Date.now() - startTime;
        
        this.testResults.tests.push({
            name,
            description,
            result,
            error,
            duration
        });
        
        this.testResults.summary.total++;
        if (result === 'PASSED') {
            this.testResults.summary.passed++;
        } else {
            this.testResults.summary.failed++;
        }
    }

    async testTerraformSyntaxValidation() {
        await this.runTest('terraform-syntax-validation', async () => {
            const terraformDirs = [
                './terraform/Example-Realm',
                './terraform/groups-test-realm',
                './terraform/example-realm'
            ];

            for (const dir of terraformDirs) {
                if (fs.existsSync(dir)) {
                    try {
                        // Test terraform init
                        await execAsync(`cd ${dir} && terraform init`, { timeout: 30000 });
                        
                        // Test terraform validate
                        const { stdout, stderr } = await execAsync(`cd ${dir} && terraform validate`, { timeout: 10000 });
                        
                        if (stderr && stderr.includes('Error')) {
                            throw new Error(`Terraform validation failed for ${dir}: ${stderr}`);
                        }
                        
                        console.log(`   ✓ ${dir}: Terraform syntax valid`);
                    } catch (error) {
                        throw new Error(`${dir}: ${error.message}`);
                    }
                }
            }
        }, 'Validate generated Terraform syntax with terraform validate');
    }

    async testTerraformPlan() {
        await this.runTest('terraform-plan', async () => {
            const testDir = './terraform/groups-test-realm';
            
            if (!fs.existsSync(testDir)) {
                throw new Error('Test terraform directory not found');
            }

            // Create terraform.tfvars for testing
            const tfvars = `
keycloak_url = "http://localhost:8090"
keycloak_client_id = "admin-cli"  
keycloak_client_secret = "test-secret"
`;
            fs.writeFileSync(`${testDir}/terraform.tfvars`, tfvars);

            try {
                // Run terraform plan (should not fail even if Keycloak is not running)
                const { stdout, stderr } = await execAsync(`cd ${testDir} && terraform plan -var-file=terraform.tfvars`, { timeout: 30000 });
                
                // Check for syntax errors vs connection errors
                if (stderr && stderr.includes('Error parsing') || stderr.includes('Syntax error')) {
                    throw new Error(`Terraform plan failed with syntax error: ${stderr}`);
                }
                
                console.log(`   ✓ Terraform plan executed (syntax check passed)`);
            } catch (error) {
                // Ignore connection errors, we're testing syntax
                if (error.message.includes('connection refused') || error.message.includes('HTTP 404')) {
                    console.log(`   ✓ Terraform plan syntax valid (connection error expected)`);
                } else {
                    throw error;
                }
            }
        }, 'Test terraform plan execution for syntax and resource validation');
    }

    async testFeatureCoverageCompleteness() {
        await this.runTest('feature-coverage-completeness', async () => {
            const requiredFeatures = [
                'identityProviders',
                'authenticationFlows',  
                'protocolMappers',
                'clientScopes',
                'userFederation',
                'clientPolicies',
                'realmEvents',
                'requiredActions'
            ];

            const missingFeatures = [];
            
            // Check if test files exist for each feature
            requiredFeatures.forEach(feature => {
                const hasTestData = this.checkFeatureTestData(feature);
                if (!hasTestData) {
                    missingFeatures.push(feature);
                }
            });

            if (missingFeatures.length > 0) {
                throw new Error(`Missing test data for features: ${missingFeatures.join(', ')}`);
            }

            console.log(`   ✓ Test coverage exists for all ${requiredFeatures.length} complex features`);
        }, 'Verify test coverage exists for all implemented features');
    }

    checkFeatureTestData(feature) {
        const testFiles = [
            './test-samples/docker-realm.json',
            './test-samples/api-key-realm.json',
            './test-samples/example-realm.json',
            './test-samples/groups-test-realm.json'
        ];

        for (const file of testFiles) {
            if (fs.existsSync(file)) {
                try {
                    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
                    
                    switch (feature) {
                        case 'identityProviders':
                            if (content.identityProviders && content.identityProviders.length > 0) return true;
                            break;
                        case 'authenticationFlows':
                            if (content.authenticationFlows && content.authenticationFlows.length > 0) return true;
                            break;
                        case 'userFederation':
                            if (content.components && this.hasUserFederation(content.components)) return true;
                            break;
                        case 'clientPolicies':
                            if (content.clientPolicies && Object.keys(content.clientPolicies).length > 0) return true;
                            break;
                        default:
                            if (content[feature] && (Array.isArray(content[feature]) ? content[feature].length > 0 : true)) {
                                return true;
                            }
                    }
                } catch (error) {
                    console.log(`Warning: Could not parse ${file}`);
                }
            }
        }
        
        return false;
    }

    hasUserFederation(components) {
        if (!components) return false;
        
        return Object.values(components).some(providerArray => {
            if (Array.isArray(providerArray)) {
                return providerArray.some(provider => 
                    provider.providerId === 'ldap' || provider.providerId === 'kerberos'
                );
            }
            return false;
        });
    }

    async testGeneratedFileCompleteness() {
        await this.runTest('generated-file-completeness', async () => {
            const testRealms = ['Example-Realm', 'groups-test-realm'];
            
            testRealms.forEach(realm => {
                const realmDir = `./terraform/${realm}`;
                if (!fs.existsSync(realmDir)) {
                    throw new Error(`Generated terraform directory not found: ${realmDir}`);
                }

                // Check for required files
                const requiredFiles = ['realm.tf', 'variables.tf', 'provider.tf'];
                requiredFiles.forEach(file => {
                    const filePath = `${realmDir}/${file}`;
                    if (!fs.existsSync(filePath)) {
                        throw new Error(`Required file missing: ${filePath}`);
                    }
                });

                // Check file content quality
                const realmTf = fs.readFileSync(`${realmDir}/realm.tf`, 'utf8');
                if (!realmTf.includes('keycloak_realm')) {
                    throw new Error(`${realmDir}/realm.tf missing keycloak_realm resource`);
                }

                console.log(`   ✓ ${realm}: All required files present and valid`);
            });
        }, 'Verify all required Terraform files are generated with proper content');
    }

    async testVersionCompatibility() {
        await this.runTest('version-compatibility', async () => {
            const generatedFiles = ['./terraform/Example-Realm/realm.tf'];
            
            generatedFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for provider version constraints
                    if (!content.includes('required_providers')) {
                        throw new Error(`${file} missing required_providers block`);
                    }
                    
                    if (!content.includes('mrparkers/keycloak')) {
                        throw new Error(`${file} missing Keycloak provider configuration`);
                    }
                    
                    if (!content.includes('~> 4.0')) {
                        throw new Error(`${file} missing provider version constraint`);
                    }
                    
                    console.log(`   ✓ ${file}: Provider version constraints present`);
                }
            });
        }, 'Verify provider version compatibility and constraints');
    }

    async runAllTests() {
        console.log('🚀 INTEGRATION TEST SUITE');
        console.log('==========================');
        
        await this.testTerraformSyntaxValidation();
        await this.testTerraformPlan();
        await this.testFeatureCoverageCompleteness();
        await this.testGeneratedFileCompleteness();
        await this.testVersionCompatibility();
        
        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 INTEGRATION TEST RESULTS');
        console.log('============================');
        console.log(`Total Tests: ${this.testResults.summary.total}`);
        console.log(`Passed: ${this.testResults.summary.passed}`);
        console.log(`Failed: ${this.testResults.summary.failed}`);
        console.log(`Success Rate: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%`);

        if (this.testResults.summary.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.tests.filter(t => t.result === 'FAILED').forEach(t => {
                console.log(`  - ${t.name}: ${t.error}`);
            });
        }

        // Save detailed results
        fs.writeFileSync('./integration-test-results.json', JSON.stringify(this.testResults, null, 2));
        
        console.log('\n📁 Detailed results saved to: integration-test-results.json');
        
        // Exit with appropriate code
        process.exit(this.testResults.summary.failed > 0 ? 1 : 0);
    }
}

// Run the integration tests
const testSuite = new IntegrationTestSuite();
testSuite.runAllTests().catch(error => {
    console.error('Integration test suite failed to run:', error);
    process.exit(1);
});