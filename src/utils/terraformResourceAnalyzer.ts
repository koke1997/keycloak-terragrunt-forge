
export interface ResourcePattern {
  type: string;
  patterns: RegExp[];
  description: string;
}

export interface ResourceCount {
  type: string;
  count: number;
  description: string;
}

export interface ResourceTypeConfig {
  icon: React.ReactNode;
  color: string;
  description: string;
}

export const KEYCLOAK_RESOURCE_PATTERNS: ResourcePattern[] = [
  {
    type: 'realm',
    patterns: [
      /resource\s+"keycloak_realm"\s+"[^"]*"/g,
      /resource\s+"keycloak_realm"\s+\w+/g
    ],
    description: 'Keycloak realms'
  },
  {
    type: 'roles',
    patterns: [
      /resource\s+"keycloak_role"\s+"[^"]*"/g,
      /resource\s+"keycloak_role"\s+\w+/g
    ],
    description: 'Realm and client roles'
  },
  {
    type: 'groups',
    patterns: [
      /resource\s+"keycloak_group"\s+"[^"]*"/g,
      /resource\s+"keycloak_group"\s+\w+/g,
      /resource\s+"keycloak_groups"\s+"[^"]*"/g,
      /resource\s+"keycloak_groups"\s+\w+/g
    ],
    description: 'User groups'
  },
  {
    type: 'users',
    patterns: [
      /resource\s+"keycloak_user"\s+"[^"]*"/g,
      /resource\s+"keycloak_user"\s+\w+/g
    ],
    description: 'Keycloak users'
  },
  {
    type: 'clients',
    patterns: [
      /resource\s+"keycloak_openid_client"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client"\s+\w+/g,
      /resource\s+"keycloak_saml_client"\s+"[^"]*"/g,
      /resource\s+"keycloak_saml_client"\s+\w+/g
    ],
    description: 'OAuth/OIDC clients'
  },
  {
    type: 'scopes',
    patterns: [
      /resource\s+"keycloak_openid_client_scope"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client_scope"\s+\w+/g
    ],
    description: 'Client scopes'
  },
  {
    type: 'flows',
    patterns: [
      /resource\s+"keycloak_authentication_flow"\s+"[^"]*"/g,
      /resource\s+"keycloak_authentication_flow"\s+\w+/g
    ],
    description: 'Authentication flows'
  },
  {
    type: 'identity_providers',
    patterns: [
      /resource\s+"keycloak_oidc_identity_provider"\s+"[^"]*"/g,
      /resource\s+"keycloak_oidc_identity_provider"\s+\w+/g,
      /resource\s+"keycloak_saml_identity_provider"\s+"[^"]*"/g,
      /resource\s+"keycloak_saml_identity_provider"\s+\w+/g
    ],
    description: 'Identity providers'
  },
  {
    type: 'mappers',
    patterns: [
      /resource\s+"keycloak_openid_client_scope_mapper"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client_scope_mapper"\s+\w+/g,
      /resource\s+"keycloak_openid_protocol_mapper"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_protocol_mapper"\s+\w+/g
    ],
    description: 'Scope mappers'
  },
  {
    type: 'group_memberships',
    patterns: [
      /resource\s+"keycloak_group_memberships"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_memberships"\s+\w+/g,
      /resource\s+"keycloak_group_membership"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_membership"\s+\w+/g
    ],
    description: 'Group memberships'
  },
  {
    type: 'role_mappings',
    patterns: [
      /resource\s+"keycloak_user_roles"\s+"[^"]*"/g,
      /resource\s+"keycloak_user_roles"\s+\w+/g,
      /resource\s+"keycloak_group_roles"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_roles"\s+\w+/g
    ],
    description: 'User role mappings'
  },
  {
    type: 'client_roles',
    patterns: [
      /resource\s+"keycloak_client_role"\s+"[^"]*"/g,
      /resource\s+"keycloak_client_role"\s+\w+/g
    ],
    description: 'Client roles'
  },
  {
    type: 'executors',
    patterns: [
      /resource\s+"keycloak_authentication_execution"\s+"[^"]*"/g,
      /resource\s+"keycloak_authentication_execution"\s+\w+/g
    ],
    description: 'Auth executors'
  }
];

export function analyzeResourcesInFiles(files: Array<{ filePath: string; content: string }>): ResourceCount[] {
  const resourceCounts: { [key: string]: number } = {};
  
  console.log('Starting resource analysis for', files.length, 'files');

  files.forEach((file, index) => {
    console.log(`Analyzing file ${index + 1}: ${file.filePath}`);
    console.log(`File content preview (first 200 chars):`, file.content.substring(0, 200));
    
    KEYCLOAK_RESOURCE_PATTERNS.forEach(({ type, patterns, description }) => {
      let typeCount = 0;
      
      patterns.forEach((pattern) => {
        const matches = file.content.match(pattern);
        if (matches) {
          typeCount += matches.length;
          console.log(`Found ${matches.length} ${type} resources with pattern ${pattern} in ${file.filePath}`);
          console.log('Matches:', matches);
        }
      });
      
      if (typeCount > 0) {
        resourceCounts[type] = (resourceCounts[type] || 0) + typeCount;
        console.log(`Total ${type} count now: ${resourceCounts[type]}`);
      }
    });
  });

  console.log('Final resource counts:', resourceCounts);

  return Object.entries(resourceCounts)
    .map(([type, count]) => ({
      type,
      count,
      description: KEYCLOAK_RESOURCE_PATTERNS.find(p => p.type === type)?.description || `${type} resources`
    }))
    .sort((a, b) => b.count - a.count);
}
