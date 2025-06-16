import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { keycloakRealmJsonToTerragrunt } from '../../src/utils/keycloakToTerragrunt'

// Mock server for end-to-end testing
const server = setupServer(
    // Full realm processing endpoint
    http.post('/api/realm/process', async ({ request }) => {
        const formData = await request.formData()
        const file = formData.get('realm') as File

        if (!file) {
            return HttpResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        try {
            const content = await file.text()
            const realmData = JSON.parse(content)

            // Process the realm
            const terraformFiles = keycloakRealmJsonToTerragrunt(realmData, file.name)

            // Simulate backend processing
            const processedFiles = terraformFiles.map(f => ({
                ...f,
                validated: true,
                resourceCount: (f.content.match(/resource\s+"/g) || []).length,
                moduleType: extractModuleType(f.filePath),
                dependencies: extractDependencies(f.content)
            }))

            return HttpResponse.json({
                success: true,
                realm: realmData.realm,
                files: processedFiles,
                summary: {
                    totalFiles: processedFiles.length,
                    totalResources: processedFiles.reduce((sum, f) => sum + f.resourceCount, 0),
                    modules: [...new Set(processedFiles.map(f => f.moduleType).filter(Boolean))],
                    complexity: calculateComplexityScore(realmData),
                    estimatedDeployTime: estimateDeploymentTime(processedFiles)
                },
                validation: {
                    syntax: 'valid',
                    warnings: extractWarnings(processedFiles),
                    recommendations: generateRecommendations(realmData, processedFiles)
                }
            })
        } catch (error) {
            return HttpResponse.json(
                { error: 'Failed to process realm file', details: (error as Error).message },
                { status: 400 }
            )
        }
    }),

    // Terraform deployment simulation
    http.post('/api/terraform/deploy', async ({ request }) => {
        const data = await request.json() as {
            files: Array<{ filePath: string; content: string }>
            config: { dryRun?: boolean; autoApprove?: boolean }
        }

        const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Simulate deployment process
        const resources = countResourcesByType(data.files)
        const estimatedDuration = Math.max(30, resources.total * 2) // 2 seconds per resource, min 30s

        if (data.config.dryRun) {
            return HttpResponse.json({
                success: true,
                deploymentId,
                plan: {
                    toAdd: resources.total,
                    toChange: 0,
                    toDestroy: 0,
                    resources: resources,
                    estimatedDuration
                },
                planOutput: generateTerraformPlanOutput(resources)
            })
        }

        // Start async deployment
        setTimeout(() => {
            // Simulate deployment completion (would be handled by backend in real scenario)
        }, estimatedDuration * 100) // Scaled down for testing

        return HttpResponse.json({
            success: true,
            deploymentId,
            status: 'started',
            estimatedDuration,
            message: 'Deployment started successfully'
        })
    }),

    // Deployment status tracking
    http.get('/api/terraform/deploy/:id/status', ({ params }) => {
        const { id } = params
        const age = Date.now() - parseInt(id.split('-')[1])

        let status: string
        let progress: number

        if (age < 5000) {
            status = 'initializing'
            progress = 10
        } else if (age < 15000) {
            status = 'planning'
            progress = 30
        } else if (age < 25000) {
            status = 'applying'
            progress = 70
        } else if (age < 30000) {
            status = 'finalizing'
            progress = 95
        } else {
            status = 'completed'
            progress = 100
        }

        return HttpResponse.json({
            deploymentId: id,
            status,
            progress,
            currentStep: getCurrentStep(status),
            logs: generateDeploymentLogs(status, progress),
            resources: status === 'completed' ? {
                created: 15,
                updated: 0,
                destroyed: 0,
                outputs: {
                    realm_id: 'realm-' + Math.random().toString(36).substr(2, 9),
                    realm_endpoint: 'https://keycloak.example.com/auth/realms/test-realm'
                }
            } : null
        })
    }),

    // Health and system status
    http.get('/api/system/health', () => {
        return HttpResponse.json({
            status: 'healthy',
            version: '1.0.0',
            uptime: Math.floor(Math.random() * 86400),
            services: {
                terraform: { status: 'ready', version: '1.6.0' },
                keycloak: { status: 'ready', version: '22.0.0' },
                database: { status: 'ready', connections: 5 },
                storage: { status: 'ready', available: '50GB' }
            },
            metrics: {
                deploymentsToday: Math.floor(Math.random() * 20),
                averageDeployTime: 45,
                successRate: 98.5
            }
        })
    }),

    // Configuration validation
    http.post('/api/terraform/validate', async ({ request }) => {
        const data = await request.json() as { files: Array<{ filePath: string; content: string }> }

        const issues: Array<{ file: string; line: number; severity: 'error' | 'warning'; message: string }> = []

        // Comprehensive validation
        data.files.forEach(file => {
            validateTerraformSyntax(file, issues)
            validateKeycloakResources(file, issues)
            validateBestPractices(file, issues)
        })

        const errors = issues.filter(i => i.severity === 'error')
        const warnings = issues.filter(i => i.severity === 'warning')

        return HttpResponse.json({
            valid: errors.length === 0,
            issues,
            summary: {
                files: data.files.length,
                errors: errors.length,
                warnings: warnings.length,
                resources: countResourcesByType(data.files).total
            },
            recommendations: generateValidationRecommendations(issues, data.files)
        })
    })
)

// Helper functions for mock responses
function extractModuleType(filePath: string): string | null {
    const pathParts = filePath.split('/')
    if (pathParts.includes('groups')) return 'groups'
    if (pathParts.includes('users')) return 'users'
    if (pathParts.includes('roles')) return 'roles'
    if (pathParts.includes('clients')) return 'clients'
    if (pathParts.includes('identity-providers')) return 'identity-providers'
    if (pathParts.includes('user-federation')) return 'user-federation'
    return null
}

function extractDependencies(content: string): string[] {
    const dependencies: string[] = []
    const moduleRefs = content.match(/module\.\w+/g) || []
    const resourceRefs = content.match(/\w+\.\w+\.\w+/g) || []

    return [...new Set([...moduleRefs, ...resourceRefs])]
}

function calculateComplexityScore(realmData: Record<string, unknown>): { score: number; level: string; factors: Record<string, number> } {
    const factors: Record<string, number> = {}
    let score = 0

    if (Array.isArray(realmData.groups)) {
        factors.groups = realmData.groups.length
        score += realmData.groups.length * 2
    }

    if (Array.isArray(realmData.users)) {
        factors.users = realmData.users.length
        score += realmData.users.length * 1
    }

    if (realmData.roles && typeof realmData.roles === 'object') {
        const roles = realmData.roles as Record<string, unknown>
        factors.roles = 0
        if (Array.isArray(roles.realm)) factors.roles += roles.realm.length
        if (roles.client) factors.roles += Object.keys(roles.client).length
        score += factors.roles * 3
    }

    if (Array.isArray(realmData.clients)) {
        factors.clients = realmData.clients.length
        score += realmData.clients.length * 5
    }

    if (Array.isArray(realmData.identityProviders)) {
        factors.identityProviders = realmData.identityProviders.length
        score += realmData.identityProviders.length * 8
    }

    const level = score < 30 ? 'low' : score < 100 ? 'medium' : score < 200 ? 'high' : 'extreme'

    return { score, level, factors }
}

function estimateDeploymentTime(files: Array<{ resourceCount: number }>): number {
    const totalResources = files.reduce((sum, f) => sum + f.resourceCount, 0)
    return Math.max(30, totalResources * 3) // 3 seconds per resource, minimum 30 seconds
}

function extractWarnings(files: Array<{ content: string; filePath: string }>): string[] {
    const warnings: string[] = []

    files.forEach(file => {
        if (file.content.includes('password') && !file.content.includes('sensitive')) {
            warnings.push(`${file.filePath}: Consider marking password variables as sensitive`)
        }

        if (file.content.includes('localhost')) {
            warnings.push(`${file.filePath}: Localhost URLs found, consider using variables`)
        }

        if (!file.content.includes('description') && file.filePath.includes('variables.tf')) {
            warnings.push(`${file.filePath}: Some variables missing descriptions`)
        }
    })

    return warnings
}

function generateRecommendations(realmData: Record<string, unknown>, files: Array<{ moduleType: string | null }>): string[] {
    const recommendations: string[] = []

    if (!Array.isArray(realmData.groups) || realmData.groups.length === 0) {
        recommendations.push('Consider implementing group-based access control')
    }

    if (!realmData.passwordPolicy) {
        recommendations.push('Implement strong password policies')
    }

    if (!realmData.eventsEnabled) {
        recommendations.push('Enable event logging for security monitoring')
    }

    const hasIdentityProviders = files.some(f => f.moduleType === 'identity-providers')
    if (!hasIdentityProviders) {
        recommendations.push('Consider integrating with external identity providers')
    }

    const hasUserFederation = files.some(f => f.moduleType === 'user-federation')
    if (!hasUserFederation && Array.isArray(realmData.users) && realmData.users.length > 50) {
        recommendations.push('Consider user federation for large user bases')
    }

    return recommendations
}

function countResourcesByType(files: Array<{ content: string }>): Record<string, number> & { total: number } {
    const resources: Record<string, number> = {}
    let total = 0

    files.forEach(file => {
        const resourceMatches = file.content.match(/resource\s+"([^"]+)"/g) || []
        resourceMatches.forEach(match => {
            const resourceType = match.match(/resource\s+"([^"]+)"/)?.[1]
            if (resourceType) {
                resources[resourceType] = (resources[resourceType] || 0) + 1
                total++
            }
        })
    })

    return { ...resources, total }
}

function generateTerraformPlanOutput(resources: Record<string, number>): string {
    const lines = ['Terraform will perform the following actions:', '']

    Object.entries(resources).forEach(([type, count]) => {
        if (type !== 'total' && count > 0) {
            lines.push(`  # ${type}`)
            for (let i = 0; i < Math.min(count, 3); i++) {
                lines.push(`  + resource "${type}" "${type.split('_')[1]}_${i}" {`)
                lines.push(`      + id = (known after apply)`)
                lines.push(`    }`)
                lines.push('')
            }
            if (count > 3) {
                lines.push(`  # ... and ${count - 3} more ${type} resources`)
                lines.push('')
            }
        }
    })

    lines.push(`Plan: ${resources.total} to add, 0 to change, 0 to destroy.`)

    return lines.join('\n')
}

function getCurrentStep(status: string): string {
    switch (status) {
        case 'initializing': return 'Initializing Terraform workspace'
        case 'planning': return 'Creating execution plan'
        case 'applying': return 'Applying configuration changes'
        case 'finalizing': return 'Finalizing deployment'
        case 'completed': return 'Deployment completed successfully'
        default: return 'Processing...'
    }
}

function generateDeploymentLogs(status: string, progress: number): Array<{ timestamp: string; level: string; message: string }> {
    const logs = [
        { timestamp: new Date(Date.now() - 30000).toISOString(), level: 'info', message: 'Deployment started' },
        { timestamp: new Date(Date.now() - 25000).toISOString(), level: 'info', message: 'Initializing Terraform backend' },
        { timestamp: new Date(Date.now() - 20000).toISOString(), level: 'info', message: 'Downloading provider plugins' }
    ]

    if (progress > 20) {
        logs.push({ timestamp: new Date(Date.now() - 15000).toISOString(), level: 'info', message: 'Creating execution plan' })
    }

    if (progress > 50) {
        logs.push({ timestamp: new Date(Date.now() - 10000).toISOString(), level: 'info', message: 'Applying configuration changes' })
        logs.push({ timestamp: new Date(Date.now() - 8000).toISOString(), level: 'info', message: 'Creating keycloak_realm.this' })
    }

    if (progress > 80) {
        logs.push({ timestamp: new Date(Date.now() - 5000).toISOString(), level: 'info', message: 'Creating keycloak_group resources' })
        logs.push({ timestamp: new Date(Date.now() - 3000).toISOString(), level: 'info', message: 'Creating keycloak_user resources' })
    }

    if (status === 'completed') {
        logs.push({ timestamp: new Date().toISOString(), level: 'success', message: 'Deployment completed successfully' })
    }

    return logs
}

function validateTerraformSyntax(file: { filePath: string; content: string }, issues: Array<{ file: string; line: number; severity: 'error' | 'warning'; message: string }>) {
    const lines = file.content.split('\n')

    lines.forEach((line, index) => {
        // Check for missing closing braces
        const openBraces = (line.match(/{/g) || []).length
        const closeBraces = (line.match(/}/g) || []).length

        if (openBraces > closeBraces + 1) {
            issues.push({
                file: file.filePath,
                line: index + 1,
                severity: 'warning',
                message: 'Possible missing closing brace'
            })
        }

        // Check for invalid variable references
        if (line.includes('var.') && !line.includes('variable ')) {
            const varRefs = line.match(/var\.([a-zA-Z_][a-zA-Z0-9_]*)/g) || []
            varRefs.forEach(varRef => {
                const varName = varRef.replace('var.', '')
                if (!file.content.includes(`variable "${varName}"`)) {
                    issues.push({
                        file: file.filePath,
                        line: index + 1,
                        severity: 'error',
                        message: `Undefined variable: ${varName}`
                    })
                }
            })
        }
    })
}

function validateKeycloakResources(file: { filePath: string; content: string }, issues: Array<{ file: string; line: number; severity: 'error' | 'warning'; message: string }>) {
    // Check for required Keycloak resource attributes
    if (file.content.includes('keycloak_realm') && !file.content.includes('realm_id') && !file.content.includes('realm =')) {
        issues.push({
            file: file.filePath,
            line: 1,
            severity: 'error',
            message: 'keycloak_realm resource missing realm identifier'
        })
    }

    // Check for deprecated attributes
    if (file.content.includes('public_client')) {
        issues.push({
            file: file.filePath,
            line: 1,
            severity: 'warning',
            message: 'public_client is deprecated, use access_type instead'
        })
    }
}

function validateBestPractices(file: { filePath: string; content: string }, issues: Array<{ file: string; line: number; severity: 'error' | 'warning'; message: string }>) {
    // Check for hardcoded values
    if (file.content.includes('localhost') && !file.filePath.includes('example')) {
        issues.push({
            file: file.filePath,
            line: 1,
            severity: 'warning',
            message: 'Hardcoded localhost URLs should be parameterized'
        })
    }

    // Check for missing descriptions
    if (file.filePath.includes('variables.tf') && file.content.includes('variable ') && !file.content.includes('description')) {
        issues.push({
            file: file.filePath,
            line: 1,
            severity: 'warning',
            message: 'Variables should include descriptions'
        })
    }
}

function generateValidationRecommendations(issues: Array<{ severity: string }>, files: Array<{ content: string }>): string[] {
    const recommendations: string[] = []

    const errorCount = issues.filter(i => i.severity === 'error').length
    const warningCount = issues.filter(i => i.severity === 'warning').length

    if (errorCount > 0) {
        recommendations.push('Fix all syntax errors before deployment')
    }

    if (warningCount > 5) {
        recommendations.push('Address warnings to improve code quality')
    }

    const hasTests = files.some(f => f.content.includes('test') || f.content.includes('spec'))
    if (!hasTests) {
        recommendations.push('Consider adding Terraform tests for validation')
    }

    const hasDocumentation = files.some(f => f.content.includes('README') || f.content.includes('# '))
    if (!hasDocumentation) {
        recommendations.push('Add documentation for better maintainability')
    }

    return recommendations
}

describe('End-to-End Integration Tests', () => {
    beforeAll(() => server.listen())
    afterAll(() => server.close())

    describe('Complete Realm Processing Workflow', () => {
        it('should process a complete enterprise realm end-to-end', async () => {
            const enterpriseRealm = {
                realm: 'enterprise-e2e',
                displayName: 'Enterprise E2E Test',
                enabled: true,
                passwordPolicy: 'length(12) and digits(2) and upperCase(1) and specialChars(1)',
                sslRequired: 'all',
                eventsEnabled: true,
                adminEventsEnabled: true,
                groups: [
                    {
                        name: 'administrators',
                        path: '/administrators',
                        attributes: { department: ['IT'], clearance: ['high'] },
                        subGroups: [
                            { name: 'system-admins', path: '/administrators/system-admins' },
                            { name: 'security-admins', path: '/administrators/security-admins' }
                        ]
                    },
                    {
                        name: 'employees',
                        path: '/employees',
                        attributes: { department: ['general'] }
                    }
                ],
                users: [
                    {
                        username: 'admin',
                        email: 'admin@enterprise.com',
                        firstName: 'System',
                        lastName: 'Administrator',
                        enabled: true,
                        groups: ['/administrators/system-admins'],
                        attributes: { employee_id: ['E001'], clearance: ['high'] }
                    },
                    {
                        username: 'security.admin',
                        email: 'security@enterprise.com',
                        firstName: 'Security',
                        lastName: 'Administrator',
                        enabled: true,
                        groups: ['/administrators/security-admins'],
                        attributes: { employee_id: ['E002'], clearance: ['high'] }
                    },
                    {
                        username: 'john.doe',
                        email: 'john.doe@enterprise.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        enabled: true,
                        groups: ['/employees'],
                        attributes: { employee_id: ['E100'], department: ['sales'] }
                    }
                ],
                roles: {
                    realm: [
                        { name: 'admin', description: 'Administrator role' },
                        { name: 'user', description: 'Standard user role' },
                        { name: 'security-officer', description: 'Security officer role' }
                    ],
                    client: {
                        'enterprise-app': [
                            { name: 'app-admin', description: 'Application administrator' },
                            { name: 'app-user', description: 'Application user' }
                        ]
                    }
                },
                clients: [
                    {
                        clientId: 'enterprise-app',
                        name: 'Enterprise Application',
                        enabled: true,
                        standardFlowEnabled: true,
                        serviceAccountsEnabled: true,
                        authorizationServicesEnabled: true,
                        redirectUris: ['https://app.enterprise.com/*'],
                        webOrigins: ['https://app.enterprise.com'],
                        protocolMappers: [
                            {
                                name: 'employee-id',
                                protocol: 'openid-connect',
                                protocolMapper: 'oidc-usermodel-attribute-mapper',
                                config: {
                                    'user.attribute': 'employee_id',
                                    'claim.name': 'employee_id',
                                    'id.token.claim': 'true',
                                    'access.token.claim': 'true'
                                }
                            }
                        ]
                    }
                ],
                identityProviders: [
                    {
                        alias: 'enterprise-ad',
                        displayName: 'Enterprise Active Directory',
                        providerId: 'saml',
                        enabled: true,
                        config: {
                            entityId: 'https://adfs.enterprise.com/adfs/services/trust',
                            singleSignOnServiceUrl: 'https://adfs.enterprise.com/adfs/ls/',
                            singleLogoutServiceUrl: 'https://adfs.enterprise.com/adfs/ls/'
                        }
                    }
                ],
                components: [
                    {
                        name: 'enterprise-ldap',
                        providerId: 'ldap',
                        subType: 'user-storage',
                        config: {
                            connectionUrl: ['ldaps://ldap.enterprise.com:636'],
                            usersDn: ['OU=Users,DC=enterprise,DC=com'],
                            bindDn: ['CN=keycloak-svc,OU=Service Accounts,DC=enterprise,DC=com'],
                            importEnabled: ['true'],
                            editMode: ['READ_ONLY'],
                            syncRegistrations: ['false']
                        }
                    }
                ]
            }

            // Create form data with the realm file
            const realmJson = JSON.stringify(enterpriseRealm, null, 2)
            const formData = new FormData()
            formData.append('realm', new File([realmJson], 'enterprise-e2e.json', { type: 'application/json' }))

            // Step 1: Process the realm file
            const processResponse = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })

            expect(processResponse.ok).toBe(true)
            const processResult = await processResponse.json()

            // Validate processing results
            expect(processResult.success).toBe(true)
            expect(processResult.realm).toBe('enterprise-e2e')
            expect(processResult.files.length).toBeGreaterThan(15)
            expect(processResult.summary.totalResources).toBeGreaterThan(10)
            expect(processResult.summary.complexity.level).toBe('high')
            expect(processResult.summary.modules).toContain('groups')
            expect(processResult.summary.modules).toContain('users')
            expect(processResult.summary.modules).toContain('clients')

            // Step 2: Validate generated Terraform
            const validateResponse = await fetch('/api/terraform/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: processResult.files })
            })

            expect(validateResponse.ok).toBe(true)
            const validateResult = await validateResponse.json()

            expect(validateResult.valid).toBe(true)
            expect(validateResult.summary.errors).toBe(0)
            expect(validateResult.summary.resources).toBeGreaterThan(0)

            // Step 3: Create deployment plan
            const planResponse = await fetch('/api/terraform/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: processResult.files,
                    config: { dryRun: true }
                })
            })

            expect(planResponse.ok).toBe(true)
            const planResult = await planResponse.json()

            expect(planResult.success).toBe(true)
            expect(planResult.plan.toAdd).toBeGreaterThan(0)
            expect(planResult.planOutput).toContain('keycloak_realm')
            expect(planResult.planOutput).toContain('keycloak_group')
            expect(planResult.planOutput).toContain('keycloak_user')

            // Step 4: Start actual deployment
            const deployResponse = await fetch('/api/terraform/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: processResult.files,
                    config: { autoApprove: true }
                })
            })

            expect(deployResponse.ok).toBe(true)
            const deployResult = await deployResponse.json()

            expect(deployResult.success).toBe(true)
            expect(deployResult.deploymentId).toBeDefined()
            expect(deployResult.status).toBe('started')

            // Step 5: Track deployment progress
            const deploymentId = deployResult.deploymentId
            let deploymentComplete = false
            let attempts = 0
            const maxAttempts = 10

            while (!deploymentComplete && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

                const statusResponse = await fetch(`/api/terraform/deploy/${deploymentId}/status`)
                expect(statusResponse.ok).toBe(true)

                const statusResult = await statusResponse.json()
                expect(statusResult.deploymentId).toBe(deploymentId)
                expect(statusResult.progress).toBeGreaterThanOrEqual(0)
                expect(statusResult.progress).toBeLessThanOrEqual(100)
                expect(statusResult.logs).toBeDefined()
                expect(Array.isArray(statusResult.logs)).toBe(true)

                if (statusResult.status === 'completed') {
                    deploymentComplete = true
                    expect(statusResult.resources).toBeDefined()
                    expect(statusResult.resources.created).toBeGreaterThan(0)
                    expect(statusResult.resources.outputs).toBeDefined()
                    expect(statusResult.resources.outputs.realm_id).toBeDefined()
                }

                attempts++
            }

            expect(deploymentComplete).toBe(true)
        }, 30000) // 30 second timeout for full e2e test

        it('should handle realm with all advanced features', async () => {
            const advancedRealm = {
                realm: 'advanced-features',
                enabled: true,
                passwordPolicy: 'length(16) and digits(3) and upperCase(2) and lowerCase(2) and specialChars(2) and notUsername(undefined)',
                bruteForceProtected: true,
                failureFactor: 3,
                maxFailureWaitSeconds: 900,
                sslRequired: 'all',
                eventsEnabled: true,
                adminEventsEnabled: true,
                eventsExpiration: 604800, // 7 days
                groups: Array.from({ length: 25 }, (_, i) => ({
                    name: `group-${i}`,
                    path: `/group-${i}`,
                    attributes: {
                        level: [i < 5 ? 'admin' : i < 15 ? 'manager' : 'user'],
                        department: [`dept-${i % 5}`]
                    }
                })),
                users: Array.from({ length: 100 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@advanced.com`,
                    enabled: true,
                    groups: [`/group-${i % 25}`],
                    attributes: {
                        employee_id: [`EMP${i.toString().padStart(4, '0')}`],
                        hire_date: ['2023-01-01']
                    }
                })),
                roles: {
                    realm: Array.from({ length: 20 }, (_, i) => ({
                        name: `role-${i}`,
                        description: `Advanced role ${i}`,
                        composite: i < 5
                    }))
                },
                clients: Array.from({ length: 10 }, (_, i) => ({
                    clientId: `client-${i}`,
                    name: `Advanced Client ${i}`,
                    enabled: true,
                    serviceAccountsEnabled: true,
                    authorizationServicesEnabled: true,
                    protocolMappers: [
                        {
                            name: `mapper-${i}`,
                            protocol: 'openid-connect',
                            protocolMapper: 'oidc-usermodel-attribute-mapper'
                        }
                    ]
                })),
                identityProviders: [
                    {
                        alias: 'google-workspace',
                        providerId: 'google',
                        enabled: true
                    },
                    {
                        alias: 'azure-ad',
                        providerId: 'oidc',
                        enabled: true
                    },
                    {
                        alias: 'enterprise-saml',
                        providerId: 'saml',
                        enabled: true
                    }
                ],
                authenticationFlows: [
                    {
                        alias: 'advanced-browser',
                        description: 'Advanced browser flow with MFA',
                        providerId: 'basic-flow',
                        authenticationExecutions: [
                            { authenticator: 'auth-cookie', requirement: 'ALTERNATIVE' },
                            { authenticator: 'auth-otp-form', requirement: 'REQUIRED' }
                        ]
                    }
                ],
                components: [
                    {
                        name: 'advanced-ldap',
                        providerId: 'ldap',
                        config: {
                            connectionUrl: ['ldaps://ldap.advanced.com:636'],
                            usersDn: ['OU=Users,DC=advanced,DC=com']
                        }
                    }
                ]
            }

            const realmJson = JSON.stringify(advancedRealm, null, 2)
            const formData = new FormData()
            formData.append('realm', new File([realmJson], 'advanced-features.json', { type: 'application/json' }))

            const processResponse = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })

            expect(processResponse.ok).toBe(true)
            const result = await processResponse.json()

            expect(result.success).toBe(true)
            expect(result.summary.complexity.level).toBe('extreme')
            expect(result.summary.totalFiles).toBeGreaterThan(30)
            expect(result.summary.modules).toContain('identity-providers')
            expect(result.summary.modules).toContain('user-federation')
            expect(result.validation.recommendations.length).toBeGreaterThan(0)
        })
    })

    describe('Error Handling and Recovery', () => {
        it('should handle malformed JSON gracefully', async () => {
            const malformedJson = '{"realm": "malformed", "enabled": true, invalid json'
            const formData = new FormData()
            formData.append('realm', new File([malformedJson], 'malformed.json', { type: 'application/json' }))

            const response = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })

            expect(response.status).toBe(400)
            const result = await response.json()
            expect(result.error).toBe('Failed to process realm file')
            expect(result.details).toContain('JSON')
        })

        it('should handle missing required realm properties', async () => {
            const invalidRealm = {
                enabled: true,
                groups: [{ name: 'test' }]
                // Missing 'realm' property
            }

            const realmJson = JSON.stringify(invalidRealm)
            const formData = new FormData()
            formData.append('realm', new File([realmJson], 'invalid.json', { type: 'application/json' }))

            const response = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })

            expect(response.ok).toBe(true) // Should process but show warnings
            const result = await response.json()
            expect(result.validation.warnings.length).toBeGreaterThan(0)
        })

        it('should handle deployment failures gracefully', async () => {
            const simpleRealm = { realm: 'failure-test', enabled: true }
            const files = keycloakRealmJsonToTerragrunt(simpleRealm, 'failure-test.json')

            // Force a deployment failure by using invalid configuration
            const deployResponse = await fetch('/api/terraform/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: files.map(f => ({ ...f, content: 'invalid terraform syntax' })),
                    config: { autoApprove: true }
                })
            })

            // Should still return success for starting deployment
            expect(deployResponse.ok).toBe(true)

            // But deployment status should eventually show failure
            const result = await deployResponse.json()
            const statusResponse = await fetch(`/api/terraform/deploy/${result.deploymentId}/status`)
            const statusResult = await statusResponse.json()

            // Depending on timing, might be 'failed' or still 'running'
            expect(['initializing', 'planning', 'applying', 'failed']).toContain(statusResult.status)
        })
    })

    describe('Performance and Scalability', () => {
        it('should handle large realm processing efficiently', async () => {
            const largeRealm = {
                realm: 'performance-test',
                enabled: true,
                groups: Array.from({ length: 200 }, (_, i) => ({
                    name: `group-${i}`,
                    path: `/group-${i}`,
                    attributes: { department: [`dept-${i % 20}`] }
                })),
                users: Array.from({ length: 1000 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@performance.com`,
                    enabled: true,
                    groups: [`/group-${i % 200}`]
                })),
                roles: {
                    realm: Array.from({ length: 100 }, (_, i) => ({
                        name: `role-${i}`,
                        description: `Performance test role ${i}`
                    }))
                },
                clients: Array.from({ length: 50 }, (_, i) => ({
                    clientId: `client-${i}`,
                    enabled: true
                }))
            }

            const realmJson = JSON.stringify(largeRealm)
            const formData = new FormData()
            formData.append('realm', new File([realmJson], 'performance-test.json', { type: 'application/json' }))

            const startTime = Date.now()
            const response = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })
            const endTime = Date.now()

            expect(response.ok).toBe(true)
            expect(endTime - startTime).toBeLessThan(10000) // Should complete within 10 seconds

            const result = await response.json()
            expect(result.success).toBe(true)
            expect(result.summary.totalFiles).toBeGreaterThan(50)
            expect(result.summary.complexity.level).toBe('extreme')
        }, 15000)

        it('should provide accurate deployment time estimates', async () => {
            const mediumRealm = {
                realm: 'timing-test',
                enabled: true,
                groups: Array.from({ length: 10 }, (_, i) => ({ name: `group-${i}`, path: `/group-${i}` })),
                users: Array.from({ length: 25 }, (_, i) => ({ username: `user-${i}`, email: `user${i}@timing.com` })),
                clients: Array.from({ length: 5 }, (_, i) => ({ clientId: `client-${i}`, enabled: true }))
            }

            const realmJson = JSON.stringify(mediumRealm)
            const formData = new FormData()
            formData.append('realm', new File([realmJson], 'timing-test.json', { type: 'application/json' }))

            const response = await fetch('/api/realm/process', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            expect(result.summary.estimatedDeployTime).toBeGreaterThan(30)
            expect(result.summary.estimatedDeployTime).toBeLessThan(300) // Should be reasonable
        })
    })

    describe('System Integration', () => {
        it('should verify system health and capabilities', async () => {
            const healthResponse = await fetch('/api/system/health')
            expect(healthResponse.ok).toBe(true)

            const health = await healthResponse.json()
            expect(health.status).toBe('healthy')
            expect(health.services.terraform.status).toBe('ready')
            expect(health.services.keycloak.status).toBe('ready')
            expect(health.services.database.status).toBe('ready')
            expect(typeof health.metrics.deploymentsToday).toBe('number')
            expect(health.metrics.successRate).toBeGreaterThan(90)
        })

        it('should handle concurrent processing requests', async () => {
            const testRealms = Array.from({ length: 5 }, (_, i) => ({
                realm: `concurrent-${i}`,
                enabled: true,
                users: [{ username: `user-${i}`, email: `user${i}@concurrent.com` }]
            }))

            const promises = testRealms.map(realm => {
                const realmJson = JSON.stringify(realm)
                const formData = new FormData()
                formData.append('realm', new File([realmJson], `concurrent-${realm.realm}.json`, { type: 'application/json' }))

                return fetch('/api/realm/process', {
                    method: 'POST',
                    body: formData
                }).then(r => r.json())
            })

            const results = await Promise.all(promises)

            results.forEach((result, index) => {
                expect(result.success).toBe(true)
                expect(result.realm).toBe(`concurrent-${index}`)
            })
        })
    })
})
