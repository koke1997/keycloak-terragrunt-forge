
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
    const resources: ResourceCount[] = [];

    terragruntFiles.forEach(file => {
      const content = file.content;
      
      // Count different resource types by analyzing terraform content
      const realmMatches = content.match(/resource\s+"keycloak_realm"/g);
      if (realmMatches) {
        const existing = resources.find(r => r.type === 'realm');
        if (existing) {
          existing.count += realmMatches.length;
        } else {
          resources.push({
            type: 'realm',
            count: realmMatches.length,
            icon: <Database className="w-4 h-4" />,
            description: 'Keycloak realms',
            color: 'bg-blue-100 text-blue-800'
          });
        }
      }

      const roleMatches = content.match(/resource\s+"keycloak_role"/g);
      if (roleMatches) {
        const existing = resources.find(r => r.type === 'roles');
        if (existing) {
          existing.count += roleMatches.length;
        } else {
          resources.push({
            type: 'roles',
            count: roleMatches.length,
            icon: <Shield className="w-4 h-4" />,
            description: 'Realm and client roles',
            color: 'bg-purple-100 text-purple-800'
          });
        }
      }

      const groupMatches = content.match(/resource\s+"keycloak_group"/g);
      if (groupMatches) {
        const existing = resources.find(r => r.type === 'groups');
        if (existing) {
          existing.count += groupMatches.length;
        } else {
          resources.push({
            type: 'groups',
            count: groupMatches.length,
            icon: <Users className="w-4 h-4" />,
            description: 'User groups',
            color: 'bg-green-100 text-green-800'
          });
        }
      }

      const userMatches = content.match(/resource\s+"keycloak_user"/g);
      if (userMatches) {
        const existing = resources.find(r => r.type === 'users');
        if (existing) {
          existing.count += userMatches.length;
        } else {
          resources.push({
            type: 'users',
            count: userMatches.length,
            icon: <UserCheck className="w-4 h-4" />,
            description: 'Keycloak users',
            color: 'bg-orange-100 text-orange-800'
          });
        }
      }

      const clientMatches = content.match(/resource\s+"keycloak_openid_client"/g);
      if (clientMatches) {
        const existing = resources.find(r => r.type === 'clients');
        if (existing) {
          existing.count += clientMatches.length;
        } else {
          resources.push({
            type: 'clients',
            count: clientMatches.length,
            icon: <Settings className="w-4 h-4" />,
            description: 'OAuth/OIDC clients',
            color: 'bg-cyan-100 text-cyan-800'
          });
        }
      }

      const scopeMatches = content.match(/resource\s+"keycloak_openid_client_scope"/g);
      if (scopeMatches) {
        const existing = resources.find(r => r.type === 'scopes');
        if (existing) {
          existing.count += scopeMatches.length;
        } else {
          resources.push({
            type: 'scopes',
            count: scopeMatches.length,
            icon: <Layers className="w-4 h-4" />,
            description: 'Client scopes',
            color: 'bg-pink-100 text-pink-800'
          });
        }
      }

      const flowMatches = content.match(/resource\s+"keycloak_authentication_flow"/g);
      if (flowMatches) {
        const existing = resources.find(r => r.type === 'flows');
        if (existing) {
          existing.count += flowMatches.length;
        } else {
          resources.push({
            type: 'flows',
            count: flowMatches.length,
            icon: <Workflow className="w-4 h-4" />,
            description: 'Authentication flows',
            color: 'bg-indigo-100 text-indigo-800'
          });
        }
      }

      const idpMatches = content.match(/resource\s+"keycloak_oidc_identity_provider"/g);
      if (idpMatches) {
        const existing = resources.find(r => r.type === 'identity_providers');
        if (existing) {
          existing.count += idpMatches.length;
        } else {
          resources.push({
            type: 'identity_providers',
            count: idpMatches.length,
            icon: <Globe className="w-4 h-4" />,
            description: 'Identity providers',
            color: 'bg-yellow-100 text-yellow-800'
          });
        }
      }
    });

    return resources.sort((a, b) => b.count - a.count);
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
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
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
