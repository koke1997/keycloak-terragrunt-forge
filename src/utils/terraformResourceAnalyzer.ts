
export interface ResourcePattern {
  type: string;
  patterns: RegExp[];
  description: string;
  jsonPath?: string; // Path to the resource in the JSON structure
}

export interface ResourceCount {
  type: string;
  count: number;
  description: string;
  terraformBlocks?: number; // Number of Terraform resource blocks
  actualResources?: number; // Actual number of resources from JSON
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
    description: 'Keycloak realms',
    jsonPath: 'realm'
  },
  {
    type: 'roles',
    patterns: [
      /resource\s+"keycloak_role"\s+"[^"]*"/g,
      /resource\s+"keycloak_role"\s+\w+/g
    ],
    description: 'Realm and client roles',
    jsonPath: 'roles.realm'
  },
  {
    type: 'groups',
    patterns: [
      /resource\s+"keycloak_group"\s+"[^"]*"/g,
      /resource\s+"keycloak_group"\s+\w+/g,
      /resource\s+"keycloak_groups"\s+"[^"]*"/g,
      /resource\s+"keycloak_groups"\s+\w+/g
    ],
    description: 'User groups',
    jsonPath: 'groups'
  },
  {
    type: 'users',
    patterns: [
      /resource\s+"keycloak_user"\s+"[^"]*"/g,
      /resource\s+"keycloak_user"\s+\w+/g
    ],
    description: 'Keycloak users',
    jsonPath: 'users'
  },
  {
    type: 'clients',
    patterns: [
      /resource\s+"keycloak_openid_client"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client"\s+\w+/g,
      /resource\s+"keycloak_saml_client"\s+"[^"]*"/g,
      /resource\s+"keycloak_saml_client"\s+\w+/g
    ],
    description: 'OAuth/OIDC clients',
    jsonPath: 'clients'
  },
  {
    type: 'scopes',
    patterns: [
      /resource\s+"keycloak_openid_client_scope"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client_scope"\s+\w+/g
    ],
    description: 'Client scopes',
    jsonPath: 'clientScopes'
  },
  {
    type: 'flows',
    patterns: [
      /resource\s+"keycloak_authentication_flow"\s+"[^"]*"/g,
      /resource\s+"keycloak_authentication_flow"\s+\w+/g
    ],
    description: 'Authentication flows',
    jsonPath: 'authenticationFlows'
  },
  {
    type: 'identity_providers',
    patterns: [
      /resource\s+"keycloak_oidc_identity_provider"\s+"[^"]*"/g,
      /resource\s+"keycloak_oidc_identity_provider"\s+\w+/g,
      /resource\s+"keycloak_saml_identity_provider"\s+"[^"]*"/g,
      /resource\s+"keycloak_saml_identity_provider"\s+\w+/g
    ],
    description: 'Identity providers',
    jsonPath: 'identityProviders'
  },
  {
    type: 'mappers',
    patterns: [
      /resource\s+"keycloak_openid_client_scope_mapper"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_client_scope_mapper"\s+\w+/g,
      /resource\s+"keycloak_openid_protocol_mapper"\s+"[^"]*"/g,
      /resource\s+"keycloak_openid_protocol_mapper"\s+\w+/g
    ],
    description: 'Scope mappers',
    jsonPath: 'protocolMappers'
  },
  {
    type: 'group_memberships',
    patterns: [
      /resource\s+"keycloak_group_memberships"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_memberships"\s+\w+/g,
      /resource\s+"keycloak_group_membership"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_membership"\s+\w+/g
    ],
    description: 'Group memberships',
    jsonPath: 'users'
  },
  {
    type: 'role_mappings',
    patterns: [
      /resource\s+"keycloak_user_roles"\s+"[^"]*"/g,
      /resource\s+"keycloak_user_roles"\s+\w+/g,
      /resource\s+"keycloak_group_roles"\s+"[^"]*"/g,
      /resource\s+"keycloak_group_roles"\s+\w+/g
    ],
    description: 'User role mappings',
    jsonPath: 'users'
  },
  {
    type: 'client_roles',
    patterns: [
      /resource\s+"keycloak_client_role"\s+"[^"]*"/g,
      /resource\s+"keycloak_client_role"\s+\w+/g
    ],
    description: 'Client roles',
    jsonPath: 'clients'
  },
  {
    type: 'executors',
    patterns: [
      /resource\s+"keycloak_authentication_execution"\s+"[^"]*"/g,
      /resource\s+"keycloak_authentication_execution"\s+\w+/g
    ],
    description: 'Auth executors',
    jsonPath: 'authenticationFlows'
  }
];

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function countResourcesInJson(jsonData: any, resourceType: string): number {
  const pattern = KEYCLOAK_RESOURCE_PATTERNS.find(p => p.type === resourceType);
  if (!pattern?.jsonPath) return 0;

  const data = getNestedValue(jsonData, pattern.jsonPath);
  
  console.log(`Counting ${resourceType} from JSON path '${pattern.jsonPath}':`, data);

  if (Array.isArray(data)) {
    return data.length;
  }

  // Special cases for complex counting
  switch (resourceType) {
    case 'realm':
      return jsonData?.realm ? 1 : 0;
    
    case 'group_memberships':
      // Count users that have group memberships
      const users = jsonData?.users || [];
      return users.filter((user: any) => user.groups && user.groups.length > 0).length;
    
    case 'role_mappings':
      // Count users that have role mappings
      const usersWithRoles = jsonData?.users || [];
      return usersWithRoles.filter((user: any) => 
        (user.realmRoles && user.realmRoles.length > 0) || 
        (user.clientRoles && Object.keys(user.clientRoles).length > 0)
      ).length;
    
    case 'client_roles':
      // Count total client roles across all clients
      const clients = jsonData?.clients || [];
      return clients.reduce((total: number, client: any) => {
        const roles = client.roles || [];
        return total + roles.length;
      }, 0);
    
    case 'executors':
      // Count authentication executions across all flows
      const flows = jsonData?.authenticationFlows || [];
      return flows.reduce((total: number, flow: any) => {
        const executions = flow.authenticationExecutions || [];
        return total + executions.length;
      }, 0);
    
    case 'mappers':
      // Count protocol mappers across clients and client scopes
      const clientMappers = (jsonData?.clients || []).reduce((total: number, client: any) => {
        const mappers = client.protocolMappers || [];
        return total + mappers.length;
      }, 0);
      
      const scopeMappers = (jsonData?.clientScopes || []).reduce((total: number, scope: any) => {
        const mappers = scope.protocolMappers || [];
        return total + mappers.length;
      }, 0);
      
      return clientMappers + scopeMappers;
    
    default:
      return 0;
  }
}

export function analyzeResourcesInFiles(files: Array<{ filePath: string; content: string; parsed?: any }>): ResourceCount[] {
  const resourceCounts: { [key: string]: ResourceCount } = {};
  
  console.log('Starting enhanced resource analysis for', files.length, 'files');

  files.forEach((file, index) => {
    console.log(`Analyzing file ${index + 1}: ${file.filePath}`);
    
    // Count Terraform resource blocks
    KEYCLOAK_RESOURCE_PATTERNS.forEach(({ type, patterns, description }) => {
      let terraformBlockCount = 0;
      
      patterns.forEach((pattern) => {
        const matches = file.content.match(pattern);
        if (matches) {
          terraformBlockCount += matches.length;
        }
      });
      
      if (terraformBlockCount > 0) {
        if (!resourceCounts[type]) {
          resourceCounts[type] = {
            type,
            count: 0,
            description,
            terraformBlocks: 0,
            actualResources: 0
          };
        }
        resourceCounts[type].terraformBlocks! += terraformBlockCount;
      }
    });

    // Count actual resources from JSON data if available
    if (file.parsed && typeof file.parsed === 'object') {
      console.log('Analyzing JSON data for actual resource counts');
      
      KEYCLOAK_RESOURCE_PATTERNS.forEach(({ type, description }) => {
        const jsonCount = countResourcesInJson(file.parsed, type);
        
        if (jsonCount > 0) {
          if (!resourceCounts[type]) {
            resourceCounts[type] = {
              type,
              count: 0,
              description,
              terraformBlocks: 0,
              actualResources: 0
            };
          }
          resourceCounts[type].actualResources! += jsonCount;
          console.log(`Found ${jsonCount} actual ${type} resources in JSON`);
        }
      });
    }
  });

  // Set the main count to actual resources if available, otherwise terraform blocks
  Object.values(resourceCounts).forEach(resource => {
    resource.count = resource.actualResources! > 0 ? resource.actualResources! : resource.terraformBlocks!;
  });

  console.log('Final enhanced resource counts:', resourceCounts);

  return Object.values(resourceCounts)
    .filter(resource => resource.count > 0)
    .sort((a, b) => b.count - a.count);
}
