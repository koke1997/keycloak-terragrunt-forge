import { describe, expect, it } from 'vitest'
import { keycloakRealmJsonToTerragrunt } from '../../src/utils/keycloakToTerragrunt'

describe('keycloakToTerragrunt Core Conversion', () => {
    const mockSimpleRealm = {
        realm: 'test-realm',
        displayName: 'Test Realm',
        enabled: true,
        loginWithEmailAllowed: true,
        registrationAllowed: true,
        groups: [
            {
                id: 'group1',
                name: 'admin-group',
                path: '/admin-group',
                attributes: {
                    department: ['IT'],
                    location: ['HQ']
                }
            }
        ],
        users: [
            {
                id: 'user1',
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                enabled: true,
                groups: ['/admin-group'],
                attributes: {
                    role: ['admin']
                }
            }
        ],
        roles: {
            realm: [
                {
                    id: 'role1',
                    name: 'admin',
                    description: 'Administrator role'
                }
            ]
        },
        clients: [
            {
                id: 'client1',
                clientId: 'test-client',
                name: 'Test Client',
                enabled: true,
                publicClient: false,
                redirectUris: ['http://localhost:3000/*'],
                webOrigins: ['http://localhost:3000']
            }
        ]
    }

    it('should convert a simple realm to Terraform structure', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)

        // Check for main realm file
        const mainFile = result.find(f => f.filePath.includes('main.tf'))
        expect(mainFile).toBeDefined()
        expect(mainFile?.content).toContain('keycloak_realm')
        expect(mainFile?.content).toContain('test-realm')
    })

    it('should generate groups module when groups exist', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        const groupsMainFile = result.find(f => f.filePath.includes('groups/main.tf'))
        expect(groupsMainFile).toBeDefined()
        expect(groupsMainFile?.content).toContain('keycloak_group')
        expect(groupsMainFile?.content).toContain('admin-group')
    })

    it('should generate users module when users exist', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        const usersMainFile = result.find(f => f.filePath.includes('users/main.tf'))
        expect(usersMainFile).toBeDefined()
        expect(usersMainFile?.content).toContain('keycloak_user')
        expect(usersMainFile?.content).toContain('testuser')
    })

    it('should generate roles module when roles exist', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        const rolesMainFile = result.find(f => f.filePath.includes('roles/main.tf'))
        expect(rolesMainFile).toBeDefined()
        expect(rolesMainFile?.content).toContain('keycloak_role')
    })

    it('should generate clients module when clients exist', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        const clientsMainFile = result.find(f => f.filePath.includes('clients/main.tf'))
        expect(clientsMainFile).toBeDefined()
        expect(clientsMainFile?.content).toContain('keycloak_openid_client')
        expect(clientsMainFile?.content).toContain('test-client')
    })

    it('should handle invalid JSON gracefully', () => {
        const result = keycloakRealmJsonToTerragrunt(null, 'invalid.json')

        expect(result).toBeDefined()
        expect(result.length).toBe(1)
        expect(result[0].content).toContain('Could not parse realm file')
    })

    it('should handle missing realm property', () => {
        const invalidRealm = { enabled: true }
        const result = keycloakRealmJsonToTerragrunt(invalidRealm, 'invalid.json')

        expect(result).toBeDefined()
        expect(result.length).toBe(1)
        expect(result[0].content).toContain('missing "realm" property')
    })

    it('should generate all expected files for complete realm', () => {
        const result = keycloakRealmJsonToTerragrunt(mockSimpleRealm, 'test-realm.json')

        const expectedFiles = [
            'main.tf',
            'variables.tf',
            'outputs.tf',
            'groups/main.tf',
            'groups/variables.tf',
            'groups/outputs.tf',
            'users/main.tf',
            'users/variables.tf',
            'users/outputs.tf',
            'roles/main.tf',
            'roles/variables.tf',
            'roles/outputs.tf',
            'clients/main.tf',
            'clients/variables.tf',
            'clients/outputs.tf'
        ]

        expectedFiles.forEach(expectedFile => {
            const found = result.find(f => f.filePath.endsWith(expectedFile))
            expect(found, `Expected file ${expectedFile} not found`).toBeDefined()
        })
    })
})
