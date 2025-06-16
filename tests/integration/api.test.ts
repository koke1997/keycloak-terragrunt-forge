import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Mock API server for integration tests
const server = setupServer(
    // Mock conversion endpoint
    http.post('/api/convert', async ({ request }) => {
        const data = await request.json() as any

        if (!data?.realm) {
            return HttpResponse.json(
                { error: 'Missing realm property' },
                { status: 400 }
            )
        }

        return HttpResponse.json({
            success: true,
            files: [
                {
                    filePath: `keycloak/realms/${data.realm}/main.tf`,
                    content: `# Main configuration for ${data.realm}`
                },
                {
                    filePath: `keycloak/realms/${data.realm}/variables.tf`,
                    content: '# Variables for realm'
                }
            ],
            metadata: {
                realm: data.realm,
                fileCount: 2,
                generatedAt: new Date().toISOString()
            }
        })
    }),

    // Mock validation endpoint
    http.post('/api/validate', async ({ request }) => {
        const data = await request.json() as any

        return HttpResponse.json({
            valid: true,
            issues: [],
            syntax: 'valid',
            provider: 'keycloak/keycloak 5.2.0'
        })
    }),

    // Mock complexity analysis endpoint
    http.post('/api/analyze', async ({ request }) => {
        const data = await request.json()

        return HttpResponse.json({
            complexity: {
                score: 85,
                level: 'high',
                groups: data.groups?.length || 0,
                users: data.users?.length || 0,
                roles: data.roles?.realm?.length || 0,
                clients: data.clients?.length || 0
            },
            features: {
                nestedGroups: true,
                complexAttributes: true,
                roleMappings: true,
                clientScopes: true
            },
            recommendations: [
                'Consider using group hierarchies for better organization',
                'Implement role-based access control',
                'Use client scopes for token customization'
            ]
        })
    })
)

describe('API Integration Tests', () => {
    beforeAll(() => server.listen())
    afterAll(() => server.close())

    describe('Conversion API', () => {
        it('should convert realm JSON to Terraform', async () => {
            const realmData = {
                realm: 'test-realm',
                enabled: true,
                groups: [
                    {
                        name: 'admin-group',
                        path: '/admin-group',
                        attributes: { department: ['IT'] }
                    }
                ],
                users: [
                    {
                        username: 'testuser',
                        email: 'test@example.com',
                        groups: ['/admin-group']
                    }
                ]
            }

            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(realmData)
            })

            expect(response.ok).toBe(true)

            const result = await response.json()
            expect(result.success).toBe(true)
            expect(result.files).toBeDefined()
            expect(result.files.length).toBeGreaterThan(0)
            expect(result.metadata.realm).toBe('test-realm')
        })

        it('should handle invalid realm data', async () => {
            const invalidData = { enabled: true }

            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidData)
            })

            expect(response.status).toBe(400)

            const result = await response.json()
            expect(result.error).toBe('Missing realm property')
        })
    })

    describe('Validation API', () => {
        it('should validate Terraform configuration', async () => {
            const terraformFiles = [
                {
                    filePath: 'main.tf',
                    content: 'resource "keycloak_realm" "test" { realm = "test" }'
                }
            ]

            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: terraformFiles })
            })

            expect(response.ok).toBe(true)

            const result = await response.json()
            expect(result.valid).toBe(true)
            expect(result.syntax).toBe('valid')
            expect(result.provider).toContain('keycloak')
        })
    })

    describe('Analysis API', () => {
        it('should analyze realm complexity', async () => {
            const complexRealm = {
                realm: 'complex-realm',
                groups: new Array(50).fill(null).map((_, i) => ({
                    name: `group-${i}`,
                    attributes: { department: ['IT'] }
                })),
                users: new Array(100).fill(null).map((_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`
                })),
                roles: {
                    realm: new Array(25).fill(null).map((_, i) => ({
                        name: `role-${i}`,
                        description: `Role ${i}`
                    }))
                }
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complexRealm)
            })

            expect(response.ok).toBe(true)

            const result = await response.json()
            expect(result.complexity.score).toBeGreaterThan(70)
            expect(result.complexity.level).toBe('high')
            expect(result.complexity.groups).toBe(50)
            expect(result.complexity.users).toBe(100)
            expect(result.features.nestedGroups).toBe(true)
            expect(result.recommendations).toBeDefined()
        })
    })
})
