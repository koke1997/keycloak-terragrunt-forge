
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
  Info
} from "lucide-react";
import { analyzeResourcesInFiles, ResourceCount } from "@/utils/terraformResourceAnalyzer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

export function ResourceOverview({ terragruntFiles, realmName }: ResourceOverviewProps) {
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
    ...getResourceTypeConfig(resource.type)
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
              <div key={resource.type} className="p-3 border rounded-lg hover:bg-gray-50">
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
              </div>
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
