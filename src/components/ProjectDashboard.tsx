
import { useEffect } from "react";
import { JsonFileUploader } from "@/components/JsonFileUploader";
import { ConversionResults } from "@/components/ConversionResults";
import { ComplianceTemplateSelector } from "@/components/ComplianceTemplateSelector";
import { TerragruntConfigPanel } from "@/components/TerragruntConfigPanel";
import { ProjectTypeSelector } from "@/components/ProjectTypeSelector";
import { EnhancedProjectBuilder } from "@/components/EnhancedProjectBuilder";
import { XPDevelopmentConsole } from "@/components/XPDevelopmentConsole";
import { LocalDevSetupWizard } from "@/components/LocalDevSetupWizard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Info, Users, LayoutDashboard, Rocket, LayoutList } from "lucide-react";
import { useProjectState } from "@/hooks/useProjectState";
import { XPProjectStepper } from "@/components/XPProjectStepper";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Modern dashboard action buttons for quick access
function QuickActions() {
  return (
    <div className="flex gap-2 items-center flex-wrap mb-2 animate-fade-in">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" className="bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 text-white shadow hover-scale">
              <Rocket className="w-4 h-4 mr-1" /> Deploy Now
            </Button>
          </TooltipTrigger>
          <TooltipContent>Deploy to your preferred cloud instantly.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="sm" className="hover-scale">
              <LayoutDashboard className="w-4 h-4 mr-1" /> Open Dev Tools
            </Button>
          </TooltipTrigger>
          <TooltipContent>Access Docker, Git, Packages, DB, and more tools.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="hover-scale">
              <LayoutList className="w-4 h-4 mr-1" /> View All Projects
            </Button>
          </TooltipTrigger>
          <TooltipContent>Browse and manage your projects/templates.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function ProjectDashboard() {
  const {
    files,
    results,
    processing,
    selectedProject,
    terragruntConfig,
    showSetupWizard,
    enhancedProjectConfig,
    showXPConsole,
    setFiles,
    setResults,
    setShowSetupWizard,
    handleConvertAll,
    handleCopy,
    handleTemplateSelect,
    handleProjectSelect,
    handleConfigChange,
    handleGenerateCode,
    handleSetupComplete,
    handleEnhancedProjectGenerate,
    handleXPComplete
  } = useProjectState();

  const { toast } = useToast();

  // Confirmation toasts for key actions
  useEffect(() => {
    if (selectedProject) {
      toast({
        title: "Project Selected",
        description: `"${selectedProject.name}" is now your active template.`,
        duration: 2500,
      });
    }
  }, [selectedProject, toast]);

  if (showXPConsole && enhancedProjectConfig) {
    return (
      <XPDevelopmentConsole
        projectConfig={enhancedProjectConfig}
        onComplete={handleXPComplete}
      />
    );
  }

  if (showSetupWizard && selectedProject) {
    return (
      <LocalDevSetupWizard
        projectName={terragruntConfig?.projectName || selectedProject.name}
        projectType={selectedProject.type}
        onComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-2">
      {/* Modernized Help & Quick Start Area */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
            <Info className="w-6 h-6 text-blue-700" />
            How This Tool Works
            <Badge className="ml-2 bg-gradient-to-tr from-green-300 to-blue-300 text-blue-900">Open Source</Badge>
          </CardTitle>
          <CardDescription className="text-blue-800 text-base mt-2">
            Build production-grade infrastructure and code with AI, in 3 easy steps:
            <ol className="list-decimal pl-7 mt-3 space-y-1 text-blue-900 text-sm">
              <li>
                <span className="font-bold text-violet-700">Choose</span> an <span className="font-semibold">AI XP Project</span> or a <span className="font-semibold text-slate-700">Standard Template</span>.<br />
                <span className="text-xs text-slate-600 italic">AI XP Projects give you guided, collaborative workflows.</span>
              </li>
              <li>
                <span className="font-bold text-violet-700">Customize</span> your stack, settings, and agents.
              </li>
              <li>
                <span className="font-bold text-green-700">Generate</span> and <span className="font-bold">deploy</span> modular, open source code.
              </li>
            </ol>
          </CardDescription>
          <CardContent className="pt-2">
            <QuickActions />
          </CardContent>
        </CardHeader>
      </Card>
      <Tabs defaultValue="xp" className="w-full animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-14">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="xp" className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-900 transition-all hover-scale">
                  <Users className="w-5 h-5 mr-2" />
                  AI XP Projects
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <span>Plan, generate and iterate with AI agents for advanced automation and collaboration.</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="template" className="text-lg data-[state=active]:bg-slate-200 data-[state=active]:text-slate-900 transition-all hover-scale">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Standard Project Templates
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <span>Select a rapid-start open source template and configure Terragrunt/IaC with full control.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        {/* --- AI XP Projects Tab --- */}
        <TabsContent value="xp" className="space-y-6 animate-fade-in">
          <Card className="mb-2 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-100 via-indigo-100 to-white shadow animate-fade-in">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 animate-bounce" />
                AI XP Projects
              </CardTitle>
              <CardDescription className="text-purple-800">
                Collaborate with AI agents—every workflow uses OSS tools so your infra & code are always yours to own and build on.
              </CardDescription>
            </CardHeader>
          </Card>
          <EnhancedProjectBuilder onProjectGenerate={handleEnhancedProjectGenerate} />
        </TabsContent>

        {/* --- Standard Project Templates Tab --- */}
        <TabsContent value="template" className="space-y-6 animate-fade-in">
          <Card className="mb-2 border-l-4 border-l-slate-500 bg-gradient-to-br from-slate-100 via-green-50 to-white shadow animate-fade-in">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2 text-lg">
                <LayoutDashboard className="w-5 h-5" />
                Standard Project Templates
              </CardTitle>
              <CardDescription className="text-slate-700">
                Manually configure & generate prebuilt open-source infra templates.
                <span className="inline-block bg-green-200 text-green-800 px-1 rounded ml-2 font-bold">100% OSS</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <ProjectTypeSelector onProjectSelect={handleProjectSelect} />
          
          {selectedProject && (
            <Card className="border-green-200 bg-gradient-to-tr from-green-100 via-emerald-100 to-white animate-fade-in shadow-lg transition hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                  <Badge className="bg-green-600">Selected</Badge>
                  {selectedProject.name}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {selectedProject.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{selectedProject.complexity}</Badge>
                    <Badge variant="outline">{selectedProject.estimatedTime ? selectedProject.estimatedTime : selectedProject.estimatedHours}</Badge>
                    <Badge variant="outline">{selectedProject.terragruntModules?.length || 1} modules</Badge>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setShowSetupWizard(true)} className="hover-scale bg-gradient-to-tr from-green-400 to-teal-400 text-white">
                          <Rocket className="w-4 h-4 mr-2" />
                          Start Guided Setup
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <span>
                          Walk through a step-by-step config, then generate reusable, open-source code.
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* More details on selected template */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">GitHub: <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">{selectedProject.githubUrl.replace(/^https?:\/\//, '')}</a></Badge>
                  <Badge variant="secondary">{selectedProject.techStack.join(", ")}</Badge>
                  <Badge variant="secondary">{selectedProject.category}</Badge>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-slate-700 mb-1">Learning Objectives:</div>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    {selectedProject.learningObjectives?.map(obj => (
                      <li key={obj}>{obj}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-slate-700">Roles:</span>
                  <div className="inline-flex gap-1 ml-2">
                    {selectedProject.roles?.map(role => (
                      <Badge key={role} className="bg-slate-100 text-slate-700 border border-slate-300">{role}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
