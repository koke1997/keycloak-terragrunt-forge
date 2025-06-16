import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { keycloakRealmJsonToTerragrunt } from '../../src/utils/keycloakToTerragrunt'

// Extended Mock API server for comprehensive integration tests
const server = setupServer(
    // Mock conversion endpoint with detailed validation
    http.post('/api/convert', async ({ request }) => {
        const data = await request.json() as Record<string, unknown>

        if (!data?.realm) {
            return HttpResponse.json(
                { error: 'Missing realm property', code: 'MISSING_REALM' },
                { status: 400 }
            )
        }

        // Simulate conversion process
        const files = keycloakRealmJsonToTerragrunt(data, `${data.realm}.json`)

        return HttpResponse.json({
            success: true,
            files: files.map(f => ({
                filePath: f.filePath,
                content: f.content,
                size: f.content.length,
                type: f.filePath.endsWith('.tf') ? 'terraform' : 'unknown'
            })),
            metadata: {
                realm: data.realm,
                fileCount: files.length,
                totalSize: files.reduce((sum, f) => sum + f.content.length, 0),
                generatedAt: new Date().toISOString(),
                complexity: calculateComplexity(data),
                modules: extractModules(files)
            }
        })
    }),

    // Mock validation endpoint with comprehensive checks
    http.post('/api/validate', async ({ request }) => {
        const data = await request.json() as { files: Array<{ filePath: string; content: string }> }

        const issues: Array<{ file: string; line: number; message: string; severity: string }> = []
        const warnings: Array<{ file: string; message: string }> = []

        // Simulate Terraform validation
        data.files.forEach(file => {
            // Check for common Terraform issues
            if (!file.content.includes('terraform {') && file.filePath.includes('main.tf')) {
                issues.push({
                    file: file.filePath,
                    line: 1,
                    message: 'Missing terraform configuration block',
                    severity: 'error'
                })
            }

            // Check for provider configuration
            if (file.content.includes('keycloak_') && !file.content.includes('provider')) {
                warnings.push({
                    file: file.filePath,
                    message: 'Keycloak resources found but no provider configuration'
                })
            }

            // Check for undefined variables
            const undefinedMatches = file.content.match(/var\.[a-zA-Z_][a-zA-Z0-9_]*/g)
            if (undefinedMatches) {
                undefinedMatches.forEach(varRef => {
                    if (!data.files.some(f => f.content.includes(`variable "${varRef.replace('var.', '')}"`) || f.filePath.includes('variables.tf'))) {
                        issues.push({
                            file: file.filePath,
                            line: 1,
                            message: `Undefined variable: ${varRef}`,
                            severity: 'warning'
                        })
                    }
                })
            }
        })

        return HttpResponse.json({
            valid: issues.filter(i => i.severity === 'error').length === 0,
            issues,
            warnings,
            syntax: 'valid',
            provider: 'keycloak/keycloak 5.2.0',
            moduleCount: data.files.filter(f => f.filePath.includes('main.tf')).length,
            resourceCount: countResources(data.files)
        })
    }),

    // Mock complexity analysis with detailed metrics
    http.post('/api/analyze', async ({ request }) => {
        const data = await request.json() as Record<string, unknown>

        const complexity = calculateComplexity(data)

        return HttpResponse.json({
            complexity,
            features: analyzeFeatures(data),
            recommendations: generateRecommendations(data, complexity),
            security: analyzeSecurityFeatures(data),
            scalability: analyzeScalability(data),
            compliance: analyzeCompliance(data)
        })
    }),

    // Mock Terraform plan endpoint
    http.post('/api/terraform/plan', async ({ request }) => {
        const data = await request.json() as { files: Array<{ filePath: string; content: string }> }

        const resources = countResources(data.files)

        return HttpResponse.json({
            success: true,
            plan: {
                toAdd: resources.total,
                toChange: 0,
                toDestroy: 0,
                resources: resources
            },
            planOutput: `
Terraform will perform the following actions:

${Object.entries(resources).map(([type, count]) =>
                count > 0 ? `  # ${type}: ${count} to add` : ''
            ).filter(Boolean).join('\n')}

Plan: ${resources.total} to add, 0 to change, 0 to destroy.
      `.trim()
        })
    }),

    // Mock Terraform apply endpoint
    http.post('/api/terraform/apply', async ({ request }) => {
        const data = await request.json() as { files: Array<{ filePath: string; content: string }> }

        const resources = countResources(data.files)

        // Simulate some random failures for testing
        const shouldFail = Math.random() < 0.1 // 10% chance of failure

        if (shouldFail) {
            return HttpResponse.json({
                success: false,
                error: 'Resource creation failed',
                details: 'keycloak_realm.this: Error creating realm: connection timeout'
            }, { status: 500 })
        }

        return HttpResponse.json({
            success: true,
            applied: {
                resources: resources.total,
                duration: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
                outputs: {
                    realm_id: 'realm-' + Math.random().toString(36).substr(2, 9),
                    realm_name: 'test-realm',
                    endpoint: 'https://keycloak.example.com/auth/realms/test-realm'
                }
            },
            applyOutput: `Apply complete! Resources: ${resources.total} added, 0 changed, 0 destroyed.`
        })
    }),

    // Mock deployment status endpoint
    http.get('/api/deployment/:id/status', ({ params }) => {
        const { id } = params

        const statuses = ['pending', 'running', 'completed', 'failed']
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

        return HttpResponse.json({
            id,
            status: randomStatus,
            progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 100),
            logs: [
                { timestamp: new Date().toISOString(), level: 'info', message: 'Starting deployment' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'Validating configuration' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'Creating resources' }
            ],
            resources: randomStatus === 'completed' ? {
                created: 15,
                updated: 0,
                destroyed: 0
            } : null
        })
    }),

    // Mock health check endpoint
    http.get('/api/health', () => {
        return HttpResponse.json({
            status: 'healthy',
            version: '1.0.0',
            services: {
                terraform: 'available',
                keycloak: 'available',
                database: 'available'
            },
            timestamp: new Date().toISOString()
        })
    })
)

// Helper functions for mock responses
function calculateComplexity(data: Record<string, unknown>): {
    score: number
    level: string
    breakdown: Record<string, number>
} {
    let score = 0
    const breakdown: Record<string, number> = {}

    // Calculate based on various factors
    if (Array.isArray(data.groups)) {
        breakdown.groups = data.groups.length
        score += data.groups.length * 2
    }

    if (Array.isArray(data.users)) {
        breakdown.users = data.users.length
        score += data.users.length * 1
    }

    if (data.roles && typeof data.roles === 'object') {
        const roles = data.roles as Record<string, unknown>
        breakdown.roles = 0
        if (Array.isArray(roles.realm)) breakdown.roles += roles.realm.length
        if (roles.client && typeof roles.client === 'object') {
            breakdown.roles += Object.values(roles.client).reduce((sum, clientRoles) =>
                sum + (Array.isArray(clientRoles) ? clientRoles.length : 0), 0)
        }
        score += breakdown.roles * 3
    }

    if (Array.isArray(data.clients)) {
        breakdown.clients = data.clients.length
        score += data.clients.length * 5
    }

    if (Array.isArray(data.identityProviders)) {
        breakdown.identityProviders = data.identityProviders.length
        score += data.identityProviders.length * 8
    }

    const level = score < 50 ? 'low' : score < 150 ? 'medium' : score < 300 ? 'high' : 'extreme'

    return { score, level, breakdown }
}

function analyzeFeatures(data: Record<string, unknown>): Record<string, boolean> {
    return {
        nestedGroups: hasNestedGroups(data),
        complexAttributes: hasComplexAttributes(data),
        roleMappings: hasRoleMappings(data),
        clientScopes: Array.isArray(data.clientScopes) && data.clientScopes.length > 0,
        identityProviders: Array.isArray(data.identityProviders) && data.identityProviders.length > 0,
        authenticationFlows: Array.isArray(data.authenticationFlows) && data.authenticationFlows.length > 0,
        userFederation: hasUserFederation(data),
        protocolMappers: hasProtocolMappers(data),
        clientPolicies: hasClientPolicies(data),
        mfa: hasMFA(data),
        ldapIntegration: hasLDAPIntegration(data),
        samlSupport: hasSAMLSupport(data)
    }
}

function generateRecommendations(data: Record<string, unknown>, complexity: { score: number; level: string }): string[] {
    const recommendations: string[] = []

    if (complexity.score > 200) {
        recommendations.push('Consider breaking down this realm into multiple smaller realms')
        recommendations.push('Implement proper backup and disaster recovery procedures')
    }

    if (!Array.isArray(data.groups) || data.groups.length === 0) {
        recommendations.push('Consider implementing group-based access control for better organization')
    }

    if (!Array.isArray(data.identityProviders) || data.identityProviders.length === 0) {
        recommendations.push('Consider integrating with external identity providers for SSO')
    }

    if (!hasPasswordPolicy(data)) {
        recommendations.push('Implement strong password policies for enhanced security')
    }

    if (!hasMFA(data)) {
        recommendations.push('Enable multi-factor authentication for critical users')
    }

    return recommendations
}

function analyzeSecurityFeatures(data: Record<string, unknown>): Record<string, boolean | string> {
    return {
        passwordPolicy: hasPasswordPolicy(data),
        mfaEnabled: hasMFA(data),
        bruteForceProtection: hasBruteForceProtection(data),
        sslRequired: data.sslRequired === 'external' || data.sslRequired === 'all',
        eventLogging: data.eventsEnabled === true,
        adminEventLogging: data.adminEventsEnabled === true,
        sessionTimeouts: hasSessionTimeouts(data),
        securityHeaders: hasSecurityHeaders(data)
    }
}

function analyzeScalability(data: Record<string, unknown>): Record<string, number | string> {
    const userCount = Array.isArray(data.users) ? data.users.length : 0
    const groupCount = Array.isArray(data.groups) ? data.groups.length : 0
    const clientCount = Array.isArray(data.clients) ? data.clients.length : 0

    return {
        estimatedUsers: userCount,
        estimatedGroups: groupCount,
        estimatedClients: clientCount,
        scalabilityLevel: userCount > 1000 ? 'enterprise' : userCount > 100 ? 'medium' : 'small',
        recommendedHardware: userCount > 1000 ? 'high-performance' : 'standard'
    }
}

function analyzeCompliance(data: Record<string, unknown>): Record<string, boolean | string[]> {
    return {
        gdprReady: hasGDPRFeatures(data),
        auditLogging: data.eventsEnabled === true && data.adminEventsEnabled === true,
        dataRetention: hasDataRetention(data),
        complianceFeatures: getComplianceFeatures(data)
    }
}

function countResources(files: Array<{ filePath: string; content: string }>): Record<string, number> & { total: number } {
    const resources: Record<string, number> = {}
    let total = 0

    files.forEach(file => {
        const resourceMatches = file.content.match(/resource\s+"([^"]+)"/g)
        if (resourceMatches) {
            resourceMatches.forEach(match => {
                const resourceType = match.match(/resource\s+"([^"]+)"/)?.[1]
                if (resourceType) {
                    resources[resourceType] = (resources[resourceType] || 0) + 1
                    total++
                }
            })
        }
    })

    return { ...resources, total }
}

function extractModules(files: Array<{ filePath: string; content: string }>): string[] {
    const modules = new Set<string>()

    files.forEach(file => {
        const pathParts = file.filePath.split('/')
        if (pathParts.length > 3) {
            const moduleName = pathParts[pathParts.length - 2]
            if (moduleName !== 'realms') {
                modules.add(moduleName)
            }
        }
    })

    return Array.from(modules)
}

// Helper functions for feature analysis
function hasNestedGroups(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.groups)) return false
    return data.groups.some((group: Record<string, unknown>) => group.subGroups && Array.isArray(group.subGroups))
}

function hasComplexAttributes(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.groups) && !Array.isArray(data.users)) return false

    const checkAttributes = (items: Array<Record<string, unknown>>) => {
        return items.some(item =>
            item.attributes &&
            typeof item.attributes === 'object' &&
            Object.keys(item.attributes).length > 2
        )
    }

    return (Array.isArray(data.groups) && checkAttributes(data.groups)) ||
        (Array.isArray(data.users) && checkAttributes(data.users))
}

function hasRoleMappings(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.users)) return false
    return data.users.some((user: Record<string, unknown>) =>
        (user.realmRoles && Array.isArray(user.realmRoles) && user.realmRoles.length > 0) ||
        (user.clientRoles && typeof user.clientRoles === 'object' && Object.keys(user.clientRoles).length > 0)
    )
}

function hasUserFederation(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.components)) return false
    return data.components.some((comp: Record<string, unknown>) =>
        comp.providerId === 'ldap' || comp.subType === 'user-storage'
    )
}

function hasProtocolMappers(data: Record<string, unknown>): boolean {
    if (Array.isArray(data.clients)) {
        return data.clients.some((client: Record<string, unknown>) =>
            client.protocolMappers && Array.isArray(client.protocolMappers) && client.protocolMappers.length > 0
        )
    }
    return false
}

function hasClientPolicies(data: Record<string, unknown>): boolean {
    return !!(data.clientPolicies || data.clientProfiles)
}

function hasMFA(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.authenticationFlows)) return false
    return data.authenticationFlows.some((flow: Record<string, unknown>) =>
        Array.isArray(flow.authenticationExecutions) && flow.authenticationExecutions.some((exec: Record<string, unknown>) =>
            typeof exec.authenticator === 'string' && (exec.authenticator.includes('otp') || exec.authenticator.includes('2fa'))
        )
    )
}

function hasLDAPIntegration(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.components)) return false
    return data.components.some((comp: Record<string, unknown>) => comp.providerId === 'ldap')
}

function hasSAMLSupport(data: Record<string, unknown>): boolean {
    if (!Array.isArray(data.identityProviders)) return false
    return data.identityProviders.some((idp: Record<string, unknown>) => idp.providerId === 'saml')
}

function hasPasswordPolicy(data: Record<string, unknown>): boolean {
    return typeof data.passwordPolicy === 'string' && data.passwordPolicy.length > 0
}

function hasBruteForceProtection(data: Record<string, unknown>): boolean {
    return !!(data.bruteForceProtected || data.failureFactor || data.maxFailureWaitSeconds)
}

function hasSessionTimeouts(data: Record<string, unknown>): boolean {
    return !!(data.ssoSessionIdleTimeout || data.ssoSessionMaxLifespan)
}

function hasSecurityHeaders(data: Record<string, unknown>): boolean {
    return !!(data.browserSecurityHeaders || data.contentSecurityPolicy)
}

function hasGDPRFeatures(data: Record<string, unknown>): boolean {
    return !!(data.userManagedAccessAllowed || data.adminEventsEnabled)
}

function hasDataRetention(data: Record<string, unknown>): boolean {
    return typeof data.eventsExpiration === 'number' && data.eventsExpiration > 0
}

function getComplianceFeatures(data: Record<string, unknown>): string[] {
    const features: string[] = []

    if (hasGDPRFeatures(data)) features.push('GDPR')
    if (data.eventsEnabled) features.push('Audit Logging')
    if (hasDataRetention(data)) features.push('Data Retention')
    if (hasPasswordPolicy(data)) features.push('Password Policy')
    if (hasMFA(data)) features.push('Multi-Factor Authentication')

    return features
}

describe('Comprehensive Integration Tests', () => {
    beforeAll(() => server.listen())
    afterAll(() => server.close())

    beforeEach(() => {
        server.resetHandlers()
    })

    describe('Complete Workflow Integration', () => {
        it('should handle end-to-end realm conversion workflow', async () => {
            const complexRealm = {
                realm: 'enterprise-workflow',
                enabled: true,
                groups: [
                    { name: 'admins', path: '/admins', attributes: { department: ['IT'] } },
                    { name: 'users', path: '/users', attributes: { department: ['General'] } }
                ],
                users: [
                    { username: 'admin', email: 'admin@test.com', groups: ['/admins'] },
                    { username: 'user1', email: 'user1@test.com', groups: ['/users'] }
                ],
                clients: [
                    { clientId: 'test-app', enabled: true, redirectUris: ['http://localhost:3000/*'] }
                ],
                identityProviders: [
                    { alias: 'google', providerId: 'google', enabled: true }
                ]
            }

            // Step 1: Convert realm
            const convertResponse = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complexRealm)
            })

            expect(convertResponse.ok).toBe(true)
            const convertResult = await convertResponse.json()

            expect(convertResult.success).toBe(true)
            expect(convertResult.files).toBeDefined()
            expect(convertResult.files.length).toBeGreaterThan(10)
            expect(convertResult.metadata.complexity.level).toBeDefined()

            // Step 2: Validate generated files
            const validateResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: convertResult.files })
            })

            expect(validateResponse.ok).toBe(true)
            const validateResult = await validateResponse.json()

            expect(validateResult.valid).toBe(true)
            expect(validateResult.provider).toContain('keycloak')

            // Step 3: Analyze complexity
            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complexRealm)
            })

            expect(analyzeResponse.ok).toBe(true)
            const analyzeResult = await analyzeResponse.json()

            expect(analyzeResult.complexity.score).toBeGreaterThan(0)
            expect(analyzeResult.features).toBeDefined()
            expect(analyzeResult.recommendations).toBeDefined()
            expect(Array.isArray(analyzeResult.recommendations)).toBe(true)

            // Step 4: Terraform plan
            const planResponse = await fetch('/api/terraform/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: convertResult.files })
            })

            expect(planResponse.ok).toBe(true)
            const planResult = await planResponse.json()

            expect(planResult.success).toBe(true)
            expect(planResult.plan.toAdd).toBeGreaterThan(0)
            expect(planResult.planOutput).toContain('to add')
        })

        it('should handle Terraform apply workflow', async () => {
            const simpleRealm = {
                realm: 'apply-test',
                enabled: true,
                users: [{ username: 'testuser', email: 'test@example.com' }]
            }

            // Convert and apply
            const convertResponse = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(simpleRealm)
            })

            const convertResult = await convertResponse.json()

            const applyResponse = await fetch('/api/terraform/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: convertResult.files })
            })

            // Apply might succeed or fail (mocked random behavior)
            if (applyResponse.ok) {
                const applyResult = await applyResponse.json()
                expect(applyResult.success).toBe(true)
                expect(applyResult.applied.resources).toBeGreaterThan(0)
                expect(applyResult.applied.outputs).toBeDefined()
            } else {
                const errorResult = await applyResponse.json()
                expect(errorResult.success).toBe(false)
                expect(errorResult.error).toBeDefined()
            }
        })
    })

    describe('Advanced Feature Integration', () => {
        it('should handle complex realm with all features', async () => {
            const ultimateRealm = {
                realm: 'ultimate-test',
                enabled: true,
                passwordPolicy: 'length(12) and digits(2) and lowerCase(1) and upperCase(1) and specialChars(1)',
                sslRequired: 'all',
                eventsEnabled: true,
                adminEventsEnabled: true,
                groups: Array.from({ length: 20 }, (_, i) => ({
                    name: `group-${i}`,
                    path: `/group-${i}`,
                    attributes: { level: [i < 5 ? 'senior' : 'junior'] }
                })),
                users: Array.from({ length: 50 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`,
                    attributes: { employee_id: [`EMP${i.toString().padStart(3, '0')}`] }
                })),
                roles: {
                    realm: Array.from({ length: 15 }, (_, i) => ({
                        name: `role-${i}`,
                        description: `Role ${i}`
                    }))
                },
                clients: Array.from({ length: 8 }, (_, i) => ({
                    clientId: `client-${i}`,
                    enabled: true,
                    protocolMappers: [
                        {
                            name: `mapper-${i}`,
                            protocol: 'openid-connect',
                            protocolMapper: 'oidc-usermodel-property-mapper'
                        }
                    ]
                })),
                identityProviders: [
                    { alias: 'google', providerId: 'google', enabled: true },
                    { alias: 'saml-idp', providerId: 'saml', enabled: true }
                ],
                authenticationFlows: [
                    {
                        alias: 'custom-flow',
                        description: 'Custom authentication flow',
                        authenticationExecutions: [
                            { authenticator: 'auth-cookie', requirement: 'ALTERNATIVE' }
                        ]
                    }
                ],
                components: [
                    {
                        name: 'ldap-provider',
                        providerId: 'ldap',
                        config: {
                            connectionUrl: ['ldaps://ldap.example.com:636'],
                            usersDn: ['ou=users,dc=example,dc=com']
                        }
                    }
                ]
            }

            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ultimateRealm)
            })

            expect(analyzeResponse.ok).toBe(true)
            const result = await analyzeResponse.json()

            expect(result.complexity.level).toBe('extreme')
            expect(result.features.identityProviders).toBe(true)
            expect(result.features.userFederation).toBe(true)
            expect(result.features.authenticationFlows).toBe(true)
            expect(result.features.protocolMappers).toBe(true)
            expect(result.security.passwordPolicy).toBe(true)
            expect(result.security.eventLogging).toBe(true)
            expect(result.scalability.scalabilityLevel).toBe('enterprise')
        })

        it('should provide detailed security analysis', async () => {
            const secureRealm = {
                realm: 'secure-test',
                enabled: true,
                passwordPolicy: 'length(12) and digits(2) and upperCase(1) and specialChars(2)',
                sslRequired: 'all',
                eventsEnabled: true,
                adminEventsEnabled: true,
                eventsExpiration: 86400,
                bruteForceProtected: true,
                failureFactor: 5,
                maxFailureWaitSeconds: 900,
                ssoSessionIdleTimeout: 1800,
                ssoSessionMaxLifespan: 36000,
                authenticationFlows: [
                    {
                        alias: 'mfa-flow',
                        authenticationExecutions: [
                            { authenticator: 'auth-otp-form', requirement: 'REQUIRED' }
                        ]
                    }
                ]
            }

            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secureRealm)
            })

            const result = await analyzeResponse.json()

            expect(result.security.passwordPolicy).toBe(true)
            expect(result.security.sslRequired).toBe(true)
            expect(result.security.eventLogging).toBe(true)
            expect(result.security.adminEventLogging).toBe(true)
            expect(result.security.bruteForceProtection).toBe(true)
            expect(result.security.sessionTimeouts).toBe(true)
            expect(result.compliance.auditLogging).toBe(true)
            expect(result.compliance.dataRetention).toBe(true)
        })
    })

    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed realm data', async () => {
            const malformedRealm = {
                // Missing realm property
                enabled: true,
                groups: 'not-an-array'
            }

            const convertResponse = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(malformedRealm)
            })

            expect(convertResponse.status).toBe(400)
            const result = await convertResponse.json()
            expect(result.error).toBe('Missing realm property')
            expect(result.code).toBe('MISSING_REALM')
        })

        it('should handle validation errors', async () => {
            const invalidTerraformFiles = [
                {
                    filePath: 'main.tf',
                    content: 'invalid terraform syntax {'
                }
            ]

            const validateResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: invalidTerraformFiles })
            })

            const result = await validateResponse.json()
            expect(result.valid).toBe(false)
            expect(result.issues.length).toBeGreaterThan(0)
        })

        it('should handle deployment status tracking', async () => {
            const deploymentId = 'test-deployment-123'

            const statusResponse = await fetch(`/api/deployment/${deploymentId}/status`)
            expect(statusResponse.ok).toBe(true)

            const status = await statusResponse.json()
            expect(status.id).toBe(deploymentId)
            expect(['pending', 'running', 'completed', 'failed']).toContain(status.status)
            expect(typeof status.progress).toBe('number')
            expect(Array.isArray(status.logs)).toBe(true)
        })

        it('should verify system health', async () => {
            const healthResponse = await fetch('/api/health')
            expect(healthResponse.ok).toBe(true)

            const health = await healthResponse.json()
            expect(health.status).toBe('healthy')
            expect(health.services.terraform).toBe('available')
            expect(health.services.keycloak).toBe('available')
        })
    })

    describe('Performance and Load Testing', () => {
        it('should handle large realm conversion efficiently', async () => {
            const largeRealm = {
                realm: 'performance-test',
                enabled: true,
                groups: Array.from({ length: 100 }, (_, i) => ({
                    name: `group-${i}`,
                    path: `/group-${i}`,
                    attributes: { department: [`dept-${i % 10}`] }
                })),
                users: Array.from({ length: 500 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`,
                    groups: [`/group-${i % 100}`]
                })),
                roles: {
                    realm: Array.from({ length: 50 }, (_, i) => ({
                        name: `role-${i}`,
                        description: `Role ${i}`
                    }))
                },
                clients: Array.from({ length: 25 }, (_, i) => ({
                    clientId: `client-${i}`,
                    enabled: true
                }))
            }

            const startTime = Date.now()

            const convertResponse = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(largeRealm)
            })

            const endTime = Date.now()
            const processingTime = endTime - startTime

            expect(convertResponse.ok).toBe(true)
            expect(processingTime).toBeLessThan(10000) // Should complete within 10 seconds

            const result = await convertResponse.json()
            expect(result.metadata.totalSize).toBeGreaterThan(10000) // Should generate substantial content
            expect(result.metadata.modules.length).toBeGreaterThan(5) // Should have multiple modules
        })

        it('should handle concurrent conversion requests', async () => {
            const testRealms = Array.from({ length: 5 }, (_, i) => ({
                realm: `concurrent-test-${i}`,
                enabled: true,
                users: [{ username: `user-${i}`, email: `user${i}@example.com` }]
            }))

            const promises = testRealms.map(realm =>
                fetch('/api/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(realm)
                }).then(r => r.json())
            )

            const results = await Promise.all(promises)

            results.forEach((result, index) => {
                expect(result.success).toBe(true)
                expect(result.metadata.realm).toBe(`concurrent-test-${index}`)
            })
        })
    })
})
