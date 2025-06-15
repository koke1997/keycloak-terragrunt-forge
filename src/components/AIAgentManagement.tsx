
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bot, 
  Brain, 
  Upload, 
  Download, 
  Workflow, 
  Settings, 
  Database, 
  Zap,
  Play,
  Pause,
  RefreshCw,
  BookOpen,
  FileText,
  Network,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";
import { toast } from "@/hooks/use-toast";

interface TrainingSession {
  id: string;
  roleId: string;
  topic: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  trainingData: string;
}

interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  roleId: string;
  status: 'active' | 'inactive' | 'error';
  endpoint: string;
  triggers: string[];
}

interface AIAgentManagementProps {
  selectedRoles: string[];
  onRoleUpdate: (roleId: string, updates: Partial<XPRole>) => void;
}

export function AIAgentManagement({ selectedRoles, onRoleUpdate }: AIAgentManagementProps) {
  const [activeTab, setActiveTab] = useState('training');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [trainingTopic, setTrainingTopic] = useState('');
  const [trainingData, setTrainingData] = useState('');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [n8nWorkflows, setN8nWorkflows] = useState<N8NWorkflow[]>([
    {
      id: 'wf-1',
      name: 'Code Review Automation',
      description: 'Automatically triggers code review when PR is created',
      roleId: 'developer',
      status: 'active',
      endpoint: 'https://n8n.example.com/webhook/code-review',
      triggers: ['pull_request', 'commit']
    },
    {
      id: 'wf-2', 
      name: 'Security Scan Pipeline',
      description: 'Runs security scans on new deployments',
      roleId: 'security',
      status: 'active',
      endpoint: 'https://n8n.example.com/webhook/security-scan',
      triggers: ['deployment', 'code_change']
    }
  ]);
  const [n8nEndpoint, setN8nEndpoint] = useState('https://n8n.example.com');
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8NWorkflow | null>(null);

  const activeRoles = expandedXPRoles.filter(role => selectedRoles.includes(role.id));

  const startTraining = () => {
    if (!selectedRole || !trainingTopic || !trainingData) {
      toast({
        title: "Missing Information",
        description: "Please select a role, topic, and provide training data.",
        variant: "destructive"
      });
      return;
    }

    const newSession: TrainingSession = {
      id: `training-${Date.now()}`,
      roleId: selectedRole,
      topic: trainingTopic,
      status: 'training',
      progress: 0,
      startTime: new Date(),
      trainingData
    };

    setTrainingSessions(prev => [...prev, newSession]);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingSessions(prev => prev.map(session => {
        if (session.id === newSession.id && session.progress < 100) {
          const newProgress = session.progress + Math.random() * 20;
          return {
            ...session,
            progress: Math.min(newProgress, 100),
            status: newProgress >= 100 ? 'completed' : 'training',
            endTime: newProgress >= 100 ? new Date() : undefined
          };
        }
        return session;
      }));
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      toast({
        title: "Training Complete",
        description: `${selectedRole} has been successfully retrained on ${trainingTopic}.`
      });
    }, 5000);

    setShowTrainingDialog(false);
    setTrainingTopic('');
    setTrainingData('');
  };

  const createN8NWorkflow = () => {
    const newWorkflow: N8NWorkflow = {
      id: `wf-${Date.now()}`,
      name: `Auto Workflow for ${selectedRole}`,
      description: `Automated workflow for ${expandedXPRoles.find(r => r.id === selectedRole)?.name}`,
      roleId: selectedRole,
      status: 'active',
      endpoint: `${n8nEndpoint}/webhook/${selectedRole}-automation`,
      triggers: ['manual', 'scheduled']
    };

    setN8nWorkflows(prev => [...prev, newWorkflow]);
    toast({
      title: "Workflow Created",
      description: `N8N workflow created for ${expandedXPRoles.find(r => r.id === selectedRole)?.name}.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'training':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Agent Management & Training Center
          </CardTitle>
          <CardDescription>
            Retrain your AI agents, manage n8n workflows, and optimize agent performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeRoles.length}</div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{trainingSessions.filter(s => s.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Training Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{n8nWorkflows.filter(w => w.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active Workflows</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="training">
                <Brain className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger value="workflows">
                <Workflow className="w-4 h-4 mr-2" />
                N8N Workflows
              </TabsTrigger>
              <TabsTrigger value="knowledge">
                <BookOpen className="w-4 h-4 mr-2" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Target className="w-4 h-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="training" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Agent Training Sessions</h3>
                <Button onClick={() => setShowTrainingDialog(true)}>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {trainingSessions.map(session => {
                  const role = expandedXPRoles.find(r => r.id === session.roleId);
                  return (
                    <Card key={session.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {role?.icon}
                            <div>
                              <CardTitle className="text-sm">{role?.name}</CardTitle>
                              <CardDescription className="text-xs">{session.topic}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(session.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${session.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Started: {session.startTime.toLocaleTimeString()}
                            {session.endTime && ` • Completed: ${session.endTime.toLocaleTimeString()}`}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">N8N Automation Workflows</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="N8N Endpoint URL"
                    value={n8nEndpoint}
                    onChange={(e) => setN8nEndpoint(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={createN8NWorkflow} disabled={!selectedRole}>
                    <Zap className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {n8nWorkflows.map(workflow => {
                  const role = expandedXPRoles.find(r => r.id === workflow.roleId);
                  return (
                    <Card key={workflow.id} className="cursor-pointer hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {role?.icon}
                            <div>
                              <CardTitle className="text-sm">{workflow.name}</CardTitle>
                              <CardDescription className="text-xs">{workflow.description}</CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium">Endpoint:</p>
                            <p className="text-xs text-muted-foreground font-mono">{workflow.endpoint}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Triggers:</p>
                            <div className="flex flex-wrap gap-1">
                              {workflow.triggers.map(trigger => (
                                <Badge key={trigger} variant="outline" className="text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3 mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <h3 className="text-lg font-semibold">Knowledge Base Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRoles.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {role.icon}
                        {role.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium mb-1">Training Topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.aiTrainingTopics?.map(topic => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">Best Practices:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.bestPractices?.map(practice => (
                              <Badge key={practice} variant="outline" className="text-xs">
                                {practice}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedRole(role.id);
                            setShowTrainingDialog(true);
                          }}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Update Knowledge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <h3 className="text-lg font-semibold">Agent Performance Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeRoles.slice(0, 6).map(role => (
                  <Card key={role.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {role.icon}
                        {role.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Performance Score</span>
                          <span className="font-semibold">
                            {Math.floor(Math.random() * 20) + 80}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Tasks Completed</span>
                          <span>{Math.floor(Math.random() * 50) + 20}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Last Training</span>
                          <span>{Math.floor(Math.random() * 7) + 1}d ago</span>
                        </div>
                        <div className="pt-2">
                          <Badge 
                            className={
                              Math.random() > 0.3 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {Math.random() > 0.3 ? 'Optimal' : 'Needs Training'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Train AI Agent</DialogTitle>
            <DialogDescription>
              Provide new knowledge and training data to improve agent performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-select">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role to train" />
                </SelectTrigger>
                <SelectContent>
                  {activeRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        {role.icon}
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="training-topic">Training Topic</Label>
              <Input
                id="training-topic"
                value={trainingTopic}
                onChange={(e) => setTrainingTopic(e.target.value)}
                placeholder="e.g., Advanced React Patterns, Security Best Practices"
              />
            </div>

            <div>
              <Label htmlFor="training-data">Training Data</Label>
              <Textarea
                id="training-data"
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder="Provide training materials, documentation, examples, or best practices..."
                rows={8}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={startTraining}>
                <Brain className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
