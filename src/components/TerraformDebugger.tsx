
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, SkipBack, SkipForward, StepForward, Bug, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface TerraformDebuggerProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

interface DebugStep {
  id: string;
  timestamp: string;
  operation: string;
  file: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  duration: number;
  details: string[];
  variables: { [key: string]: string };
  resources?: string[];
  dependencies?: string[];
}

interface DebugSession {
  steps: DebugStep[];
  currentStep: number;
  startTime: number;
  variables: { [key: string]: string };
}

export function TerraformDebugger({ terragruntFiles, realmName }: TerraformDebuggerProps) {
  const [session, setSession] = useState<DebugSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showVariables, setShowVariables] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  const generateDebugSession = (): DebugSession => {
    const steps: DebugStep[] = [];
    let stepId = 0;
    const startTime = Date.now();
    let globalVars: { [key: string]: string } = {
      'terraform_version': '1.6.0',
      'realm_name': realmName,
      'provider_version': '4.4.0',
      'working_directory': `/terraform/${realmName}`,
      'state_backend': 's3'
    };

    // Initialize Terraform
    steps.push({
      id: `step_${stepId++}`,
      timestamp: new Date(startTime).toISOString(),
      operation: 'terraform init',
      file: 'providers.tf',
      status: 'pending',
      duration: 2000,
      details: [
        'Initializing the backend...',
        'Initializing provider plugins...',
        'Downloading hashicorp/keycloak v4.4.0...',
        'Terraform has been successfully initialized!'
      ],
      variables: { ...globalVars },
      dependencies: []
    });

    // Validate configuration
    steps.push({
      id: `step_${stepId++}`,
      timestamp: new Date(startTime + 2000).toISOString(),
      operation: 'terraform validate',
      file: 'main.tf',
      status: 'pending',
      duration: 800,
      details: [
        'Validating configuration files...',
        'Checking syntax and semantics...',
        'Success! The configuration is valid.'
      ],
      variables: { ...globalVars, 'validation_status': 'passed' },
      dependencies: ['terraform init']
    });

    // Plan realm creation
    const realmFiles = terragruntFiles.filter(f => f.filePath.includes('realm'));
    realmFiles.forEach((file, index) => {
      globalVars[`realm_${index}_id`] = `${realmName}-${index}`;
      steps.push({
        id: `step_${stepId++}`,
        timestamp: new Date(startTime + 3000 + index * 1500).toISOString(),
        operation: 'terraform plan',
        file: file.filePath,
        status: 'pending',
        duration: 1500,
        details: [
          `Planning realm resource: ${file.filePath}`,
          `Realm ID: ${globalVars[`realm_${index}_id`]}`,
          'Checking existing state...',
          'Resource will be created'
        ],
        variables: { ...globalVars },
        resources: [`keycloak_realm.${realmName}`],
        dependencies: ['terraform validate']
      });
    });

    // Plan other resources
    const otherFiles = terragruntFiles.filter(f => !f.filePath.includes('realm') && !f.filePath.includes('provider'));
    otherFiles.forEach((file, index) => {
      const resourceType = file.filePath.includes('client') ? 'client' : 
                          file.filePath.includes('user') ? 'user' : 
                          file.filePath.includes('role') ? 'role' : 'resource';
      
      globalVars[`${resourceType}_${index}_id`] = `${realmName}-${resourceType}-${index}`;
      steps.push({
        id: `step_${stepId++}`,
        timestamp: new Date(startTime + 5000 + index * 1200).toISOString(),
        operation: 'terraform plan',
        file: file.filePath,
        status: 'pending',
        duration: 1200,
        details: [
          `Planning ${resourceType} resource: ${file.filePath}`,
          `Resource ID: ${globalVars[`${resourceType}_${index}_id`]}`,
          'Analyzing dependencies...',
          `Depends on: keycloak_realm.${realmName}`,
          'Resource will be created'
        ],
        variables: { ...globalVars },
        resources: [`keycloak_${resourceType}.${realmName}_${index}`],
        dependencies: [`keycloak_realm.${realmName}`]
      });
    });

    // Apply realm
    realmFiles.forEach((file, index) => {
      steps.push({
        id: `step_${stepId++}`,
        timestamp: new Date(startTime + 8000 + index * 2000).toISOString(),
        operation: 'terraform apply',
        file: file.filePath,
        status: 'pending',
        duration: 2000,
        details: [
          `Creating realm: ${globalVars[`realm_${index}_id`]}`,
          'Sending API request to Keycloak...',
          'Realm created successfully',
          'Updating state file...'
        ],
        variables: { ...globalVars, [`realm_${index}_status`]: 'created' },
        resources: [`keycloak_realm.${realmName}`],
        dependencies: ['terraform plan']
      });
    });

    // Apply other resources
    otherFiles.forEach((file, index) => {
      const resourceType = file.filePath.includes('client') ? 'client' : 
                          file.filePath.includes('user') ? 'user' : 
                          file.filePath.includes('role') ? 'role' : 'resource';
      
      steps.push({
        id: `step_${stepId++}`,
        timestamp: new Date(startTime + 12000 + index * 1800).toISOString(),
        operation: 'terraform apply',
        file: file.filePath,
        status: 'pending',
        duration: 1800,
        details: [
          `Creating ${resourceType}: ${globalVars[`${resourceType}_${index}_id`]}`,
          `Realm context: ${realmName}`,
          'Validating dependencies...',
          'Sending API request to Keycloak...',
          `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} created successfully`
        ],
        variables: { ...globalVars, [`${resourceType}_${index}_status`]: 'created' },
        resources: [`keycloak_${resourceType}.${realmName}_${index}`],
        dependencies: [`keycloak_realm.${realmName}`]
      });
    });

    return {
      steps,
      currentStep: -1,
      startTime,
      variables: globalVars
    };
  };

  const startDebugging = () => {
    const newSession = generateDebugSession();
    setSession(newSession);
    setIsRunning(true);
  };

  const pauseDebugging = () => {
    setIsRunning(false);
  };

  const resetDebugging = () => {
    setIsRunning(false);
    setSession(null);
  };

  const stepForward = () => {
    if (!session || session.currentStep >= session.steps.length - 1) return;
    
    const nextStep = session.currentStep + 1;
    const updatedSession = { ...session, currentStep: nextStep };
    
    // Update step status
    if (nextStep < session.steps.length) {
      updatedSession.steps[nextStep].status = 'running';
    }
    
    setSession(updatedSession);
  };

  const stepBackward = () => {
    if (!session || session.currentStep <= 0) return;
    
    const prevStep = session.currentStep - 1;
    const updatedSession = { ...session, currentStep: prevStep };
    
    setSession(updatedSession);
  };

  useEffect(() => {
    if (!isRunning || !session || session.currentStep >= session.steps.length) return;

    const timer = setTimeout(() => {
      const currentStep = session.currentStep + 1;
      const updatedSession = { ...session, currentStep };
      
      if (currentStep < session.steps.length) {
        // Mark current step as running
        updatedSession.steps[currentStep].status = 'running';
        
        // Mark previous step as success
        if (currentStep > 0) {
          updatedSession.steps[currentStep - 1].status = 'success';
        }
      }
      
      setSession(updatedSession);
      
      if (currentStep >= session.steps.length) {
        setIsRunning(false);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isRunning, session, speed]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const currentStep = session?.steps[session.currentStep];
  const executionProgress = session ? ((session.currentStep + 1) / session.steps.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Terraform Debugger
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetDebugging}
              disabled={!session}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stepBackward}
              disabled={!session || session.currentStep <= 0}
            >
              <SkipForward className="w-4 h-4 rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stepForward}
              disabled={!session || session.currentStep >= session.steps.length - 1}
            >
              <StepForward className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={isRunning ? pauseDebugging : session ? () => setIsRunning(true) : startDebugging}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : session ? 'Resume' : 'Start Debug'}
            </Button>
          </div>
        </CardTitle>
        
        {session && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${executionProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Step {session.currentStep + 1} of {session.steps.length}</span>
              <span>Speed: {speed}ms</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSpeed(2000)}
                className={`text-xs px-2 py-1 rounded ${speed === 2000 ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                Slow
              </button>
              <button 
                onClick={() => setSpeed(1000)}
                className={`text-xs px-2 py-1 rounded ${speed === 1000 ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                Normal
              </button>
              <button 
                onClick={() => setSpeed(500)}
                className={`text-xs px-2 py-1 rounded ${speed === 500 ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                Fast
              </button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!session ? (
          <div className="text-center py-8">
            <Bug className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Start debugging to see step-by-step execution</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Execution Steps */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Execution Steps</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {session.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 border rounded-lg transition-all duration-300 ${
                        index === session.currentStep ? 'ring-2 ring-blue-300' : ''
                      } ${getStatusColor(step.status)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{step.operation}</span>
                            <Badge variant="outline" className="text-xs">
                              {step.file.split('/').pop()}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {step.status === 'running' && (
                          <Badge className="bg-blue-600 text-white animate-pulse">
                            Running
                          </Badge>
                        )}
                      </div>
                      
                      {showDetails && index <= session.currentStep && (
                        <div className="mt-3 space-y-2">
                          {step.details.map((detail, i) => (
                            <div key={i} className="text-xs text-gray-700 ml-7">
                              → {detail}
                            </div>
                          ))}
                          
                          {step.resources && step.resources.length > 0 && (
                            <div className="ml-7">
                              <div className="text-xs font-medium text-gray-600">Resources:</div>
                              {step.resources.map((resource, i) => (
                                <code key={i} className="text-xs bg-gray-100 px-1 rounded">
                                  {resource}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Variables & State */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Variables & State</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVariables(!showVariables)}
                >
                  {showVariables ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showVariables && (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {/* Current Step Info */}
                    {currentStep && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Current Step</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-xs">
                            <div><strong>Operation:</strong> {currentStep.operation}</div>
                            <div><strong>File:</strong> {currentStep.file}</div>
                            <div><strong>Duration:</strong> {currentStep.duration}ms</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Separator />
                    
                    {/* Variables */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Terraform Variables</h4>
                      <div className="space-y-1">
                        {Object.entries(session.variables).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <code className="text-blue-600">{key}</code>
                            <span className="text-gray-500"> = </span>
                            <code className="text-green-600">"{value}"</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        )}
        
        {session && session.currentStep >= session.steps.length - 1 && !isRunning && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Debug Session Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All {session.steps.length} steps executed successfully for "{realmName}" realm.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
