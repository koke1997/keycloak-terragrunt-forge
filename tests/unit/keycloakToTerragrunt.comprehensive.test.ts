import { beforeEach, describe, expect, it } from 'vitest'
import { keycloakRealmJsonToTerragrunt } from '../../src/utils/keycloakToTerragrunt'

describe('keycloakToTerragrunt - Comprehensive Tests', () => {
    let complexRealm: Record<string, unknown>

    beforeEach(() => {
        complexRealm = {
            realm: 'enterprise-test',
            displayName: 'Enterprise Test Realm',
            enabled: true,
            loginWithEmailAllowed: true,
            registrationAllowed: true,
            passwordPolicy: 'length(8) and digits(2) and lowerCase(1) and upperCase(1) and specialChars(1) and notUsername(undefined) and blacklist(password)',
            sslRequired: 'external',
            groups: [
                {
                    id: 'group1',
                    name: 'admin-group',
                    path: '/admin-group',
                    attributes: {
                        department: ['IT'],
                        location: ['HQ'],
                        cost_center: ['CC001']
                    },
                    subGroups: [
                        {
                            id: 'subgroup1',
                            name: 'senior-admin',
                            path: '/admin-group/senior-admin',
                            attributes: {
                                level: ['senior']
                            }
                        }
                    ]
                },
                {
                    id: 'group2',
                    name: 'user-group',
                    path: '/user-group',
                    attributes: {
                        department: ['HR'],
                        access_level: ['standard']
                    }
                }
            ],
            users: [
                {
                    id: 'user1',
                    username: 'admin.user',
                    email: 'admin@enterprise.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    enabled: true,
                    emailVerified: true,
                    groups: ['/admin-group', '/admin-group/senior-admin'],
                    attributes: {
                        role: ['admin'],
                        employee_id: ['EMP001'],
                        department: ['IT']
                    },
                    credentials: [
                        {
                            type: 'password',
                            temporary: false,
                            value: 'admin123'
                        }
                    ],
                    realmRoles: ['admin', 'user'],
                    clientRoles: {
                        'test-client': ['client-admin']
                    }
                },
                {
                    id: 'user2',
                    username: 'standard.user',
                    email: 'user@enterprise.com',
                    firstName: 'Standard',
                    lastName: 'User',
                    enabled: true,
                    groups: ['/user-group'],
                    attributes: {
                        role: ['user'],
                        employee_id: ['EMP002']
                    }
                }
            ],
            roles: {
                realm: [
                    {
                        id: 'admin-role',
                        name: 'admin',
                        description: 'Administrator role with full access',
                        composite: true,
                        composites: {
                            realm: ['user'],
                            client: {
                                'test-client': ['client-admin']
                            }
                        },
                        attributes: {
                            category: ['system'],
                            level: ['high']
                        }
                    },
                    {
                        id: 'user-role',
                        name: 'user',
                        description: 'Standard user role',
                        composite: false,
                        attributes: {
                            category: ['standard'],
                            level: ['basic']
                        }
                    }
                ],
                client: {
                    'test-client': [
                        {
                            id: 'client-admin-role',
                            name: 'client-admin',
                            description: 'Client administrator role',
                            composite: false
                        }
                    ]
                }
            },
            clients: [
                {
                    id: 'client1',
                    clientId: 'test-client',
                    name: 'Test Client Application',
                    description: 'Enterprise test client application',
                    enabled: true,
                    protocol: 'openid-connect',
                    publicClient: false,
                    bearerOnly: false,
                    consentRequired: false,
                    standardFlowEnabled: true,
                    implicitFlowEnabled: false,
                    directAccessGrantsEnabled: true,
                    serviceAccountsEnabled: true,
                    authorizationServicesEnabled: true,
                    redirectUris: [
                        'https://app.enterprise.com/*',
                        'http://localhost:3000/*'
                    ],
                    webOrigins: [
                        'https://app.enterprise.com',
                        'http://localhost:3000'
                    ],
                    adminUrl: 'https://app.enterprise.com/admin',
                    baseUrl: 'https://app.enterprise.com',
                    rootUrl: 'https://app.enterprise.com',
                    attributes: {
                        'access.token.lifespan': '300',
                        'client.secret.creation.time': '1640995200',
                        'oauth2.device.authorization.grant.enabled': 'false',
                        'oidc.ciba.grant.enabled': 'false',
                        'backchannel.logout.session.required': 'true',
                        'backchannel.logout.revoke.offline.tokens': 'false'
                    },
                    protocolMappers: [
                        {
                            id: 'mapper1',
                            name: 'username',
                            protocol: 'openid-connect',
                            protocolMapper: 'oidc-usermodel-property-mapper',
                            consentRequired: false,
                            config: {
                                'userinfo.token.claim': 'true',
                                'user.attribute': 'username',
                                'id.token.claim': 'true',
                                'access.token.claim': 'true',
                                'claim.name': 'preferred_username',
                                'jsonType.label': 'String'
                            }
                        },
                        {
                            id: 'mapper2',
                            name: 'employee-id',
                            protocol: 'openid-connect',
                            protocolMapper: 'oidc-usermodel-attribute-mapper',
                            consentRequired: false,
                            config: {
                                'userinfo.token.claim': 'true',
                                'user.attribute': 'employee_id',
                                'id.token.claim': 'true',
                                'access.token.claim': 'true',
                                'claim.name': 'employee_id',
                                'jsonType.label': 'String'
                            }
                        }
                    ]
                }
            ],
            clientScopes: [
                {
                    id: 'custom-scope',
                    name: 'employee-data',
                    description: 'Employee specific data scope',
                    protocol: 'openid-connect',
                    attributes: {
                        'consent.screen.text': 'Employee Information',
                        'display.on.consent.screen': 'true'
                    },
                    protocolMappers: [
                        {
                            id: 'scope-mapper1',
                            name: 'department',
                            protocol: 'openid-connect',
                            protocolMapper: 'oidc-usermodel-attribute-mapper',
                            consentRequired: false,
                            config: {
                                'userinfo.token.claim': 'true',
                                'user.attribute': 'department',
                                'id.token.claim': 'false',
                                'access.token.claim': 'true',
                                'claim.name': 'department',
                                'jsonType.label': 'String'
                            }
                        }
                    ]
                }
            ],
            identityProviders: [
                {
                    alias: 'google',
                    displayName: 'Google SSO',
                    providerId: 'google',
                    enabled: true,
                    storeToken: false,
                    addReadTokenRoleOnCreate: false,
                    authenticateByDefault: false,
                    linkOnly: false,
                    firstBrokerLoginFlowAlias: 'first broker login',
                    config: {
                        clientId: 'google-client-id',
                        clientSecret: 'google-client-secret',
                        syncMode: 'IMPORT'
                    }
                },
                {
                    alias: 'enterprise-saml',
                    displayName: 'Enterprise SAML',
                    providerId: 'saml',
                    enabled: true,
                    config: {
                        singleSignOnServiceUrl: 'https://idp.enterprise.com/sso',
                        singleLogoutServiceUrl: 'https://idp.enterprise.com/slo',
                        entityId: 'https://idp.enterprise.com/metadata',
                        nameIDPolicyFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'
                    }
                }
            ],
            authenticationFlows: [
                {
                    alias: 'custom-browser',
                    description: 'Custom browser authentication flow',
                    providerId: 'basic-flow',
                    topLevel: true,
                    builtIn: false,
                    authenticationExecutions: [
                        {
                            authenticator: 'auth-cookie',
                            requirement: 'ALTERNATIVE',
                            priority: 10,
                            userSetupAllowed: false
                        },
                        {
                            authenticator: 'auth-spnego',
                            requirement: 'DISABLED',
                            priority: 20,
                            userSetupAllowed: false
                        },
                        {
                            authenticator: 'identity-provider-redirector',
                            requirement: 'ALTERNATIVE',
                            priority: 25,
                            userSetupAllowed: false
                        }
                    ]
                }
            ],
            components: [
                {
                    id: 'ldap-provider',
                    name: 'enterprise-ldap',
                    providerId: 'ldap',
                    subType: 'user-storage',
                    config: {
                        vendor: ['ad'],
                        connectionUrl: ['ldaps://ldap.enterprise.com:636'],
                        usersDn: ['CN=Users,DC=enterprise,DC=com'],
                        bindDn: ['CN=keycloak,CN=Users,DC=enterprise,DC=com'],
                        bindCredential: ['ldap-password'],
                        searchScope: ['2'],
                        usernameAttribute: ['sAMAccountName'],
                        uuidAttribute: ['objectGUID'],
                        userObjectClasses: ['person', 'organizationalPerson', 'user'],
                        connectionPooling: ['true'],
                        pagination: ['true'],
                        allowKerberosAuthentication: ['false'],
                        syncRegistrations: ['false'],
                        importEnabled: ['true'],
                        editMode: ['READ_ONLY'],
                        priority: ['0']
                    }
                }
            ],
            requiredActions: [
                {
                    alias: 'UPDATE_PASSWORD',
                    name: 'Update Password',
                    enabled: true,
                    defaultAction: false,
                    priority: 30,
                    config: {}
                },
                {
                    alias: 'VERIFY_EMAIL',
                    name: 'Verify Email',
                    enabled: true,
                    defaultAction: false,
                    priority: 50,
                    config: {}
                }
            ],
            eventsEnabled: true,
            eventsExpiration: 86400,
            eventsListeners: ['jboss-logging', 'email'],
            adminEventsEnabled: true,
            adminEventsDetailsEnabled: true,
            enabledEventTypes: [
                'LOGIN',
                'LOGIN_ERROR',
                'LOGOUT',
                'LOGOUT_ERROR',
                'UPDATE_PASSWORD',
                'UPDATE_PASSWORD_ERROR'
            ]
        }
    })

    describe('Complex Realm Conversion', () => {
        it('should convert complex realm with all components', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            expect(result).toBeDefined()
            expect(Array.isArray(result)).toBe(true)
            expect(result.length).toBeGreaterThan(15) // Should have many files

            // Check for main realm file
            const mainFile = result.find(f => f.filePath.endsWith('main.tf'))
            expect(mainFile).toBeDefined()
            expect(mainFile?.content).toContain('keycloak_realm')
            expect(mainFile?.content).toContain('enterprise-test')
        })

        it('should generate comprehensive groups module', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const groupsMainFile = result.find(f => f.filePath.includes('groups/main.tf'))
            const groupsVarsFile = result.find(f => f.filePath.includes('groups/variables.tf'))
            const groupsOutputFile = result.find(f => f.filePath.includes('groups/outputs.tf'))

            expect(groupsMainFile).toBeDefined()
            expect(groupsVarsFile).toBeDefined()
            expect(groupsOutputFile).toBeDefined()

            expect(groupsMainFile?.content).toContain('keycloak_group')
            expect(groupsMainFile?.content).toContain('for_each')
            expect(groupsMainFile?.content).toContain('var.groups')
            expect(groupsMainFile?.content).toContain('attributes')
            expect(groupsMainFile?.content).toContain('dynamic "attributes"')
        })

        it('should generate users module with complex attributes', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const usersMainFile = result.find(f => f.filePath.includes('users/main.tf'))
            expect(usersMainFile).toBeDefined()

            const content = usersMainFile?.content || ''
            expect(content).toContain('keycloak_user')
            expect(content).toContain('for_each')
            expect(content).toContain('var.users')
            expect(content).toContain('keycloak_user_groups')
            expect(content).toContain('dynamic "attributes"')
            expect(content).toContain('username')
        })

        it('should generate roles module with composite roles', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const rolesMainFile = result.find(f => f.filePath.includes('roles/main.tf'))
            expect(rolesMainFile).toBeDefined()

            const content = rolesMainFile?.content || ''
            expect(content).toContain('keycloak_role')
            expect(content).toContain('for_each')
            expect(content).toContain('var.realm_roles')
            expect(content).toContain('realm_id')
            expect(content).toContain('composite_roles')
        })

        it('should generate clients module with protocol mappers', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const clientsMainFile = result.find(f => f.filePath.includes('clients/main.tf'))
            expect(clientsMainFile).toBeDefined()

            const content = clientsMainFile?.content || ''
            expect(content).toContain('keycloak_openid_client')
            expect(content).toContain('for_each')
            expect(content).toContain('var.clients')
            expect(content).toContain('authorization_services')
            expect(content).toContain('service_accounts_enabled')
            expect(content).toContain('valid_redirect_uris')
        })

        it('should generate client scopes module', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const clientScopesFile = result.find(f => f.filePath.includes('client-scopes/main.tf'))
            expect(clientScopesFile).toBeDefined()

            const content = clientScopesFile?.content || ''
            expect(content).toContain('keycloak_openid_client_scope')
            expect(content).toContain('employee-data')
            expect(content).toContain('consent_screen_text')
        })

        it('should generate identity providers module', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const idpFile = result.find(f => f.filePath.includes('identity-providers/main.tf'))
            expect(idpFile).toBeDefined()

            const content = idpFile?.content || ''
            expect(content).toContain('keycloak_oidc_identity_provider')
            expect(content).toContain('keycloak_saml_identity_provider')
            expect(content).toContain('google')
            expect(content).toContain('enterprise-saml')
        })

        it('should generate user federation module for LDAP', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const userFedFile = result.find(f => f.filePath.includes('user-federation/main.tf'))
            expect(userFedFile).toBeDefined()

            const content = userFedFile?.content || ''
            expect(content).toContain('keycloak_ldap_user_federation')
            expect(content).toContain('enterprise-ldap')
            expect(content).toContain('connection_url')
            expect(content).toContain('users_dn')
        })

        it('should generate authentication flows module', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const authFlowsFile = result.find(f => f.filePath.includes('authentication-flows/main.tf'))
            expect(authFlowsFile).toBeDefined()

            const content = authFlowsFile?.content || ''
            expect(content).toContain('keycloak_authentication_flow')
            expect(content).toContain('keycloak_authentication_execution')
            expect(content).toContain('custom-browser')
        })

        it('should generate required actions module', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const requiredActionsFile = result.find(f => f.filePath.includes('required-actions/main.tf'))
            expect(requiredActionsFile).toBeDefined()

            const content = requiredActionsFile?.content || ''
            expect(content).toContain('keycloak_required_action')
            expect(content).toContain('UPDATE_PASSWORD')
            expect(content).toContain('VERIFY_EMAIL')
        })

        it('should have proper module dependencies', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            const mainFile = result.find(f => f.filePath.endsWith('main.tf'))
            expect(mainFile).toBeDefined()

            const content = mainFile?.content || ''
            // Check that modules have proper dependencies
            expect(content).toContain('depends_on = [module.roles, module.groups]')
            expect(content).toContain('module "roles"')
            expect(content).toContain('module "groups"')
            expect(content).toContain('module "users"')
            expect(content).toContain('module "clients"')
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle realm with no groups', () => {
            const realmWithoutGroups = { ...complexRealm, groups: undefined }
            const result = keycloakRealmJsonToTerragrunt(realmWithoutGroups, 'test.json')

            expect(result).toBeDefined()
            const groupsFile = result.find(f => f.filePath.includes('groups/'))
            expect(groupsFile).toBeUndefined()
        })

        it('should handle realm with empty arrays', () => {
            const minimalRealm = {
                realm: 'minimal-realm',
                enabled: true,
                groups: [],
                users: [],
                roles: { realm: [], client: {} },
                clients: []
            }

            const result = keycloakRealmJsonToTerragrunt(minimalRealm, 'minimal.json')

            expect(result).toBeDefined()
            expect(result.length).toBeGreaterThan(0)

            const mainFile = result.find(f => f.filePath.endsWith('main.tf'))
            expect(mainFile).toBeDefined()
            expect(mainFile?.content).toContain('keycloak_realm')
        })

        it('should handle malformed role structure', () => {
            const realmWithBadRoles = {
                realm: 'bad-roles-realm',
                enabled: true,
                roles: 'not-an-object'
            }

            const result = keycloakRealmJsonToTerragrunt(realmWithBadRoles, 'bad.json')

            expect(result).toBeDefined()
            const rolesFile = result.find(f => f.filePath.includes('roles/'))
            expect(rolesFile).toBeUndefined()
        })

        it('should handle null and undefined values gracefully', () => {
            const realmWithNulls = {
                realm: 'null-test',
                displayName: null,
                enabled: true,
                groups: [
                    {
                        name: 'test-group',
                        attributes: null
                    }
                ],
                users: [
                    {
                        username: 'test-user',
                        email: undefined,
                        attributes: {}
                    }
                ]
            }

            const result = keycloakRealmJsonToTerragrunt(realmWithNulls, 'null-test.json')

            expect(result).toBeDefined()
            expect(result.length).toBeGreaterThan(0)
        })

        it('should validate Terraform syntax in generated files', () => {
            const result = keycloakRealmJsonToTerragrunt(complexRealm, 'enterprise-test.json')

            result.forEach(file => {
                // Basic Terraform syntax validation
                expect(file.content).not.toContain('undefined')
                expect(file.content).not.toContain('null')

                // Check for proper resource blocks
                if (file.content.includes('resource "')) {
                    expect(file.content).toMatch(/resource\s+"[^"]+"\s+"[^"]+"\s*{/)
                }

                // Check for proper variable blocks
                if (file.content.includes('variable "')) {
                    expect(file.content).toMatch(/variable\s+"[^"]+"\s*{/)
                }

                // Check for proper output blocks
                if (file.content.includes('output "')) {
                    expect(file.content).toMatch(/output\s+"[^"]+"\s*{/)
                }
            })
        })
    })

    describe('Performance and Scalability', () => {
        it('should handle large number of users efficiently', () => {
            const largeRealm = {
                realm: 'large-realm',
                enabled: true,
                users: Array.from({ length: 1000 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`,
                    enabled: true,
                    attributes: {
                        employee_id: [`EMP${i.toString().padStart(4, '0')}`],
                        department: [i % 10 === 0 ? 'IT' : 'General']
                    }
                }))
            }

            const startTime = Date.now()
            const result = keycloakRealmJsonToTerragrunt(largeRealm, 'large-realm.json')
            const endTime = Date.now()

            expect(result).toBeDefined()
            expect(endTime - startTime).toBeLessThan(5000) // Should complete in under 5 seconds

            const usersFile = result.find(f => f.filePath.includes('users/main.tf'))
            expect(usersFile?.content).toContain('user-0')
            expect(usersFile?.content).toContain('user-999')
        })

        it('should handle deeply nested group hierarchies', () => {
            const realmWithNestedGroups = {
                realm: 'nested-groups-realm',
                enabled: true,
                groups: [
                    {
                        name: 'level-1',
                        path: '/level-1',
                        subGroups: [
                            {
                                name: 'level-2',
                                path: '/level-1/level-2',
                                subGroups: [
                                    {
                                        name: 'level-3',
                                        path: '/level-1/level-2/level-3',
                                        subGroups: [
                                            {
                                                name: 'level-4',
                                                path: '/level-1/level-2/level-3/level-4'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            const result = keycloakRealmJsonToTerragrunt(realmWithNestedGroups, 'nested.json')

            expect(result).toBeDefined()
            const groupsFile = result.find(f => f.filePath.includes('groups/main.tf'))
            expect(groupsFile?.content).toContain('level-1')
            expect(groupsFile?.content).toContain('level-4')
        })
    })
})
