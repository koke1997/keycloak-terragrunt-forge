
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Users, Shield, Settings, Key, Workflow } from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface ModuleDependencyGraphProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface ModuleInfo {
  name: string;
  type: 'main' | 'resource' | 'config';
  dependencies: string[];
  icon: React.ReactNode;
  description: string;
}

export function ModuleDependencyGraph({ terragruntFiles, realmName }: ModuleDependencyGraphProps) {
  const getModuleInfo = (): ModuleInfo[] => {
    const modules: ModuleInfo[] = [];
    
    // Main module
    modules.push({
      name: "main",
      type: "main",
      dependencies: [],
      icon: <Database className="w-4 h-4" />,
      description: "Root Terraform configuration"
    });

    // Keycloak provider
    modules.push({
      name: "keycloak-provider",
      type: "config",
      dependencies: ["main"],
      icon: <Key className="w-4 h-4" />,
      description: "Keycloak provider configuration"
    });

    // Realm module
    modules.push({
      name: "realm",
      type: "resource",
      dependencies: ["keycloak-provider"],
      icon: <Shield className="w-4 h-4" />,
      description: `Creates realm: ${realmName}`
    });

    // Check for other modules based on files
    terragruntFiles.forEach(file => {
      if (file.filePath.includes('/roles/')) {
        modules.push({
          name: "roles",
          type: "resource",
          dependencies: ["realm"],
          icon: <Shield className="w-4 h-4" />,
          description: "Realm and client roles"
        });
      } else if (file.filePath.includes('/groups/')) {
        modules.push({
          name: "groups",
          type: "resource",
          dependencies: ["realm", "roles"],
          icon: <Users className="w-4 h-4" />,
          description: "User groups and hierarchy"
        });
      } else if (file.filePath.includes('/users/')) {
        modules.push({
          name: "users",
          type: "resource",
          dependencies: ["realm", "groups"],
          icon: <Users className="w-4 h-4" />,
          description: "Users and assignments"
        });
      } else if (file.filePath.includes('/clients/')) {
        modules.push({
          name: "clients",
          type: "resource",
          dependencies: ["realm"],
          icon: <Settings className="w-4 h-4" />,
          description: "OAuth/OIDC clients"
        });
      } else if (file.filePath.includes('/flows/')) {
        modules.push({
          name: "auth-flows",
          type: "resource",
          dependencies: ["realm"],
          icon: <Workflow className="w-4 h-4" />,
          description: "Authentication flows"
        });
      }
    });

    // Remove duplicates
    return modules.filter((module, index, self) => 
      index === self.findIndex(m => m.name === module.name)
    );
  };

  const modules = getModuleInfo();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'config': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resource': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          Module Dependency Graph
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div key={module.name} className="relative">
              {index > 0 && (
                <div className="absolute -top-4 left-8 flex items-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {module.icon}
                  <span className="font-medium">{module.name}</span>
                </div>
                <Badge className={getTypeColor(module.type)}>
                  {module.type}
                </Badge>
                <span className="text-sm text-gray-600 flex-1">
                  {module.description}
                </span>
                {module.dependencies.length > 0 && (
                  <div className="text-xs text-gray-500">
                    depends on: {module.dependencies.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
