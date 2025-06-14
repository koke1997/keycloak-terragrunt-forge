
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, ArrowRight, Clock, FileText, Settings, Database, Users, Shield, Code, Eye, EyeOff } from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface FileExecutionVisualizerProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface FileNode {
  file: TerraformFile;
  level: number;
  dependencies: string[];
  executionOrder: number;
  category: 'provider' | 'config' | 'realm' | 'resource' | 'client' | 'user' | 'role';
  estimatedTime: number;
  resourceCount: number;
  description: string;
}

export function FileExecutionVisualizer({ terragruntFiles, realmName }: FileExecutionVisualizerProps) {
  const [currentExecuting, setCurrentExecuting] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [executedFiles, setExecutedFiles] = useState<Set<number>>(new Set());
  const [showDetails, setShowDetails] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [executionSpeed, setExecutionSpeed] = useState(1000);

  const getFileCategory = (filePath: string): FileNode['category'] => {
    if (filePath.includes('provider')) return 'provider';
    if (filePath.includes('main') || filePath.includes('variable')) return 'config';
    if (filePath.includes('realm')) return 'realm';
    if (filePath.includes('client')) return 'client';
    if (filePath.includes('user')) return 'user';
    if (filePath.includes('role')) return 'role';
    return 'resource';
  };

  const getCategoryIcon = (category: FileNode['category']) => {
    switch (category) {
      case 'provider': return <Settings className="w-4 h-4" />;
      case 'config': return <Code className="w-4 h-4" />;
      case 'realm': return <Database className="w-4 h-4" />;
      case 'client': return <Shield className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'role': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryDescription = (category: FileNode['category']) => {
    switch (category) {
      case 'provider': return 'Initializes Keycloak provider connection';
      case 'config': return 'Main configuration and variables setup';
      case 'realm': return 'Creates and configures Keycloak realm';
      case 'client': return 'Sets up OAuth/OIDC client applications';
      case 'user': return 'Manages user accounts and profiles';
      case 'role': return 'Defines roles and permissions';
      default: return 'Generic Terraform resource';
    }
  };

  const getFileNodes = (): FileNode[] => {
    const nodes: FileNode[] = [];
    let executionOrder = 0;

    // Provider files first
    terragruntFiles.filter(f => f.filePath.includes('provider')).forEach(file => {
      nodes.push({
        file,
        level: 0,
        dependencies: [],
        executionOrder: executionOrder++,
        category: 'provider',
        estimatedTime: 3000,
        resourceCount: 1,
        description: getCategoryDescription('provider')
      });
    });

    // Main configuration files
    terragruntFiles.filter(f => f.filePath.includes('main') || f.filePath.includes('variable')).forEach(file => {
      nodes.push({
        file,
        level: 1,
        dependencies: ['providers'],
        executionOrder: executionOrder++,
        category: 'config',
        estimatedTime: 1500,
        resourceCount: 0,
        description: getCategoryDescription('config')
      });
    });

    // Realm files
    terragruntFiles.filter(f => f.filePath.includes('realm') && !f.filePath.includes('provider')).forEach(file => {
      nodes.push({
        file,
        level: 2,
        dependencies: ['main'],
        executionOrder: executionOrder++,
        category: 'realm',
        estimatedTime: 2500,
        resourceCount: 1,
        description: getCategoryDescription('realm')
      });
    });

    // Resource files by category
    const resourceFiles = terragruntFiles.filter(f => 
      !f.filePath.includes('provider') && 
      !f.filePath.includes('main') && 
      !f.filePath.includes('variable') && 
      !f.filePath.includes('realm')
    );

    resourceFiles.forEach(file => {
      const category = getFileCategory(file.filePath);
      nodes.push({
        file,
        level: 3,
        dependencies: ['realm'],
        executionOrder: executionOrder++,
        category,
        estimatedTime: category === 'client' ? 2000 : category === 'user' ? 1800 : 1200,
        resourceCount: category === 'role' ? 3 : 1,
        description: getCategoryDescription(category)
      });
    });

    return nodes.sort((a, b) => a.executionOrder - b.executionOrder);
  };

  const fileNodes = getFileNodes();
  const totalEstimatedTime = fileNodes.reduce((sum, node) => sum + node.estimatedTime, 0);
  const currentProgress = fileNodes.length > 0 ? ((executedFiles.size + (currentExecuting >= 0 ? 0.5 : 0)) / fileNodes.length) * 100 : 0;

  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentExecuting(0);
    setExecutedFiles(new Set());
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentExecuting(-1);
    setExecutedFiles(new Set());
    setSelectedFile(null);
  };

  useEffect(() => {
    if (!isAnimating || currentExecuting >= fileNodes.length) return;

    const currentNode = fileNodes[currentExecuting];
    const timer = setTimeout(() => {
      setExecutedFiles(prev => new Set([...prev, currentExecuting]));
      
      if (currentExecuting + 1 < fileNodes.length) {
        setCurrentExecuting(currentExecuting + 1);
      } else {
        setIsAnimating(false);
      }
    }, currentNode?.estimatedTime || executionSpeed);

    return () => clearTimeout(timer);
  }, [isAnimating, currentExecuting, fileNodes, executionSpeed]);

  const getFileStatus = (index: number) => {
    if (executedFiles.has(index)) return 'executed';
    if (index === currentExecuting) return 'executing';
    return 'pending';
  };

  const getFileColor = (status: string) => {
    switch (status) {
      case 'executed': return 'bg-green-50 border-green-300 text-green-800';
      case 'executing': return 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-200';
      case 'pending': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-green-100 text-green-800 border-green-200'
    ];
    return colors[level] || colors[3];
  };

  const getCategoryColor = (category: FileNode['category']) => {
    switch (category) {
      case 'provider': return 'bg-purple-500 text-white';
      case 'config': return 'bg-blue-500 text-white';
      case 'realm': return 'bg-yellow-500 text-white';
      case 'client': return 'bg-green-500 text-white';
      case 'user': return 'bg-cyan-500 text-white';
      case 'role': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Execution Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                File Execution Timeline
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAnimation}
                  disabled={currentExecuting === -1 && !isAnimating}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={isAnimating ? pauseAnimation : startAnimation}
                  disabled={currentExecuting >= fileNodes.length && !isAnimating}
                >
                  {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isAnimating ? 'Pause' : 'Execute'}
                </Button>
              </div>
            </CardTitle>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={currentProgress} className="w-full" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress: {Math.round(currentProgress)}%</span>
                <span>Est. Time: {Math.round(totalEstimatedTime / 1000)}s</span>
                <span>Files: {executedFiles.size}/{fileNodes.length}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {fileNodes.map((node, index) => {
                  const status = getFileStatus(index);
                  return (
                    <div key={node.file.filePath} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-3 left-12 flex items-center">
                          <ArrowRight className="w-3 h-3 text-gray-400 rotate-90" />
                        </div>
                      )}
                      <div 
                        className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer hover:shadow-md ${getFileColor(status)} ${
                          selectedFile?.file.filePath === node.file.filePath ? 'ring-2 ring-blue-400' : ''
                        }`}
                        onClick={() => setSelectedFile(node)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-mono bg-white px-2 py-1 rounded border shadow-sm">
                              {index + 1}
                            </span>
                            <Badge className={`${getLevelColor(node.level)} text-xs border`}>
                              L{node.level}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getCategoryColor(node.category)} px-2 py-1`}>
                                {getCategoryIcon(node.category)}
                                <span className="ml-1 capitalize">{node.category}</span>
                              </Badge>
                              <div className="font-medium text-sm">
                                {node.file.filePath.split('/').pop()}
                              </div>
                            </div>
                            
                            {showDetails && (
                              <div className="space-y-2 text-sm">
                                <div className="text-gray-600">
                                  {node.description}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {node.estimatedTime / 1000}s
                                  </span>
                                  <span>Resources: {node.resourceCount}</span>
                                  <span className="truncate">{node.file.filePath}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {status === 'executing' && (
                              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                Executing
                              </div>
                            )}
                            
                            {status === 'executed' && (
                              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                                ✓ Completed
                              </div>
                            )}
                            
                            {status === 'pending' && (
                              <div className="text-xs text-gray-400">
                                Waiting
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {executedFiles.size === fileNodes.length && fileNodes.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <div className="text-green-800 font-medium">
                  🎉 Execution Complete!
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Successfully executed all {fileNodes.length} files for "{realmName}" realm in ~{Math.round(totalEstimatedTime / 1000)} seconds.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        {/* Execution Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Files</div>
                <div className="font-semibold">{fileNodes.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Completed</div>
                <div className="font-semibold text-green-600">{executedFiles.size}</div>
              </div>
              <div>
                <div className="text-gray-600">Est. Duration</div>
                <div className="font-semibold">{Math.round(totalEstimatedTime / 1000)}s</div>
              </div>
              <div>
                <div className="text-gray-600">Realm</div>
                <div className="font-semibold truncate">{realmName}</div>
              </div>
            </div>
            
            <Separator />
            
            {/* Category Breakdown */}
            <div>
              <div className="text-sm font-medium mb-2">File Categories</div>
              <div className="space-y-2">
                {['provider', 'config', 'realm', 'client', 'user', 'role', 'resource'].map(category => {
                  const count = fileNodes.filter(n => n.category === category).length;
                  if (count === 0) return null;
                  return (
                    <div key={category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category as FileNode['category'])}
                        <span className="capitalize">{category}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected File Details */}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getCategoryIcon(selectedFile.category)}
                File Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">File Name</div>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {selectedFile.file.filePath.split('/').pop()}
                </code>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Full Path</div>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {selectedFile.file.filePath}
                </code>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Category</div>
                <Badge className={getCategoryColor(selectedFile.category)}>
                  {getCategoryIcon(selectedFile.category)}
                  <span className="ml-1 capitalize">{selectedFile.category}</span>
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Description</div>
                <p className="text-sm text-gray-600">{selectedFile.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600">Execution Order</div>
                  <div className="font-semibold">#{selectedFile.executionOrder + 1}</div>
                </div>
                <div>
                  <div className="text-gray-600">Level</div>
                  <div className="font-semibold">{selectedFile.level}</div>
                </div>
                <div>
                  <div className="text-gray-600">Est. Time</div>
                  <div className="font-semibold">{selectedFile.estimatedTime / 1000}s</div>
                </div>
                <div>
                  <div className="text-gray-600">Resources</div>
                  <div className="font-semibold">{selectedFile.resourceCount}</div>
                </div>
              </div>
              
              {selectedFile.dependencies.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Dependencies</div>
                  <div className="space-y-1">
                    {selectedFile.dependencies.map((dep, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Speed Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Fast', value: 500 },
                { label: 'Normal', value: 1000 },
                { label: 'Slow', value: 2000 }
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setExecutionSpeed(value)}
                  className={`w-full text-sm px-3 py-2 rounded border transition-colors ${
                    executionSpeed === value
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {label} ({value}ms)
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
