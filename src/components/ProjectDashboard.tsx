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
import { Rocket, Info, Users, LayoutDashboard } from "lucide-react";
import { useProjectState } from "@/hooks/useProjectState";
import { XPProjectStepper } from "@/components/XPProjectStepper";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
    <>
      {/* How It Works / Help Area */}
      <Card className="mb-8 bg-slate-100 border-l-8 border-l-blue-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
            <Info className="w-6 h-6 text-blue-700" />
            How This Tool Works
          </CardTitle>
          <CardDescription className="text-blue-800">
            Get started in 3 easy steps: <br />
            <span className="font-semibold">1.</span> <span className="font-semibold">Choose</span> an <span className="text-violet-700 font-semibold">AI XP Project</span> for a guided experience, or a <span className="text-slate-700 font-semibold">Standard Template</span> for manual setup.<br />
            <span className="font-semibold">2.</span> <span className="font-semibold">Customize</span> your stack and settings.<br />
            <span className="font-semibold">3.</span> <span className="font-semibold">Generate</span> production-ready, open source infrastructure — 100% <span className="text-green-700 font-bold">Open Source</span> tech stack!
          </CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="xp" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-14">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="xp" className="text-lg data-[state=active]:bg-purple-200 data-[state=active]:text-purple-900">
                  <Users className="w-5 h-5 mr-2" />
                  AI XP Projects
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <span>Plan, generate and iterate with AI agents across the full project lifecycle for advanced automation and collaboration.</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="template" className="text-lg data-[state=active]:bg-slate-200 data-[state=active]:text-slate-900">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Standard Project Templates
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <span>Choose an open source starter template and manually configure Terragrunt/IaC — perfect for infrastructure specialists or rapid prototyping.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        {/* --- AI XP Projects Tab --- */}
        <TabsContent value="xp" className="space-y-6">
          <Card className="mb-2 border-l-4 border-l-purple-500 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                AI XP Projects
              </CardTitle>
              <CardDescription className="text-purple-800">
                Work collaboratively with AI agents. The entire workflow, from spec to code, uses open source tooling — so your infrastructure and application code are yours to keep, fork, and contribute.
              </CardDescription>
            </CardHeader>
          </Card>
          <EnhancedProjectBuilder onProjectGenerate={handleEnhancedProjectGenerate} />
        </TabsContent>

        {/* --- Standard Project Templates Tab --- */}
        <TabsContent value="template" className="space-y-6">
          <Card className="mb-2 border-l-4 border-l-slate-500 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Standard Project Templates
              </CardTitle>
              <CardDescription className="text-slate-700">
                Manually configure and generate prebuilt open-source infrastructure templates. <span className="inline-block bg-green-200 text-green-800 px-1 rounded ml-2 font-bold">100% OSS</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <ProjectTypeSelector onProjectSelect={handleProjectSelect} />
          
          {selectedProject && (
            <Card className="border-green-200 bg-green-50 animate-in fade-in slide-in-from-bottom-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Badge className="bg-green-600">Selected</Badge>
                  {selectedProject.name}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {selectedProject.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedProject.complexity}</Badge>
                    <Badge variant="outline">{selectedProject.estimatedTime}</Badge>
                    <Badge variant="outline">{selectedProject.terragruntModules.length} modules</Badge>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setShowSetupWizard(true)}>
                          <Rocket className="w-4 h-4 mr-2" />
                          Start Guided Setup
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <span>
                          Walk through a simple step-by-step configuration, then generate reusable, open source cloud code.
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
