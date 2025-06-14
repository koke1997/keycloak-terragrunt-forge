import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PieChart,
  Hash,
  Clock,
  MapPin
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
  details: ResourceDetails;
}

interface ResourceDetails {
  status: 'configured' | 'partial' | 'missing';
  priority: 'high' | 'medium' | 'low';
  coverage: number;
  examples: string[];
  recommendations: string[];
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

  const getResourceDetails = (resource: ResourceCount, files: string[]): ResourceDetails => {
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

  const getPriority = (type: string): ResourceDetails['priority'] => {
    const highPriority = ['realm', 'clients', 'users', 'roles'];
    const mediumPriority = ['groups', 'flows', 'identity_providers'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  };

  const getResourceExamples = (type: string, count: number): string[] => {
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

  const getResourceRecommendations = (type: string, status: ResourceDetails['status']): string[] => {
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

  const resourceAnalysis = analyzeResourcesInFiles(terragruntFiles);
  
  const enhancedResources: EnhancedResourceCount[] = resourceAnalysis.map(resource => {
    const files = getFilesForResourceType(resource.type, terragruntFiles);
    const config = getResourceTypeConfig(resource.type);
    const details = getResourceDetails(resource, files);
    
    return {
      ...resource,
      ...config,
      files,
      details
    };
  });

  const totalResources = enhancedResources.reduce((sum, r) => sum + r.count, 0);
  const configuredResources = enhancedResources.filter(r => r.details.status === 'configured').length;
  const partialResources = enhancedResources.filter(r => r.details.status === 'partial').length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Header Section */}
        <Card className="border-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Resource Overview Dashboard
              <Badge variant="outline" className="ml-auto">
                {enhancedResources.length} Types
              </Badge>
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of your Keycloak infrastructure resources with actionable insights
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Resources</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{totalResources}</div>
                <div className="text-xs text-gray-500 mt-1">Across all types</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Configured</span>
                </div>
                <div className="text-2xl font-bold text-green-700 mt-1">{configuredResources}</div>
                <div className="text-xs text-gray-500 mt-1">Fully configured</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Partial</span>
                </div>
                <div className="text-2xl font-bold text-orange-700 mt-1">{partialResources}</div>
                <div className="text-xs text-gray-500 mt-1">Needs attention</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Target Realm</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 mt-1 truncate">{realmName}</div>
                <div className="text-xs text-gray-500 mt-1">Primary realm</div>
              </div>
            </div>

            {/* Configuration Progress */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Configuration Progress</h4>
                <span className="text-sm text-gray-500">
                  {Math.round((configuredResources / enhancedResources.length) * 100)}% Complete
                </span>
              </div>
              <Progress 
                value={(configuredResources / enhancedResources.length) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{configuredResources} configured</span>
                <span>{partialResources} partial</span>
                <span>{enhancedResources.length - configuredResources - partialResources} missing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enhancedResources.map(resource => (
            <Collapsible 
              key={resource.type}
              open={expandedSections.has(resource.type)}
              onOpenChange={() => toggleSection(resource.type)}
            >
              <Card className={`transition-all duration-300 hover:shadow-lg ${resource.borderColor} border-2 relative overflow-hidden`}>
                {/* Priority indicator */}
                <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
                  resource.details.priority === 'high' ? 'bg-red-500' :
                  resource.details.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                
                <CollapsibleTrigger className="w-full">
                  <CardContent className={`p-6 ${resource.bgColor} transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white shadow-sm ${resource.color} relative`}>
                          {resource.icon}
                          {resource.details.status === 'configured' && (
                            <CheckCircle className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                          {resource.details.status === 'partial' && (
                            <AlertCircle className="w-3 h-3 text-orange-600 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold ${resource.color}`}>
                              {resource.count}
                            </span>
                            <div className="flex flex-col">
                              <Badge variant="outline" className={`text-xs ${
                                resource.details.status === 'configured' ? 'text-green-700 border-green-300' :
                                resource.details.status === 'partial' ? 'text-orange-700 border-orange-300' :
                                'text-gray-700 border-gray-300'
                              }`}>
                                {resource.details.status}
                              </Badge>
                              {resource.details.coverage > 0 && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {Math.round(resource.details.coverage)}% covered
                                </span>
                              )}
                            </div>
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
                        <Badge variant="outline" className={`${resource.color} border-current text-xs`}>
                          {resource.details.priority} priority
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
                          <span>TF blocks: {resource.terraformBlocks}</span>
                          <TrendingUp className="w-3 h-3" />
                          <span>Resources: {resource.actualResources}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-0 space-y-4">
                    {/* Resource Insights */}
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Resource Insights
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{resource.actualResources || 0}</div>
                          <div className="text-xs text-gray-500">JSON Resources</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{resource.terraformBlocks || 0}</div>
                          <div className="text-xs text-gray-500">TF Blocks</div>
                        </div>
                      </div>

                      {resource.details.coverage > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Infrastructure Coverage</span>
                            <span>{Math.round(resource.details.coverage)}%</span>
                          </div>
                          <Progress value={resource.details.coverage} className="h-1" />
                        </div>
                      )}
                    </div>

                    {/* Examples */}
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Resource Examples
                      </h4>
                      <div className="space-y-2">
                        {resource.details.examples.map((example, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-lg p-4 border shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Next Steps
                      </h4>
                      <div className="space-y-2">
                        {resource.details.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              recommendation.startsWith('✅') ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <span className={recommendation.startsWith('✅') ? 'text-green-700' : 'text-gray-600'}>
                              {recommendation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source Files (simplified) */}
                    {resource.files.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Source Files ({resource.files.length})
                        </h4>
                        <div className="text-xs text-gray-500 space-y-1">
                          {resource.files.slice(0, 3).map((file, index) => (
                            <div key={index} className="font-mono bg-gray-50 px-2 py-1 rounded border">
                              {file.split('/').pop()}
                            </div>
                          ))}
                          {resource.files.length > 3 && (
                            <div className="text-center py-1 text-gray-400">
                              +{resource.files.length - 3} more files
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No Resources Detected</h3>
                  <p className="text-gray-600 mt-2">
                    No Keycloak resources were found in the uploaded files.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload Terraform files or Keycloak JSON exports to see resource analysis.
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
    // Check for Terraform resource patterns - more specific matching
    const hasResources = hasResourceTypeInContent(resourceType, file.content);
    
    // Check for JSON data - more specific matching
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
