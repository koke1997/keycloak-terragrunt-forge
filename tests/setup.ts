import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { keycloakRealmJsonToTerragrunt } from '../src/utils/keycloakToTerragrunt'

// Mock API handlers
const handlers = [
    // Mock conversion endpoint
    http.post('/api/convert', async ({ request }) => {
        try {
            const data = await request.json() as Record<string, unknown>

            if (!data?.realm) {
                return HttpResponse.json(
                    { error: 'Missing realm property', code: 'MISSING_REALM' },
                    { status: 400 }
                )
            }

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
                    generatedAt: new Date().toISOString()
                }
            })
        } catch (error) {
            return HttpResponse.json(
                { error: 'Conversion failed', details: String(error) },
                { status: 500 }
            )
        }
    }),

    // Mock validation endpoint
    http.post('/api/validate', async ({ request }) => {
        try {
            const data = await request.json() as { files: Array<{ filePath: string; content: string }> }

            return HttpResponse.json({
                valid: true,
                issues: [],
                warnings: [],
                summary: {
                    totalFiles: data.files.length,
                    validFiles: data.files.length,
                    issueCount: 0,
                    warningCount: 0
                }
            })
        } catch (error) {
            return HttpResponse.json(
                { error: 'Validation failed', details: String(error) },
                { status: 500 }
            )
        }
    }),

    // Mock analyze endpoint
    http.post('/api/analyze', async ({ request }) => {
        try {
            const data = await request.json() as Record<string, unknown>

            return HttpResponse.json({
                complexity: 'medium',
                features: ['groups', 'roles', 'users', 'clients'],
                statistics: {
                    groupCount: 5,
                    roleCount: 10,
                    userCount: 20,
                    clientCount: 3
                },
                recommendations: [
                    'Consider organizing roles into hierarchies',
                    'Review group memberships for efficiency'
                ]
            })
        } catch (error) {
            return HttpResponse.json(
                { error: 'Analysis failed', details: String(error) },
                { status: 500 }
            )
        }
    }),

    // Mock deployment endpoint
    http.post('/api/deploy', async () => {
        return HttpResponse.json({
            success: true,
            deploymentId: 'deploy-123',
            status: 'completed',
            logs: ['Initializing...', 'Deploying resources...', 'Deployment completed']
        })
    }),

    // Mock health check endpoint
    http.get('/api/health', () => {
        return HttpResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'healthy',
                terraform: 'healthy',
                keycloak: 'healthy'
            }
        })
    })
]

// Mock server for API testing
export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
