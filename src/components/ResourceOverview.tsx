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
  FileText,
  BarChart3,
  Activity,
  Target
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
  bgColor: string;
  borderColor: string;
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
      realm: { 
        icon: <Database className="w-5 h-5" />, 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        borderColor: 'border-blue-200'
      },
      roles: { 
        icon: <Shield className="w-5 h-5" />, 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50 hover:bg-purple-100',
        borderColor: 'border-purple-200'
      },
      groups: { 
        icon: <Users className="w-5 h-5" />, 
        color: 'text-green-700', 
        bgColor: 'bg-green-50 hover:bg-green-100',
        borderColor: 'border-green-200'
      },
      users: { 
        icon: <UserCheck className="w-5 h-5" />, 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-50 hover:bg-orange-100',
        borderColor: 'border-orange-200'
      },
      clients: { 
        icon: <Settings className="w-5 h-5" />, 
        color: 'text-cyan-700', 
        bgColor: 'bg-cyan-50 hover:bg-cyan-100',
        borderColor: 'border-cyan-200'
      },
      scopes: { 
        icon: <Layers className="w-5 h-5" />, 
        color: 'text-pink-700', 
        bgColor: 'bg-pink-50 hover:bg-pink-100',
        borderColor: 'border-pink-200'
      },
      flows: { 
        icon: <Workflow className="w-5 h-5" />, 
        color: 'text-indigo-700', 
        bgColor: 'bg-indigo-50 hover:bg-indigo-100',
        borderColor: 'border-indigo-200'
      },
      identity_providers: { 
        icon: <Globe className="w-5 h-5" />, 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-50 hover:bg-yellow-100',
        borderColor: 'border-yellow-200'
      },
      mappers: { 
        icon: <Key className="w-5 h-5" />, 
        color: 'text-teal-700', 
        bgColor: 'bg-teal-50 hover:bg-teal-100',
        borderColor: 'border-teal-200'
      },
      group_memberships: { 
        icon: <Users className="w-5 h-5" />, 
        color: 'text-lime-700', 
        bgColor: 'bg-lime-50 hover:bg-lime-100',
        borderColor: 'border-lime-200'
      },
      role_mappings: { 
        icon: <Shield className="w-5 h-5" />, 
        color: 'text-violet-700', 
        bgColor: 'bg-violet-50 hover:bg-violet-100',
        borderColor: 'border-violet-200'
      },
      client_roles: { 
        icon: <Lock className="w-5 h-5" />, 
        color: 'text-rose-700', 
        bgColor: 'bg-rose-50 hover:bg-rose-100',
        borderColor: 'border-rose-200'
      },
      executors: { 
        icon: <Workflow className="w-5 h-5" />, 
        color: 'text-amber-700', 
        bgColor: 'bg-amber-50 hover:bg-amber-100',
        borderColor: 'border-amber-200'
      }
    };
    
    return configs[type as keyof typeof configs] || { 
      icon: <Settings className="w-5 h-5" />, 
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      borderColor: 'border-gray-200'
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
      <div className="space-y-6">
        {/* Header Section */}
        <Card className="border-2 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              Resource Overview Dashboard
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of your Keycloak infrastructure resources
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Resources</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{totalResources}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Target Realm</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1 truncate">{realmName}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Files Analyzed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{terragruntFiles.length}</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Resource Types</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{enhancedResources.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enhancedResources.map(resource => (
            <Collapsible 
              key={resource.type}
              open={expandedSections.has(resource.type)}
              onOpenChange={() => toggleSection(resource.type)}
            >
              <Card className={`transition-all duration-300 hover:shadow-lg ${resource.borderColor} border-2`}>
                <CollapsibleTrigger className="w-full">
                  <CardContent className={`p-6 ${resource.bgColor} transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white shadow-sm ${resource.color}`}>
                          {resource.icon}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold ${resource.color}`}>
                              {resource.count}
                            </span>
                            {(resource.actualResources! > 0 && resource.terraformBlocks! > 0) && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Actual resources:</strong> {resource.actualResources}</div>
                                    <div><strong>Terraform blocks:</strong> {resource.terraformBlocks}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-600 capitalize">
                            {resource.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {resource.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={`${resource.color} border-current`}>
                          {resource.files.length} file{resource.files.length !== 1 ? 's' : ''}
                        </Badge>
                        {expandedSections.has(resource.type) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {resource.actualResources! > 0 && resource.terraformBlocks! > 0 && 
                     resource.actualResources !== resource.terraformBlocks && (
                      <div className="mt-3 pt-3 border-t border-white/50">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Terraform blocks: {resource.terraformBlocks}</span>
                          <span>→</span>
                          <span>Actual resources: {resource.actualResources}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-0">
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Source Files ({resource.files.length})
                      </h4>
                      {resource.files.length > 0 ? (
                        <div className="space-y-2">
                          {resource.files.map((file, index) => (
                            <div key={index} className="group">
                              <div className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-md border group-hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700">{file.split('/').pop()}</span>
                                  <span className="text-gray-400">{file.split('/').slice(0, -1).join('/')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 text-sm italic">No source files detected</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
        
        {enhancedResources.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No Resources Detected</h3>
                  <p className="text-gray-600 mt-2">
                    No Keycloak resources were found in the uploaded files.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Make sure your files contain valid Terraform resource definitions or Keycloak JSON data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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
