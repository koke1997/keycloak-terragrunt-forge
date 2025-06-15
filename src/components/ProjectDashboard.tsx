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
    <Tabs defaultValue="enhanced" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="enhanced">AI XP Builder</TabsTrigger>
        <TabsTrigger value="templates">Project Templates</TabsTrigger>
        <TabsTrigger value="upload">Upload Files</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        <TabsTrigger value="configure">Configure</TabsTrigger>
      </TabsList>
      
      <TabsContent value="enhanced" className="space-y-6">
        {/* Guidance stepper is now rendered in EnhancedProjectBuilder */}
        <EnhancedProjectBuilder onProjectGenerate={handleEnhancedProjectGenerate} />
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
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

      <TabsContent value="upload" className="space-y-6">
        <JsonFileUploader files={files} onFilesChange={setFiles} />

        <div className="flex gap-4">
          <Button
            disabled={files.length === 0 || processing}
            onClick={handleConvertAll}
          >
            Generate Modules ({files.length})
          </Button>
          <Button
            variant="secondary"
            disabled={files.length === 0}
            onClick={() => setResults([])}
          >
            Clear Results
          </Button>
        </div>

        <ConversionResults results={results} onCopy={handleCopy} />
      </TabsContent>

      <TabsContent value="compliance" className="space-y-6">
        <ComplianceTemplateSelector onTemplateSelect={handleTemplateSelect} />
      </TabsContent>

      <TabsContent value="configure" className="space-y-6">
        {!selectedProject ? (
          <Card>
            <CardHeader>
              <CardTitle>Select a Project Template First</CardTitle>
              <CardDescription>
                Go to the "Project Templates" tab to choose a template before configuring infrastructure settings.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <TerragruntConfigPanel 
            onConfigChange={handleConfigChange}
            onGenerateCode={handleGenerateCode}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
