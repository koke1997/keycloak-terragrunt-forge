
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleDependencyGraph } from "./ModuleDependencyGraph";
import { ExecutionFlow } from "./ExecutionFlow";
import { ResourceOverview } from "./ResourceOverview";
import { Folder, Eye, GitBranch, Play } from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface TerraformStructureViewProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
  onViewFile?: (file: TerraformFile) => void;
}

export function TerraformStructureView({ terragruntFiles, realmName, onViewFile }: TerraformStructureViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const generateFileTree = () => {
    const tree: { [key: string]: string[] } = {};
    
    terragruntFiles.forEach(file => {
      const parts = file.filePath.split('/');
      const dir = parts.slice(0, -1).join('/') || 'root';
      const filename = parts[parts.length - 1];
      
      if (!tree[dir]) {
        tree[dir] = [];
      }
      tree[dir].push(filename);
    });

    return tree;
  };

  const fileTree = generateFileTree();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Terraform Project Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Dependencies
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Execution
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                File Tree
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <ResourceOverview terragruntFiles={terragruntFiles} realmName={realmName} />
            </TabsContent>

            <TabsContent value="dependencies" className="mt-6">
              <ModuleDependencyGraph terragruntFiles={terragruntFiles} realmName={realmName} />
            </TabsContent>

            <TabsContent value="execution" className="mt-6">
              <ExecutionFlow terragruntFiles={terragruntFiles} realmName={realmName} />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project File Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(fileTree).map(([dir, files]) => (
                      <div key={dir} className="space-y-2">
                        <div className="font-medium text-sm text-gray-700 flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {dir === 'root' ? '📁 /' : `📁 ${dir}/`}
                        </div>
                        <div className="ml-6 space-y-1">
                          {files.map(filename => {
                            const fullPath = dir === 'root' ? filename : `${dir}/${filename}`;
                            const file = terragruntFiles.find(f => f.filePath === fullPath);
                            return (
                              <div key={filename} className="flex items-center justify-between group">
                                <span className="font-mono text-sm flex items-center gap-2">
                                  📄 {filename}
                                </span>
                                {file && onViewFile && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewFile(file)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
