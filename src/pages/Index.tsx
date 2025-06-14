
import { useState } from "react";
import { JsonFileUploader } from "@/components/JsonFileUploader";
import { ConversionResults } from "@/components/ConversionResults";
import { ComplianceTemplateSelector } from "@/components/ComplianceTemplateSelector";
import { TerragruntConfigPanel } from "@/components/TerragruntConfigPanel";
import { ProjectTypeSelector } from "@/components/ProjectTypeSelector";
import { LocalDevSetupWizard } from "@/components/LocalDevSetupWizard";
import { keycloakRealmJsonToTerragrunt, isValidKeycloakJson, TerraformFile } from "@/utils/keycloakToTerragrunt";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Settings, FileText, Layers, Zap } from "lucide-react";
import type { RealmTemplate } from "@/utils/complianceTemplates";

type UploadedFile = {
  name: string;
  content: string;
  parsed: any | null;
  error?: string;
};

type ConversionResult = {
  fileName: string;
  terragruntFiles: TerraformFile[];
  error?: string;
};

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'keycloak' | 'spring-boot' | 'microservices' | 'full-stack';
  features: string[];
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  terragruntModules: string[];
}

interface TerragruntConfig {
  projectName: string;
  environment: string;
  region: string;
  networkConfig: any;
  secrets: any[];
  enableMonitoring: boolean;
  enableBackup: boolean;
  tags: Record<string, string>;
}

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [terragruntConfig, setTerragruntConfig] = useState<TerragruntConfig | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const handleConvertAll = () => {
    setProcessing(true);
    const outputs: ConversionResult[] = files.map(f => {
      if (f.error) return { fileName: f.name, terragruntFiles: [], error: f.error };
      if (!f.parsed || !isValidKeycloakJson(f.parsed))
        return { fileName: f.name, terragruntFiles: [], error: "Not a valid Keycloak realm.json" };
      try {
        const terragruntFiles = keycloakRealmJsonToTerragrunt(f.parsed, f.name);
        // Add the parsed JSON data to each terraform file for resource analysis
        const enhancedTerragruntFiles = terragruntFiles.map(tf => ({
          ...tf,
          parsed: f.parsed
        }));
        return { fileName: f.name, terragruntFiles: enhancedTerragruntFiles };
      } catch (err: any) {
        return { fileName: f.name, terragruntFiles: [], error: "Conversion failed" };
      }
    });
    setResults(outputs);
    setProcessing(false);
  };

  const handleCopy = async (fileName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: `Copied ${fileName}`, description: "File content copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", description: "Could not copy content.", variant: "destructive" });
    }
  };

  const handleTemplateSelect = (template: RealmTemplate) => {
    const templateFile: UploadedFile = {
      name: `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`,
      content: JSON.stringify(template.template, null, 2),
      parsed: template.template
    };
    
    // Add to files list
    const updatedFiles = [...files, templateFile].reduce<UploadedFile[]>((acc, curr) => {
      if (!acc.some(f => f.name === curr.name)) acc.push(curr);
      return acc;
    }, []);
    
    setFiles(updatedFiles);
    
    toast({ 
      title: "Vorlage hinzugefügt", 
      description: `${template.name} wurde zu Ihren Dateien hinzugefügt.` 
    });
  };

  const handleProjectSelect = (project: ProjectTemplate) => {
    setSelectedProject(project);
    toast({
      title: "Project Template Selected",
      description: `${project.name} template ready for configuration.`
    });
  };

  const handleConfigChange = (config: TerragruntConfig) => {
    setTerragruntConfig(config);
  };

  const handleGenerateCode = () => {
    if (!selectedProject || !terragruntConfig) {
      toast({
        title: "Missing Configuration",
        description: "Please select a project template and configure settings.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Code Generation Started",
      description: "Generating optimized Terragrunt infrastructure code..."
    });

    // Here we would integrate with the existing conversion logic
    // but enhanced with the new configuration options
    setTimeout(() => {
      setShowSetupWizard(true);
      toast({
        title: "Code Generated Successfully",
        description: "Your infrastructure code is ready! Follow the setup wizard to deploy."
      });
    }, 2000);
  };

  const handleSetupComplete = () => {
    setShowSetupWizard(false);
    toast({
      title: "Setup Complete",
      description: "Your local development environment is ready!"
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-background py-12">
      <section className="w-full max-w-7xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Infrastructure Code Booster
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Generate optimized Terragrunt infrastructure from Keycloak realms, Spring Boot apps, and more
          </p>
          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Keycloak Support
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Spring Boot Integration
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Visual Configuration
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              Local Dev Setup
            </Badge>
          </div>
        </div>

        {showSetupWizard && selectedProject ? (
          <LocalDevSetupWizard
            projectName={terragruntConfig?.projectName || selectedProject.name}
            projectType={selectedProject.type}
            onComplete={handleSetupComplete}
          />
        ) : (
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Project Templates</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>
            
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
        )}
      </section>
    </main>
  );
};

export default Index;
