
import React, { useState } from "react";
import { expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";
import { ProjectBuilderHeader } from "@/components/ProjectBuilderHeader";
import { ProjectBuilderTabs } from "@/components/ProjectBuilderTabs";
import { ProjectBuilderActions } from "@/components/ProjectBuilderActions";
import { ProjectBuilderDialog } from "@/components/ProjectBuilderDialog";
import { XPProjectStepper } from "@/components/XPProjectStepper";
import { ProjectGenerationDialog } from "@/components/ProjectGenerationDialog";
import { toast } from "@/hooks/use-toast";
// FIXED: Import Badge from correct location
import { Badge } from "@/components/ui/badge";
// FIXED: Import Tooltip components from correct location
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [generating, setGenerating] = useState(false);

  // -- Determine current wizard step for the stepper --
  let stepIdx = 0;
  if (!selectedProject) stepIdx = 0;
  else if (selectedRoles.length === 0) stepIdx = 1;
  else if (!llmConfig.model) stepIdx = 2;
  else if (!customRequirements) stepIdx = 3;
  else stepIdx = 4;

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

  // -- Open confirm dialog, don't immediately generate --
  const handleGenerateProject = () => {
    setShowGenerationDialog(true);
  };

  const handleConfirmGenerate = async () => {
    setGenerating(true);
    setShowGenerationDialog(false);

    if (!selectedProject) {
      toast({
        title: "No project selected",
        description: "Please select a project before generating.",
        variant: "destructive"
      });
      setGenerating(false);
      return;
    }

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

    try {
      await new Promise(res => setTimeout(res, 800)); // Fake delay for smoothness UX
      onProjectGenerate(config);
      toast({
        title: "Project Generated!",
        description: "Your enhanced XP project setup is complete."
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your project.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // -- Project Summary to preview in confirmation dialog --
  const projectSummary = selectedProject ? (
    <div>
      <div className="flex gap-2 items-center mb-2">
        <span className="font-semibold">Project:</span>
        <span>{projectName || selectedProject.name}</span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold">Roles:</span>
        <span className="flex flex-wrap gap-1">
          {selectedRoles.map(rid => 
            <span key={rid} className="bg-purple-100 text-xs px-2 rounded">{rid}</span>
          )}
        </span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold">LLM:</span>
        <span>{llmConfig.model} ({llmConfig.provider})</span>
      </div>
    </div>
  ) : <span className="text-muted-foreground">No project selected yet.</span>;

  const advancedOptions = (
    <div className="mt-3 space-y-1">
      <div>
        <span className="font-semibold text-sm">Workflow Optimization:</span>
        <Badge variant={iterationSettings.workflowOptimization ? "default" : "secondary"}>
          {iterationSettings.workflowOptimization ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <div>
        <span className="font-semibold text-sm">Real-Time Training:</span>
        <Badge variant={iterationSettings.realTimeTraining ? "default" : "secondary"}>
          {iterationSettings.realTimeTraining ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <div>
        <span className="font-semibold text-sm">Custom Requirements:</span>
        <span className="ml-1 text-xs text-muted-foreground">
          {customRequirements ? customRequirements.slice(0, 60) : "None given"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="md:flex gap-8">
        {/* Guidance Sidebar (Stepper) */}
        <aside className="mb-6 md:mb-0 shrink-0 w-full md:w-96">
          <XPProjectStepper currentStep={stepIdx} />
        </aside>
        
        {/* Main XP Builder Section */}
        <div className="flex-1 min-w-0">
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

          <div className="relative">
            <ProjectBuilderActions
              selectedProject={selectedProject}
              selectedRoles={selectedRoles}
              onGenerateProject={handleGenerateProject}
            />
            {/* Help Tooltip for the Generate Button */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-block text-xs text-muted-foreground underline cursor-help">
                      Need help generating?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Click <b>Generate Enhanced XP Project</b> to review your selections and launch. All settings can be customized before creating!
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before generating */}
      <ProjectGenerationDialog
        open={showGenerationDialog}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowGenerationDialog(false)}
        projectSummary={projectSummary}
        advancedOptions={advancedOptions}
      />
    </div>
  );
}
