
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Clock, Terminal, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface ExecutionFlowProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface ExecutionStep {
  id: string;
  name: string;
  command: string;
  description: string;
  files: string[];
  estimated_time: string;
  type: 'init' | 'plan' | 'apply' | 'validate';
}

export function ExecutionFlow({ terragruntFiles, realmName }: ExecutionFlowProps) {
  const [simulatedStep, setSimulatedStep] = useState<number>(-1);

  const getExecutionSteps = (): ExecutionStep[] => {
    const steps: ExecutionStep[] = [
      {
        id: 'init',
        name: 'Initialize Terraform',
        command: 'terraform init',
        description: 'Download providers and initialize working directory',
        files: ['main.tf', 'providers.tf', 'variables.tf'],
        estimated_time: '30s',
        type: 'init'
      },
      {
        id: 'validate',
        name: 'Validate Configuration',
        command: 'terraform validate',
        description: 'Check configuration syntax and internal consistency',
        files: ['*.tf'],
        estimated_time: '10s',
        type: 'validate'
      },
      {
        id: 'plan',
        name: 'Create Execution Plan',
        command: 'terraform plan',
        description: 'Preview changes that will be made to infrastructure',
        files: terragruntFiles.map(f => f.filePath),
        estimated_time: '45s',
        type: 'plan'
      },
      {
        id: 'apply',
        name: 'Apply Changes',
        command: 'terraform apply',
        description: `Deploy ${realmName} realm and all associated resources`,
        files: terragruntFiles.map(f => f.filePath),
        estimated_time: '2-5min',
        type: 'apply'
      }
    ];

    return steps;
  };

  const steps = getExecutionSteps();

  const getStepIcon = (step: ExecutionStep, index: number) => {
    if (simulatedStep > index) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (simulatedStep === index) {
      return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (step: ExecutionStep, index: number) => {
    if (simulatedStep > index) {
      return 'bg-green-50 border-green-200';
    } else if (simulatedStep === index) {
      return 'bg-blue-50 border-blue-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  const simulateExecution = () => {
    setSimulatedStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= steps.length) {
        setSimulatedStep(steps.length);
        clearInterval(interval);
      } else {
        setSimulatedStep(current);
      }
    }, 1500);
  };

  const resetSimulation = () => {
    setSimulatedStep(-1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Terraform Execution Flow
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              disabled={simulatedStep === -1}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={simulateExecution}
              disabled={simulatedStep >= 0 && simulatedStep < steps.length}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Simulate Execution
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className={`p-4 border rounded-lg ${getStepColor(step, index)}`}>
              <div className="flex items-start gap-4">
                {getStepIcon(step, index)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{step.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {step.type}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-auto">
                      ~{step.estimated_time}
                    </span>
                  </div>
                  
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                      <ChevronRight className="w-3 h-3" />
                      {step.description}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-sm">
                        $ {step.command}
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Affects files:</strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {step.files.slice(0, 5).map((file, i) => (
                            <code key={i} className="bg-gray-100 px-1 rounded text-xs">
                              {file.split('/').pop()}
                            </code>
                          ))}
                          {step.files.length > 5 && (
                            <span className="text-gray-500">+{step.files.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {simulatedStep >= steps.length && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Deployment Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your Keycloak realm "{realmName}" has been successfully deployed with all configured resources.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
