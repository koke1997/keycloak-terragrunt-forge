
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  GitBranch,
  Code2,
  TestTube,
  Zap,
  Target,
  Timer
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  dependencies: string[];
  assignedRole: string;
  automatable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface XPWorkflowOptimizerProps {
  currentIteration: any;
  roles: any[];
  onWorkflowOptimize: (optimizations: any) => void;
}

export function XPWorkflowOptimizer({ currentIteration, roles, onWorkflowOptimize }: XPWorkflowOptimizerProps) {
  const [workflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'requirements',
      name: 'Requirements Analysis',
      description: 'Analyze and prioritize user stories',
      estimatedTime: 30,
      status: 'completed',
      dependencies: [],
      assignedRole: 'customer',
      automatable: false,
      priority: 'critical'
    },
    {
      id: 'design',
      name: 'UI/UX Design',
      description: 'Create wireframes and design system',
      estimatedTime: 45,
      status: 'active',
      dependencies: ['requirements'],
      assignedRole: 'designer',
      automatable: true,
      priority: 'high'
    },
    {
      id: 'architecture',
      name: 'Technical Architecture',
      description: 'Design system architecture and data models',
      estimatedTime: 60,
      status: 'pending',
      dependencies: ['requirements'],
      assignedRole: 'architect',
      automatable: true,
      priority: 'high'
    },
    {
      id: 'implementation',
      name: 'Feature Implementation',
      description: 'Write code for the defined features',
      estimatedTime: 120,
      status: 'pending',
      dependencies: ['design', 'architecture'],
      assignedRole: 'developer',
      automatable: true,
      priority: 'critical'
    },
    {
      id: 'testing',
      name: 'Quality Assurance',
      description: 'Write and run comprehensive tests',
      estimatedTime: 40,
      status: 'pending',
      dependencies: ['implementation'],
      assignedRole: 'tester',
      automatable: true,
      priority: 'high'
    },
    {
      id: 'security-review',
      name: 'Security Review',
      description: 'Perform security audit and vulnerability assessment',
      estimatedTime: 30,
      status: 'pending',
      dependencies: ['implementation'],
      assignedRole: 'security',
      automatable: true,
      priority: 'medium'
    },
    {
      id: 'integration',
      name: 'System Integration',
      description: 'Integrate components and test system-wide functionality',
      estimatedTime: 25,
      status: 'pending',
      dependencies: ['testing', 'security-review'],
      assignedRole: 'developer',
      automatable: false,
      priority: 'high'
    },
    {
      id: 'deployment',
      name: 'Deployment & Release',
      description: 'Deploy to production and monitor',
      estimatedTime: 20,
      status: 'pending',
      dependencies: ['integration'],
      assignedRole: 'devops',
      automatable: true,
      priority: 'medium'
    }
  ]);

  const [automationSettings, setAutomationSettings] = useState({
    enableParallelProcessing: true,
    autoCodeReview: true,
    autoTesting: true,
    autoDeployment: false,
    aiPairProgramming: true,
    continuousIntegration: true
  });

  const calculateProgress = () => {
    const completed = workflowSteps.filter(step => step.status === 'completed').length;
    return (completed / workflowSteps.length) * 100;
  };

  const getTotalEstimatedTime = () => {
    return workflowSteps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getOptimizedTime = () => {
    // Simulate time savings from automation and parallel processing
    let optimizedTime = getTotalEstimatedTime();
    
    if (automationSettings.enableParallelProcessing) {
      optimizedTime *= 0.7; // 30% time saving from parallel processing
    }
    
    if (automationSettings.autoCodeReview) {
      optimizedTime *= 0.9; // 10% time saving from automated code review
    }
    
    if (automationSettings.autoTesting) {
      optimizedTime *= 0.85; // 15% time saving from automated testing
    }
    
    if (automationSettings.aiPairProgramming) {
      optimizedTime *= 0.8; // 20% time saving from AI pair programming
    }
    
    return Math.round(optimizedTime);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const optimizeWorkflow = () => {
    const optimizations = {
      automationSettings,
      estimatedTimeSaving: getTotalEstimatedTime() - getOptimizedTime(),
      parallelTasks: workflowSteps.filter(step => step.automatable && step.status === 'pending'),
      criticalPath: workflowSteps.filter(step => step.priority === 'critical'),
      recommendations: [
        'Enable parallel processing for independent tasks',
        'Implement automated code review for faster feedback',
        'Use AI pair programming for complex implementation tasks',
        'Set up continuous integration for immediate testing'
      ]
    };
    
    onWorkflowOptimize(optimizations);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-purple-600" />
            XP Workflow Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(calculateProgress())}%</div>
              <div className="text-sm text-muted-foreground">Iteration Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{getTotalEstimatedTime()} min</div>
              <div className="text-sm text-muted-foreground">Original Estimate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getOptimizedTime()} min</div>
              <div className="text-sm text-muted-foreground">Optimized Time</div>
            </div>
          </div>

          <Progress value={calculateProgress()} className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Automation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="parallel">Parallel Processing</Label>
                  <Switch
                    id="parallel"
                    checked={automationSettings.enableParallelProcessing}
                    onCheckedChange={(checked) => 
                      setAutomationSettings(prev => ({ ...prev, enableParallelProcessing: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="codeReview">Auto Code Review</Label>
                  <Switch
                    id="codeReview"
                    checked={automationSettings.autoCodeReview}
                    onCheckedChange={(checked) => 
                      setAutomationSettings(prev => ({ ...prev, autoCodeReview: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="testing">Auto Testing</Label>
                  <Switch
                    id="testing"
                    checked={automationSettings.autoTesting}
                    onCheckedChange={(checked) => 
                      setAutomationSettings(prev => ({ ...prev, autoTesting: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pairProg">AI Pair Programming</Label>
                  <Switch
                    id="pairProg"
                    checked={automationSettings.aiPairProgramming}
                    onCheckedChange={(checked) => 
                      setAutomationSettings(prev => ({ ...prev, aiPairProgramming: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Time Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Parallel Processing:</span>
                    <span className="text-sm font-medium text-green-600">
                      {automationSettings.enableParallelProcessing ? '-30%' : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto Code Review:</span>
                    <span className="text-sm font-medium text-green-600">
                      {automationSettings.autoCodeReview ? '-10%' : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Auto Testing:</span>
                    <span className="text-sm font-medium text-green-600">
                      {automationSettings.autoTesting ? '-15%' : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AI Pair Programming:</span>
                    <span className="text-sm font-medium text-green-600">
                      {automationSettings.aiPairProgramming ? '-20%' : '0%'}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span className="text-sm">Total Savings:</span>
                    <span className="text-sm text-green-600">
                      {getTotalEstimatedTime() - getOptimizedTime()} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2 mb-6">
            <h4 className="font-medium">Workflow Steps</h4>
            {workflowSteps.map(step => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <div className="font-medium text-sm">{step.name}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(step.priority)}>{step.priority}</Badge>
                  <Badge variant="outline">{step.estimatedTime}m</Badge>
                  {step.automatable && <Zap className="w-3 h-3 text-yellow-600" />}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={optimizeWorkflow} className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            Optimize Development Workflow
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
