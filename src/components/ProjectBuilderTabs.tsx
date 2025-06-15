
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XPExpandedRoles, expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";
import { ProjectSelector } from "@/components/ProjectSelector";
import { LLMConfigPanel } from "@/components/LLMConfigPanel";
import { WorkflowSettingsPanel } from "@/components/WorkflowSettingsPanel";
import { AdvancedSettingsPanel } from "@/components/AdvancedSettingsPanel";
import { AIAgentManagement } from "@/components/AIAgentManagement";
import { EnhancedComplianceGenerator } from "@/components/EnhancedComplianceGenerator";

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

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface ProjectBuilderTabsProps {
  selectedProject: OpenSourceProject | null;
  projectName: string;
  selectedRoles: string[];
  llmConfig: LLMConfig;
  iterationSettings: any;
  customRequirements: string;
  onProjectSelect: (project: OpenSourceProject) => void;
  onProjectNameChange: (name: string) => void;
  onRoleToggle: (roleId: string) => void;
  onRoleInfo: (role: XPRole) => void;
  onRoleUpdate: (roleId: string, updates: Partial<XPRole>) => void;
  onLLMConfigChange: (config: LLMConfig) => void;
  onIterationSettingsChange: (settings: any) => void;
  onRequirementsChange: (requirements: string) => void;
}

export function ProjectBuilderTabs({
  selectedProject,
  projectName,
  selectedRoles,
  llmConfig,
  iterationSettings,
  customRequirements,
  onProjectSelect,
  onProjectNameChange,
  onRoleToggle,
  onRoleInfo,
  onRoleUpdate,
  onLLMConfigChange,
  onIterationSettingsChange,
  onRequirementsChange
}: ProjectBuilderTabsProps) {
  return (
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
          onProjectSelect={onProjectSelect}
          onProjectNameChange={onProjectNameChange}
        />
      </TabsContent>

      <TabsContent value="roles" className="space-y-4">
        <XPExpandedRoles
          selectedRoles={selectedRoles}
          onRoleToggle={onRoleToggle}
          onRoleInfo={onRoleInfo}
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
          onConfigChange={onLLMConfigChange}
        />
      </TabsContent>

      <TabsContent value="workflow" className="space-y-4">
        <WorkflowSettingsPanel
          iterationSettings={iterationSettings}
          onSettingsChange={onIterationSettingsChange}
        />
      </TabsContent>

      <TabsContent value="agents" className="space-y-4">
        <AIAgentManagement
          selectedRoles={selectedRoles}
          onRoleUpdate={onRoleUpdate}
        />
      </TabsContent>

      <TabsContent value="compliance" className="space-y-4">
        <EnhancedComplianceGenerator />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <AdvancedSettingsPanel
          customRequirements={customRequirements}
          onRequirementsChange={onRequirementsChange}
        />
      </TabsContent>
    </Tabs>
  );
}
