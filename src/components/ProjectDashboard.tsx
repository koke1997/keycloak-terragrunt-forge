
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
import { Rocket } from "lucide-react";
import { useProjectState } from "@/hooks/useProjectState";
import { XPProjectStepper } from "@/components/XPProjectStepper";

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
    <Tabs defaultValue="xp" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="xp">AI XP Projects</TabsTrigger>
        <TabsTrigger value="template">Standard Project Templates</TabsTrigger>
      </TabsList>

      {/* --- AI XP Projects Tab --- */}
      <TabsContent value="xp" className="space-y-6">
        <Card className="mb-2 border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">AI XP Projects</CardTitle>
            <CardDescription className="text-purple-800">
              Full AI-powered project lifecycle: Use the AI XP Builder to plan, generate, and iterate on projects collaboratively with AI agents and enhanced workflows.
            </CardDescription>
          </CardHeader>
        </Card>
        <EnhancedProjectBuilder onProjectGenerate={handleEnhancedProjectGenerate} />
      </TabsContent>

      {/* --- Standard Project Templates Tab --- */}
      <TabsContent value="template" className="space-y-6">
        <Card className="mb-2 border-l-4 border-l-slate-500 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">Standard Project Templates</CardTitle>
            <CardDescription className="text-slate-700">
              Start with a prebuilt infrastructure template and configure it manually. Perfect if you want to generate ready-to-deploy Terragrunt/IaC but don&apos;t want the enhanced AI XP workflow.
            </CardDescription>
          </CardHeader>
        </Card>

        <ProjectTypeSelector onProjectSelect={handleProjectSelect} />
        
        {selectedProject && (
          <Card className="border-green-200 bg-green-50">
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
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedProject.complexity}</Badge>
                  <Badge variant="outline">{selectedProject.estimatedTime}</Badge>
                  <Badge variant="outline">{selectedProject.terragruntModules.length} modules</Badge>
                </div>
                <Button onClick={() => setShowSetupWizard(true)}>
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Setup Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
