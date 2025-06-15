
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Brain, 
  Play,
  Zap,
  Workflow,
  Target,
  Shield,
  Bot
} from "lucide-react";
import { XPExpandedRoles, expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";
import { ProjectSelector } from "@/components/ProjectSelector";
import { LLMConfigPanel } from "@/components/LLMConfigPanel";
import { WorkflowSettingsPanel } from "@/components/WorkflowSettingsPanel";
import { AdvancedSettingsPanel } from "@/components/AdvancedSettingsPanel";
import { AIAgentManagement } from "@/components/AIAgentManagement";
import { EnhancedComplianceGenerator } from "@/components/EnhancedComplianceGenerator";

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  techStack: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'web-app' | 'api' | 'full-stack' | 'mobile' | 'desktop';
  estimatedHours: string;
  learningObjectives: string[];
}

interface EnhancedProjectBuilderProps {
  onProjectGenerate: (config: any) => void;
}

export function EnhancedProjectBuilder({ onProjectGenerate }: EnhancedProjectBuilderProps) {
  const [selectedProject, setSelectedProject] = useState<OpenSourceProject | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['customer', 'developer', 'designer']);
  const [selectedRole, setSelectedRole] = useState<XPRole | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    model: 'codellama',
    temperature: 0.7,
    maxTokens: 2000
  });
  const [iterationSettings, setIterationSettings] = useState({
    iterationLength: 'weekly',
    autoReview: true,
    continuousIntegration: true,
    pairProgramming: true,
    workflowOptimization: true,
    realTimeTraining: true
  });
  const [customRequirements, setCustomRequirements] = useState('');
  const [projectName, setProjectName] = useState('');

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleRoleInfo = (role: XPRole) => {
    setSelectedRole(role);
    setShowRoleDialog(true);
  };

  const handleRoleUpdate = (roleId: string, updates: Partial<XPRole>) => {
    // Update role configurations
    console.log('Updating role:', roleId, updates);
  };

  const handleGenerateProject = () => {
    if (!selectedProject) return;

    const config = {
      project: selectedProject,
      projectName: projectName || selectedProject.name,
      roles: expandedXPRoles.filter(role => selectedRoles.includes(role.id)),
      llmConfig,
      iterationSettings,
      customRequirements,
      features: {
        workflowOptimization: iterationSettings.workflowOptimization,
        realTimeTraining: iterationSettings.realTimeTraining,
        expandedRoles: true,
        advancedMetrics: true,
        aiAgentManagement: true,
        complianceGenerator: true
      },
      timestamp: new Date().toISOString()
    };

    onProjectGenerate(config);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Enhanced AI-Powered XP Project Builder
        </h2>
        <p className="text-muted-foreground">
          Advanced workflow optimization with expanded roles, AI agent management, and compliance automation
        </p>
      </div>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            New Enhanced Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Workflow Optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Real-Time Training</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">21+ Specialized Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">AI Agent Swarm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="roles">Enhanced Roles</TabsTrigger>
          <TabsTrigger value="llm">LLM Config</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectSelector
            selectedProject={selectedProject}
            projectName={projectName}
            onProjectSelect={setSelectedProject}
            onProjectNameChange={setProjectName}
          />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <XPExpandedRoles
            selectedRoles={selectedRoles}
            onRoleToggle={handleRoleToggle}
            onRoleInfo={handleRoleInfo}
          />

          <Card>
            <CardHeader>
              <CardTitle>Selected Roles Summary ({selectedRoles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(roleId => {
                  const role = expandedXPRoles.find(r => r.id === roleId);
                  return role ? (
                    <Badge key={roleId} className={role.color}>
                      {role.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-4">
          <LLMConfigPanel
            llmConfig={llmConfig}
            onConfigChange={setLLMConfig}
          />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <WorkflowSettingsPanel
            iterationSettings={iterationSettings}
            onSettingsChange={setIterationSettings}
          />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AIAgentManagement
            selectedRoles={selectedRoles}
            onRoleUpdate={handleRoleUpdate}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <EnhancedComplianceGenerator />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedSettingsPanel
            customRequirements={customRequirements}
            onRequirementsChange={setCustomRequirements}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateProject}
          disabled={!selectedProject || selectedRoles.length === 0}
          size="lg"
          className="px-8"
        >
          <Play className="w-4 h-4 mr-2" />
          Generate Enhanced XP Project
        </Button>
      </div>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole?.icon}
              {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>{selectedRole?.description}</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRole.responsibilities.map(resp => (
                    <li key={resp}>{resp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Core Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.keySkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tools & Technologies:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.toolsUsed.map(tool => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
              {selectedRole.aiTrainingTopics && (
                <div>
                  <h4 className="font-medium mb-2">AI Training Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.aiTrainingTopics.map(topic => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-2">AI Assistant Personality:</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {selectedRole.aiPrompt}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
