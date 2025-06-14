
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
  Layers
} from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface ResourceOverviewProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface ResourceCount {
  type: string;
  count: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function ResourceOverview({ terragruntFiles, realmName }: ResourceOverviewProps) {
  const analyzeResources = (): ResourceCount[] => {
    const resourceCounts: { [key: string]: number } = {};
    
    console.log('Analyzing files:', terragruntFiles.length);

    terragruntFiles.forEach((file, index) => {
      const content = file.content;
      console.log(`Analyzing file ${index + 1}: ${file.filePath}`);
      
      // More comprehensive regex patterns for different resource types
      const resourcePatterns = [
        { type: 'realm', pattern: /resource\s+"keycloak_realm"\s+"[^"]*"/g, description: 'Keycloak realms' },
        { type: 'roles', pattern: /resource\s+"keycloak_role"\s+"[^"]*"/g, description: 'Realm and client roles' },
        { type: 'groups', pattern: /resource\s+"keycloak_group"\s+"[^"]*"/g, description: 'User groups' },
        { type: 'users', pattern: /resource\s+"keycloak_user"\s+"[^"]*"/g, description: 'Keycloak users' },
        { type: 'clients', pattern: /resource\s+"keycloak_openid_client"\s+"[^"]*"/g, description: 'OAuth/OIDC clients' },
        { type: 'scopes', pattern: /resource\s+"keycloak_openid_client_scope"\s+"[^"]*"/g, description: 'Client scopes' },
        { type: 'flows', pattern: /resource\s+"keycloak_authentication_flow"\s+"[^"]*"/g, description: 'Authentication flows' },
        { type: 'identity_providers', pattern: /resource\s+"keycloak_oidc_identity_provider"\s+"[^"]*"/g, description: 'Identity providers' },
        // Additional Keycloak resource types
        { type: 'mappers', pattern: /resource\s+"keycloak_openid_client_scope_mapper"\s+"[^"]*"/g, description: 'Scope mappers' },
        { type: 'group_memberships', pattern: /resource\s+"keycloak_group_memberships"\s+"[^"]*"/g, description: 'Group memberships' },
        { type: 'role_mappings', pattern: /resource\s+"keycloak_user_roles"\s+"[^"]*"/g, description: 'User role mappings' },
        { type: 'client_roles', pattern: /resource\s+"keycloak_client_role"\s+"[^"]*"/g, description: 'Client roles' },
        { type: 'protocols', pattern: /resource\s+"keycloak_openid_protocol_mapper"\s+"[^"]*"/g, description: 'Protocol mappers' },
        { type: 'executors', pattern: /resource\s+"keycloak_authentication_execution"\s+"[^"]*"/g, description: 'Auth executors' }
      ];

      resourcePatterns.forEach(({ type, pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          const count = matches.length;
          resourceCounts[type] = (resourceCounts[type] || 0) + count;
          console.log(`Found ${count} ${type} resources in ${file.filePath}`);
        }
      });
    });

    console.log('Final resource counts:', resourceCounts);

    // Convert to ResourceCount array with icons and colors
    const resourceTypeConfig = {
      realm: { icon: <Database className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800', description: 'Keycloak realms' },
      roles: { icon: <Shield className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800', description: 'Realm and client roles' },
      groups: { icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-800', description: 'User groups' },
      users: { icon: <UserCheck className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800', description: 'Keycloak users' },
      clients: { icon: <Settings className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-800', description: 'OAuth/OIDC clients' },
      scopes: { icon: <Layers className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800', description: 'Client scopes' },
      flows: { icon: <Workflow className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-800', description: 'Authentication flows' },
      identity_providers: { icon: <Globe className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800', description: 'Identity providers' },
      mappers: { icon: <Key className="w-4 h-4" />, color: 'bg-teal-100 text-teal-800', description: 'Scope mappers' },
      group_memberships: { icon: <Users className="w-4 h-4" />, color: 'bg-lime-100 text-lime-800', description: 'Group memberships' },
      role_mappings: { icon: <Shield className="w-4 h-4" />, color: 'bg-violet-100 text-violet-800', description: 'User role mappings' },
      client_roles: { icon: <Lock className="w-4 h-4" />, color: 'bg-rose-100 text-rose-800', description: 'Client roles' },
      protocols: { icon: <Settings className="w-4 h-4" />, color: 'bg-slate-100 text-slate-800', description: 'Protocol mappers' },
      executors: { icon: <Workflow className="w-4 h-4" />, color: 'bg-amber-100 text-amber-800', description: 'Auth executors' }
    };

    return Object.entries(resourceCounts)
      .map(([type, count]) => ({
        type,
        count,
        icon: resourceTypeConfig[type as keyof typeof resourceTypeConfig]?.icon || <Settings className="w-4 h-4" />,
        description: resourceTypeConfig[type as keyof typeof resourceTypeConfig]?.description || `${type} resources`,
        color: resourceTypeConfig[type as keyof typeof resourceTypeConfig]?.color || 'bg-gray-100 text-gray-800'
      }))
      .sort((a, b) => b.count - a.count);
  };

  const resources = analyzeResources();
  const totalResources = resources.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Resource Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {resources.map(resource => (
            <div key={resource.type} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {resource.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-2xl">{resource.count}</span>
                    <Badge className={resource.color}>
                      {resource.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {resources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No Keycloak resources detected in the uploaded files.</p>
            <p className="text-sm mt-2">Make sure your files contain valid Terraform resource definitions.</p>
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
            <span className="text-sm text-gray-600">Terraform Files</span>
            <span className="font-medium">{terragruntFiles.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
