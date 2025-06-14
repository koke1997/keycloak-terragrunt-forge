
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Circle, 
  Play, 
  Download, 
  Terminal, 
  Folder,
  Copy,
  ExternalLink,
  Info
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  commands: string[];
  files: { name: string; content: string }[];
  completed: boolean;
  optional: boolean;
}

interface LocalDevSetupWizardProps {
  projectName: string;
  projectType: string;
  onComplete: () => void;
}

export function LocalDevSetupWizard({ projectName, projectType, onComplete }: LocalDevSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [localPath, setLocalPath] = useState(`~/projects/${projectName}`);
  
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'prereq',
      title: 'Prerequisites Check',
      description: 'Ensure all required tools are installed',
      commands: [
        'terraform --version',
        'terragrunt --version',
        'aws --version',
        'docker --version'
      ],
      files: [],
      completed: false,
      optional: false
    },
    {
      id: 'setup',
      title: 'Project Setup',
      description: 'Create project structure and initialize Terragrunt',
      commands: [
        `mkdir -p ${localPath}`,
        `cd ${localPath}`,
        'terragrunt init',
        'terragrunt plan'
      ],
      files: [
        {
          name: 'terragrunt.hcl',
          content: `# Terragrunt configuration for ${projectName}
terraform {
  source = "./modules"
}

inputs = {
  project_name = "${projectName}"
  environment  = "dev"
  region      = "eu-central-1"
}

include "root" {
  path = find_in_parent_folders()
}`
        },
        {
          name: 'terraform.tfvars',
          content: `# Environment-specific variables
project_name = "${projectName}"
environment = "dev"
enable_monitoring = true
enable_backup = false`
        }
      ],
      completed: false,
      optional: false
    },
    {
      id: 'network',
      title: 'Network Configuration',
      description: 'Configure VPC, subnets, and security groups',
      commands: [
        'terragrunt apply -target=module.vpc',
        'terragrunt apply -target=module.security_groups'
      ],
      files: [
        {
          name: 'network.tf',
          content: `# VPC and networking configuration
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block = "10.0.0.0/16"
  
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}`
        }
      ],
      completed: false,
      optional: false
    },
    {
      id: 'secrets',
      title: 'Secrets Management',
      description: 'Set up AWS Secrets Manager and secure configuration',
      commands: [
        'aws secretsmanager create-secret --name "${projectName}/keycloak/admin"',
        'terragrunt apply -target=module.secrets'
      ],
      files: [
        {
          name: 'secrets.tf',
          content: `# Secrets management configuration
resource "aws_secretsmanager_secret" "keycloak_admin" {
  name = "\${var.project_name}/keycloak/admin"
  description = "Keycloak admin credentials"
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "keycloak_admin" {
  secret_id = aws_secretsmanager_secret.keycloak_admin.id
  secret_string = jsonencode({
    username = "admin"
    password = random_password.keycloak_admin.result
  })
}

resource "random_password" "keycloak_admin" {
  length  = 16
  special = true
}`
        }
      ],
      completed: false,
      optional: false
    },
    {
      id: 'deployment',
      title: 'Application Deployment',
      description: 'Deploy the main application components',
      commands: [
        'terragrunt apply -target=module.database',
        'terragrunt apply -target=module.keycloak',
        'terragrunt apply'
      ],
      files: [
        {
          name: 'main.tf',
          content: `# Main application deployment
module "database" {
  source = "./modules/rds"
  
  identifier = "\${var.project_name}-db"
  engine     = "postgres"
  engine_version = "14.9"
  
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "keycloak"
  username = "keycloak"
  password = random_password.db_password.result
  
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

module "keycloak" {
  source = "./modules/ecs-keycloak"
  
  cluster_name = "\${var.project_name}-cluster"
  service_name = "keycloak"
  
  vpc_id = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets = module.vpc.public_subnets
  
  database_url = "jdbc:postgresql://\${module.database.endpoint}/keycloak"
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}`
        }
      ],
      completed: false,
      optional: false
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Logging',
      description: 'Set up CloudWatch monitoring and log aggregation',
      commands: [
        'terragrunt apply -target=module.cloudwatch',
        'terragrunt apply -target=module.logs'
      ],
      files: [
        {
          name: 'monitoring.tf',
          content: `# Monitoring and logging configuration
resource "aws_cloudwatch_log_group" "keycloak" {
  name              = "/aws/ecs/\${var.project_name}/keycloak"
  retention_in_days = 30
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "\${var.project_name}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "keycloak"],
            [".", "MemoryUtilization", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.region
          title  = "ECS Service Metrics"
        }
      }
    ]
  })
}`
        }
      ],
      completed: false,
      optional: true
    }
  ]);

  const [showCommandOutput, setShowCommandOutput] = useState<Record<string, boolean>>({});

  const progress = (steps.filter(s => s.completed).length / steps.length) * 100;

  const toggleStepComplete = (stepId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Toast notification would go here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Local Development Setup</span>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Step Navigation */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 border border-blue-200'
                        : step.completed
                        ? 'bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${index === currentStep ? 'font-medium' : ''}`}>
                      {step.title}
                    </span>
                    {step.optional && (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
                  <p className="text-muted-foreground">{currentStepData.description}</p>
                </div>

                {currentStep === 1 && (
                  <div>
                    <Label htmlFor="localPath">Local Project Path</Label>
                    <Input
                      id="localPath"
                      value={localPath}
                      onChange={(e) => setLocalPath(e.target.value)}
                      placeholder="~/projects/my-project"
                    />
                  </div>
                )}

                {/* Commands Section */}
                {currentStepData.commands.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Commands to Run
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentStepData.commands.map((command, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 p-2 rounded text-sm font-mono">
                              {command}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(command, 'command')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Files Section */}
                {currentStepData.files.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        Configuration Files
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentStepData.files.map((file, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium">{file.name}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(file.content, 'file')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadFile(file.name, file.content)}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              value={file.content}
                              readOnly
                              className="font-mono text-sm"
                              rows={10}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`complete-${currentStepData.id}`}
                      checked={currentStepData.completed}
                      onCheckedChange={() => toggleStepComplete(currentStepData.id)}
                    />
                    <Label htmlFor={`complete-${currentStepData.id}`}>
                      Mark this step as completed
                    </Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!currentStepData.completed && !currentStepData.optional}
                    >
                      {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next Step'}
                    </Button>
                  </div>
                </div>

                {/* Step-specific alerts */}
                {currentStep === 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Make sure you have AWS CLI configured with appropriate credentials before proceeding.
                      Run <code>aws configure</code> if you haven't set up your AWS credentials yet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
