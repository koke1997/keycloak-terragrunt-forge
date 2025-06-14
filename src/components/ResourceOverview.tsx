import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Users, 
  Shield, 
  Settings, 
  Key, 
  Workflow, 
  Globe,
  Lock,
  UserCheck,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { analyzeResourcesInFiles, ResourceCount } from "@/utils/terraformResourceAnalyzer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TerraformFile {
  filePath: string;
  content: string;
  parsed?: any;
}

interface ResourceOverviewProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface EnhancedResourceCount extends ResourceCount {
  icon: React.ReactNode;
  color: string;
  files: string[];
}

export function ResourceOverview({ terragruntFiles, realmName }: ResourceOverviewProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (resourceType: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(resourceType)) {
      newExpanded.delete(resourceType);
    } else {
      newExpanded.add(resourceType);
    }
    setExpandedSections(newExpanded);
  };

  const getResourceTypeConfig = (type: string) => {
    const configs = {
      realm: { icon: <Database className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
      roles: { icon: <Shield className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
      groups: { icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
      users: { icon: <UserCheck className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
      clients: { icon: <Settings className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-800' },
      scopes: { icon: <Layers className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
      flows: { icon: <Workflow className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-800' },
      identity_providers: { icon: <Globe className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
      mappers: { icon: <Key className="w-4 h-4" />, color: 'bg-teal-100 text-teal-800' },
      group_memberships: { icon: <Users className="w-4 h-4" />, color: 'bg-lime-100 text-lime-800' },
      role_mappings: { icon: <Shield className="w-4 h-4" />, color: 'bg-violet-100 text-violet-800' },
      client_roles: { icon: <Lock className="w-4 h-4" />, color: 'bg-rose-100 text-rose-800' },
      executors: { icon: <Workflow className="w-4 h-4" />, color: 'bg-amber-100 text-amber-800' }
    };
    
    return configs[type as keyof typeof configs] || { 
      icon: <Settings className="w-4 h-4" />, 
      color: 'bg-gray-100 text-gray-800' 
    };
  };

  const resourceAnalysis = analyzeResourcesInFiles(terragruntFiles);
  
  const enhancedResources: EnhancedResourceCount[] = resourceAnalysis.map(resource => ({
    ...resource,
    ...getResourceTypeConfig(resource.type),
    files: getFilesForResourceType(resource.type, terragruntFiles)
  }));

  const totalResources = enhancedResources.reduce((sum, r) => sum + r.count, 0);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Resource Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {enhancedResources.map(resource => (
              <Collapsible 
                key={resource.type}
                open={expandedSections.has(resource.type)}
                onOpenChange={() => toggleSection(resource.type)}
              >
                <div className="border rounded-lg hover:bg-gray-50">
                  <CollapsibleTrigger className="w-full p-3 text-left">
                    <div className="flex items-center gap-3">
                      {resource.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-2xl">{resource.count}</span>
                          <Badge className={resource.color}>
                            {resource.type.replace('_', ' ')}
                          </Badge>
                          {(resource.actualResources! > 0 && resource.terraformBlocks! > 0) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div>Actual resources: {resource.actualResources}</div>
                                  <div>Terraform blocks: {resource.terraformBlocks}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {expandedSections.has(resource.type) ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                        {resource.actualResources! > 0 && resource.terraformBlocks! > 0 && 
                         resource.actualResources !== resource.terraformBlocks && (
                          <p className="text-xs text-gray-500 mt-1">
                            {resource.terraformBlocks} Terraform block{resource.terraformBlocks !== 1 ? 's' : ''} → {resource.actualResources} resource{resource.actualResources !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-3 pb-3 border-t bg-gray-50/50">
                      <div className="pt-3">
                        <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Found in files:
                        </h4>
                        {resource.files.length > 0 ? (
                          <div className="space-y-1">
                            {resource.files.map((file, index) => (
                              <div key={index} className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                                {file}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No source files detected</p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
          
          {enhancedResources.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No Keycloak resources detected in the uploaded files.</p>
              <p className="text-sm mt-2">Make sure your files contain valid Terraform resource definitions or Keycloak JSON data.</p>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Resources</span>
              <span className="font-semibold text-lg">{totalResources}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">Target Realm</span>
              <span className="font-medium">{realmName}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">Files Analyzed</span>
              <span className="font-medium">{terragruntFiles.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function getFilesForResourceType(resourceType: string, files: TerraformFile[]): string[] {
  const foundFiles: string[] = [];
  
  files.forEach(file => {
    // Check for Terraform resource patterns
    const hasResources = hasResourceTypeInContent(resourceType, file.content);
    
    // Check for JSON data
    const hasJsonData = file.parsed && hasResourceTypeInJson(resourceType, file.parsed);
    
    if (hasResources || hasJsonData) {
      foundFiles.push(file.filePath);
    }
  });
  
  return [...new Set(foundFiles)]; // Remove duplicates
}

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
