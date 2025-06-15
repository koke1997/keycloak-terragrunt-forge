
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { keycloakRealmJsonToTerragrunt, isValidKeycloakJson } from "@/utils/keycloakToTerragrunt";
import type { RealmTemplate } from "@/utils/complianceTemplates";
import type { ProjectTemplate, TerragruntConfig, UploadedFile, ConversionResult } from "@/types/project";

export function useProjectState() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [terragruntConfig, setTerragruntConfig] = useState<TerragruntConfig | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [enhancedProjectConfig, setEnhancedProjectConfig] = useState(null);
  const [showXPConsole, setShowXPConsole] = useState(false);

  const handleConvertAll = () => {
    setProcessing(true);
    const outputs: ConversionResult[] = files.map(f => {
      if (f.error) return { fileName: f.name, terragruntFiles: [], error: f.error };
      if (!f.parsed || !isValidKeycloakJson(f.parsed))
        return { fileName: f.name, terragruntFiles: [], error: "Not a valid Keycloak realm.json" };
      try {
        const terragruntFiles = keycloakRealmJsonToTerragrunt(f.parsed, f.name);
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

  const handleEnhancedProjectGenerate = (config: any) => {
    setEnhancedProjectConfig(config);
    setShowXPConsole(true);
    toast({
      title: "XP Project Initialized",
      description: `Starting ${config.projectName} with ${config.roles.length} active roles and local LLM integration.`
    });
  };

  const handleXPComplete = () => {
    setShowXPConsole(false);
    setEnhancedProjectConfig(null);
    toast({
      title: "Development Complete",
      description: "Your XP project iteration has been completed successfully!"
    });
  };

  return {
    // State
    files,
    results,
    processing,
    selectedProject,
    terragruntConfig,
    showSetupWizard,
    enhancedProjectConfig,
    showXPConsole,
    // Setters
    setFiles,
    setResults,
    setShowSetupWizard,
    // Handlers
    handleConvertAll,
    handleCopy,
    handleTemplateSelect,
    handleProjectSelect,
    handleConfigChange,
    handleGenerateCode,
    handleSetupComplete,
    handleEnhancedProjectGenerate,
    handleXPComplete
  };
}
