
import { ResourceDetails, TerraformFile } from "./types";
import { ResourceCount } from "@/utils/terraformResourceAnalyzer";

export const getResourceDetails = (resource: ResourceCount, files: string[]): ResourceDetails => {
  const hasJsonData = resource.actualResources! > 0;
  const hasTerraformBlocks = resource.terraformBlocks! > 0;
  
  let status: ResourceDetails['status'] = 'missing';
  if (hasJsonData && hasTerraformBlocks) {
    status = 'configured';
  } else if (hasJsonData || hasTerraformBlocks) {
    status = 'partial';
  }

  const priority = getPriority(resource.type);
  const coverage = hasJsonData ? Math.min(100, (resource.terraformBlocks! / resource.actualResources!) * 100) : 0;
  
  return {
    status,
    priority,
    coverage,
    examples: getResourceExamples(resource.type, resource.count),
    recommendations: getResourceRecommendations(resource.type, status)
  };
};

export const getPriority = (type: string): ResourceDetails['priority'] => {
  const highPriority = ['realm', 'clients', 'users', 'roles'];
  const mediumPriority = ['groups', 'flows', 'identity_providers'];
  
  if (highPriority.includes(type)) return 'high';
  if (mediumPriority.includes(type)) return 'medium';
  return 'low';
};

export const getResourceExamples = (type: string, count: number): string[] => {
  const examples: { [key: string]: string[] } = {
    realm: [`${count} realm configuration`],
    roles: [`${count} roles including admin, user, viewer`],
    groups: [`${count} groups for organization structure`],
    users: [`${count} user accounts with credentials`],
    clients: [`${count} OAuth/OIDC client applications`],
    scopes: [`${count} permission scopes for API access`],
    flows: [`${count} authentication flows and steps`],
    identity_providers: [`${count} external identity providers`],
    mappers: [`${count} attribute mappers for claims`],
    group_memberships: [`${count} user-group relationships`],
    role_mappings: [`${count} user-role assignments`],
    client_roles: [`${count} client-specific roles`],
    executors: [`${count} authentication executors`]
  };
  
  return examples[type] || [`${count} ${type} resources`];
};

export const getResourceRecommendations = (type: string, status: ResourceDetails['status']): string[] => {
  if (status === 'configured') return ['✅ Fully configured'];
  
  const recommendations: { [key: string]: string[] } = {
    realm: ['Configure realm settings', 'Set up security policies'],
    roles: ['Define role hierarchy', 'Set up composite roles'],
    groups: ['Organize users into groups', 'Set up group permissions'],
    users: ['Configure user attributes', 'Set up user credentials'],
    clients: ['Configure OAuth flows', 'Set up client scopes'],
    scopes: ['Define permission boundaries', 'Map to user attributes'],
    flows: ['Customize authentication', 'Add MFA steps'],
    identity_providers: ['Configure SSO', 'Map external attributes'],
    mappers: ['Map user claims', 'Configure token content'],
    group_memberships: ['Assign users to groups', 'Review membership rules'],
    role_mappings: ['Assign roles to users', 'Review permissions'],
    client_roles: ['Define client permissions', 'Set up role hierarchy'],
    executors: ['Configure auth steps', 'Set up conditions']
  };
  
  return recommendations[type] || ['Review configuration'];
};

export const getFilesForResourceType = (resourceType: string, files: TerraformFile[]): string[] => {
  const foundFiles: string[] = [];
  
  files.forEach(file => {
    const hasResources = hasResourceTypeInContent(resourceType, file.content);
    const hasJsonData = file.parsed && hasResourceTypeInJson(resourceType, file.parsed);
    
    if (hasResources || hasJsonData) {
      foundFiles.push(file.filePath);
    }
  });
  
  return [...new Set(foundFiles)];
};

function hasResourceTypeInContent(resourceType: string, content: string): boolean {
  const patterns = {
    realm: [/resource\s+"keycloak_realm"/g],
    roles: [/resource\s+"keycloak_role"/g],
    groups: [/resource\s+"keycloak_group"/g],
    users: [/resource\s+"keycloak_user"/g],
    clients: [/resource\s+"keycloak_openid_client"/g, /resource\s+"keycloak_saml_client"/g],
    scopes: [/resource\s+"keycloak_openid_client_scope"/g],
    flows: [/resource\s+"keycloak_authentication_flow"/g],
    identity_providers: [/resource\s+"keycloak_oidc_identity_provider"/g, /resource\s+"keycloak_saml_identity_provider"/g],
    mappers: [/resource\s+"keycloak_openid_client_scope_mapper"/g, /resource\s+"keycloak_openid_protocol_mapper"/g],
    group_memberships: [/resource\s+"keycloak_group_membership"/g],
    role_mappings: [/resource\s+"keycloak_user_roles"/g, /resource\s+"keycloak_group_roles"/g],
    client_roles: [/resource\s+"keycloak_client_role"/g],
    executors: [/resource\s+"keycloak_authentication_execution"/g]
  };
  
  const resourcePatterns = patterns[resourceType as keyof typeof patterns] || [];
  return resourcePatterns.some(pattern => pattern.test(content));
}

function hasResourceTypeInJson(resourceType: string, jsonData: any): boolean {
  const jsonPaths: { [key: string]: string } = {
    realm: 'realm',
    roles: 'roles.realm',
    groups: 'groups',
    users: 'users',
    clients: 'clients',
    scopes: 'clientScopes',
    flows: 'authenticationFlows',
    identity_providers: 'identityProviders',
    mappers: 'protocolMappers',
    group_memberships: 'users',
    role_mappings: 'users',
    client_roles: 'clients',
    executors: 'authenticationFlows'
  };
  
  const path = jsonPaths[resourceType];
  if (!path) return false;
  
  const data = getNestedValue(jsonData, path);
  
  switch (resourceType) {
    case 'realm':
      return !!jsonData?.realm;
    case 'group_memberships':
      const users = jsonData?.users || [];
      return users.some((user: any) => user.groups && user.groups.length > 0);
    case 'role_mappings':
      const usersWithRoles = jsonData?.users || [];
      return usersWithRoles.some((user: any) => 
        (user.realmRoles && user.realmRoles.length > 0) || 
        (user.clientRoles && Object.keys(user.clientRoles).length > 0)
      );
    case 'client_roles':
      const clients = jsonData?.clients || [];
      return clients.some((client: any) => client.roles && client.roles.length > 0);
    case 'executors':
      const flows = jsonData?.authenticationFlows || [];
      return flows.some((flow: any) => flow.authenticationExecutions && flow.authenticationExecutions.length > 0);
    case 'mappers':
      const clientMappers = (jsonData?.clients || []).some((client: any) => 
        client.protocolMappers && client.protocolMappers.length > 0
      );
      const scopeMappers = (jsonData?.clientScopes || []).some((scope: any) => 
        scope.protocolMappers && scope.protocolMappers.length > 0
      );
      return clientMappers || scopeMappers;
    default:
      return Array.isArray(data) && data.length > 0;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
