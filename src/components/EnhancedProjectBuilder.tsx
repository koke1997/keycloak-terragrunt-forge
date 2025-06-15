
import React, { useState } from "react";
import { expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";
import { ProjectBuilderHeader } from "@/components/ProjectBuilderHeader";
import { ProjectBuilderTabs } from "@/components/ProjectBuilderTabs";
import { ProjectBuilderActions } from "@/components/ProjectBuilderActions";
import { ProjectBuilderDialog } from "@/components/ProjectBuilderDialog";

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// Add roles: string[] to this interface ↓↓↓
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
  roles: string[]; // <--- fix: add roles here!
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
      <ProjectBuilderHeader />

      <ProjectBuilderTabs
        selectedProject={selectedProject}
        projectName={projectName}
        selectedRoles={selectedRoles}
        llmConfig={llmConfig}
        iterationSettings={iterationSettings}
        customRequirements={customRequirements}
        onProjectSelect={setSelectedProject}
        onProjectNameChange={setProjectName}
        onRoleToggle={handleRoleToggle}
        onRoleInfo={handleRoleInfo}
        onRoleUpdate={handleRoleUpdate}
        onLLMConfigChange={setLLMConfig}
        onIterationSettingsChange={setIterationSettings}
        onRequirementsChange={setCustomRequirements}
        filterRoles={selectedRoles}
      />

      <ProjectBuilderActions
        selectedProject={selectedProject}
        selectedRoles={selectedRoles}
        onGenerateProject={handleGenerateProject}
      />

      <ProjectBuilderDialog
        showRoleDialog={showRoleDialog}
        selectedRole={selectedRole}
        onOpenChange={setShowRoleDialog}
      />
    </div>
  );
}
