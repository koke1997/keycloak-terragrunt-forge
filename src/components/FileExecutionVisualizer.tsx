
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipBack, ArrowRight } from "lucide-react";

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
}

export function FileExecutionVisualizer({ terragruntFiles, realmName }: FileExecutionVisualizerProps) {
  const [currentExecuting, setCurrentExecuting] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [executedFiles, setExecutedFiles] = useState<Set<number>>(new Set());

  const getFileNodes = (): FileNode[] => {
    const nodes: FileNode[] = [];
    let executionOrder = 0;

    // Provider files first
    terragruntFiles.filter(f => f.filePath.includes('provider')).forEach(file => {
      nodes.push({
        file,
        level: 0,
        dependencies: [],
        executionOrder: executionOrder++
      });
    });

    // Main configuration files
    terragruntFiles.filter(f => f.filePath.includes('main') || f.filePath.includes('variable')).forEach(file => {
      nodes.push({
        file,
        level: 1,
        dependencies: ['providers'],
        executionOrder: executionOrder++
      });
    });

    // Realm files
    terragruntFiles.filter(f => f.filePath.includes('realm') && !f.filePath.includes('provider')).forEach(file => {
      nodes.push({
        file,
        level: 2,
        dependencies: ['main'],
        executionOrder: executionOrder++
      });
    });

    // Resource files
    terragruntFiles.filter(f => 
      !f.filePath.includes('provider') && 
      !f.filePath.includes('main') && 
      !f.filePath.includes('variable') && 
      !f.filePath.includes('realm')
    ).forEach(file => {
      nodes.push({
        file,
        level: 3,
        dependencies: ['realm'],
        executionOrder: executionOrder++
      });
    });

    return nodes.sort((a, b) => a.executionOrder - b.executionOrder);
  };

  const fileNodes = getFileNodes();

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
  };

  useEffect(() => {
    if (!isAnimating || currentExecuting >= fileNodes.length) return;

    const timer = setTimeout(() => {
      setExecutedFiles(prev => new Set([...prev, currentExecuting]));
      
      if (currentExecuting + 1 < fileNodes.length) {
        setCurrentExecuting(currentExecuting + 1);
      } else {
        setIsAnimating(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isAnimating, currentExecuting, fileNodes.length]);

  const getFileStatus = (index: number) => {
    if (executedFiles.has(index)) return 'executed';
    if (index === currentExecuting) return 'executing';
    return 'pending';
  };

  const getFileColor = (status: string) => {
    switch (status) {
      case 'executed': return 'bg-green-100 border-green-300 text-green-800';
      case 'executing': return 'bg-blue-100 border-blue-300 text-blue-800 animate-pulse';
      case 'pending': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-purple-100 text-purple-800', // Level 0 - Providers
      'bg-blue-100 text-blue-800',     // Level 1 - Main config
      'bg-yellow-100 text-yellow-800', // Level 2 - Realm
      'bg-green-100 text-green-800'    // Level 3 - Resources
    ];
    return colors[level] || colors[3];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>File Execution Order</span>
          <div className="flex gap-2">
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
              {isAnimating ? 'Pause' : 'Animate'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            <Badge className="bg-purple-100 text-purple-800">Level 0: Providers</Badge>
            <Badge className="bg-blue-100 text-blue-800">Level 1: Configuration</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Level 2: Realm</Badge>
            <Badge className="bg-green-100 text-green-800">Level 3: Resources</Badge>
          </div>

          {/* File execution flow */}
          <div className="space-y-3">
            {fileNodes.map((node, index) => {
              const status = getFileStatus(index);
              return (
                <div key={node.file.filePath} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-3 left-8 flex items-center">
                      <ArrowRight className="w-3 h-3 text-gray-400 rotate-90" />
                    </div>
                  )}
                  <div className={`p-3 border rounded-lg transition-all duration-300 ${getFileColor(status)}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                          {index + 1}
                        </span>
                        <Badge className={getLevelColor(node.level)} variant="outline">
                          L{node.level}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {node.file.filePath.split('/').pop()}
                        </div>
                        <div className="text-xs opacity-70">
                          {node.file.filePath}
                        </div>
                      </div>

                      {status === 'executing' && (
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          Executing
                        </div>
                      )}
                      
                      {status === 'executed' && (
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {executedFiles.size === fileNodes.length && fileNodes.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <div className="text-green-800 font-medium">
                🎉 All {fileNodes.length} files executed successfully!
              </div>
              <div className="text-sm text-green-700 mt-1">
                Terraform execution completed for "{realmName}" realm.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
