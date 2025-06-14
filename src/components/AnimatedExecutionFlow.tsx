
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipBack, CheckCircle, Clock, ArrowRight, ArrowDown } from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface AnimatedExecutionFlowProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface ExecutionStep {
  id: string;
  name: string;
  files: string[];
  duration: number;
  dependencies: string[];
  type: 'init' | 'validate' | 'plan' | 'apply';
}

export function AnimatedExecutionFlow({ terragruntFiles, realmName }: AnimatedExecutionFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);

  const getExecutionSteps = (): ExecutionStep[] => {
    const steps: ExecutionStep[] = [
      {
        id: 'init-providers',
        name: 'Initialize Providers',
        files: ['providers.tf', 'versions.tf'],
        duration: 2000,
        dependencies: [],
        type: 'init'
      },
      {
        id: 'init-modules',
        name: 'Initialize Modules',
        files: ['main.tf', 'variables.tf'],
        duration: 1500,
        dependencies: ['init-providers'],
        type: 'init'
      },
      {
        id: 'validate-config',
        name: 'Validate Configuration',
        files: terragruntFiles.map(f => f.filePath).slice(0, 3),
        duration: 1000,
        dependencies: ['init-modules'],
        type: 'validate'
      },
      {
        id: 'plan-realm',
        name: `Plan ${realmName} Realm`,
        files: terragruntFiles.filter(f => f.filePath.includes('realm')).map(f => f.filePath),
        duration: 2500,
        dependencies: ['validate-config'],
        type: 'plan'
      },
      {
        id: 'plan-resources',
        name: 'Plan Resources',
        files: terragruntFiles.filter(f => !f.filePath.includes('realm')).map(f => f.filePath),
        duration: 3000,
        dependencies: ['plan-realm'],
        type: 'plan'
      },
      {
        id: 'apply-realm',
        name: `Apply ${realmName} Realm`,
        files: terragruntFiles.filter(f => f.filePath.includes('realm')).map(f => f.filePath),
        duration: 4000,
        dependencies: ['plan-resources'],
        type: 'apply'
      },
      {
        id: 'apply-resources',
        name: 'Apply Resources',
        files: terragruntFiles.filter(f => !f.filePath.includes('realm')).map(f => f.filePath),
        duration: 5000,
        dependencies: ['apply-realm'],
        type: 'apply'
      }
    ];

    return steps;
  };

  const steps = getExecutionSteps();

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setProgress(0);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setCompletedSteps(new Set());
    setProgress(0);
  };

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setProgress((currentStep + 1) / steps.length * 100);
      
      if (currentStep + 1 < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, steps[currentStep]?.duration || 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps]);

  const getStepStatus = (index: number) => {
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStep) return 'executing';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'executing': return 'bg-blue-50 border-blue-200 animate-pulse';
      case 'pending': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStepIcon = (status: string, type: string) => {
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (status === 'executing') {
      return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    
    const iconColor = status === 'pending' ? 'text-gray-400' : 'text-blue-600';
    return <div className={`w-5 h-5 rounded-full border-2 border-current ${iconColor}`} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Animated Execution Flow</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAnimation}
              disabled={currentStep === -1 && !isPlaying}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={isPlaying ? pauseAnimation : startAnimation}
              disabled={currentStep >= steps.length && !isPlaying}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Start Animation'}
            </Button>
          </div>
        </CardTitle>
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className="relative">
                {index > 0 && (
                  <div className="absolute -top-4 left-6 flex items-center">
                    <ArrowDown className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className={`p-4 border rounded-lg transition-all duration-300 ${getStepColor(status)}`}>
                  <div className="flex items-start gap-4">
                    {getStepIcon(status, step.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{step.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.type}
                        </Badge>
                        {status === 'executing' && (
                          <Badge className="bg-blue-600 text-white animate-pulse">
                            Executing...
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <strong>Files affected:</strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {step.files.slice(0, 4).map((file, i) => (
                            <code 
                              key={i} 
                              className={`px-1 rounded text-xs transition-colors duration-200 ${
                                status === 'executing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                              }`}
                            >
                              {file.split('/').pop()}
                            </code>
                          ))}
                          {step.files.length > 4 && (
                            <span className="text-gray-500">+{step.files.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {completedSteps.size === steps.length && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Execution Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All Terraform operations completed successfully for "{realmName}" realm.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
