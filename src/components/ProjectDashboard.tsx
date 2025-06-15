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
import { Info, Users, LayoutDashboard, Rocket, LayoutList, Link } from "lucide-react";
import { useProjectState } from "@/hooks/useProjectState";
import { XPProjectStepper } from "@/components/XPProjectStepper";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";
import { CombineRepositoriesForm } from "@/components/CombineRepositoriesForm";
import { ElasticGitHubRepoSearch } from "./ElasticGitHubRepoSearch";
import { ProjectDashboardIntro } from "./ProjectDashboardIntro";
import { ProjectList } from "./ProjectList";
import { ProjectDashboardTabs } from "./ProjectDashboardTabs";

// QuickActions remains unchanged
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

// New "Combine Two Repositories" Service Card
function CombineReposServiceCard() {
  return (
    <Card className="my-6 border rounded-lg bg-white shadow-lg max-w-md mx-auto p-0 animate-fade-in group hover:scale-[1.02] transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-800">
          <Link className="w-5 h-5 text-indigo-500 animate-bounce" />
          Combine Two Repositories
        </CardTitle>
        <CardDescription className="text-indigo-700">
          Quickly merge or unify the features and workflows of two repositories into one—powered by this tool’s advanced AI mapping and generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-sm">Describe or select the repositories you'd like to combine, and receive a smart, unified output you can edit further!</div>
          {/* We'll provide a mock "Start Combining" action for now */}
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
            onClick={() => {
              alert("Combining repositories feature coming soon!");
            }}
          >
            <Link className="w-4 h-4 mr-2" />
            Start Combining Repositories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDashboard() {
  // --- Replace useProjectState for project CRUD with Supabase ---
  const { projects, isLoading, isError, createProject, updateProject, deleteProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const {
    files,
    results,
    processing,
    selectedProject: selectedTemplate,
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

  // Pull project by id or null
  const selectedProject =
    projects?.find((p) => p.id === selectedProjectId) ?? null;

  useEffect(() => {
    if (selectedProject) {
      toast({
        title: "Project Selected",
        description: `"${selectedProject.name}" is now your active template.`,
        duration: 2500,
      });
    }
  }, [selectedProject, toast]);

  // --- UI ---
  return (
    <div className="animate-fade-in space-y-2">
      <ProjectDashboardIntro />

      <div className="my-8">
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          isError={isError}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          deleteProject={deleteProject}
        />
      </div>
      {/* Elastic GitHub repo search UI */}
      <ElasticGitHubRepoSearch />

      {/* Combine Repos Section stays */}
      <CombineRepositoriesForm />

      <ProjectDashboardTabs
        selectedTemplate={selectedTemplate}
        setShowSetupWizard={setShowSetupWizard}
        handleProjectSelect={handleProjectSelect}
        handleEnhancedProjectGenerate={handleEnhancedProjectGenerate}
        showSetupWizard={showSetupWizard}
      />
    </div>
  );
}

// Helper for TS project type checks; unchanged
function isOpenSourceProject(project: any): project is {
  estimatedHours?: string;
  githubUrl?: string;
  techStack?: string[];
  category?: string;
  learningObjectives?: string[];
  roles?: string[];
} {
  return (
    typeof project === "object" &&
    (project?.estimatedHours !== undefined ||
      project?.githubUrl !== undefined ||
      project?.techStack !== undefined ||
      project?.category !== undefined ||
      project?.learningObjectives !== undefined ||
      project?.roles !== undefined)
  );
}
