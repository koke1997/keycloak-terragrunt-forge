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
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";

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

  // Confirmation toast on select
  useEffect(() => {
    if (selectedProject) {
      toast({
        title: "Project Selected",
        description: `"${selectedProject.name}" is now your active template.`,
        duration: 2500,
      });
    }
  }, [selectedProject, toast]);

  // New Project form state
  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    description: "",
  });

  if (showXPConsole && enhancedProjectConfig) {
    return (
      <XPDevelopmentConsole
        projectConfig={enhancedProjectConfig}
        onComplete={handleXPComplete}
      />
    );
  }

  if (showSetupWizard && selectedTemplate) {
    return (
      <LocalDevSetupWizard
        projectName={terragruntConfig?.projectName || selectedTemplate.name}
        projectType={selectedTemplate.type}
        onComplete={handleSetupComplete}
      />
    );
  }

  // This utility checks if the selectedProject is likely an OpenSourceProject
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

  // --- UI ---
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

      <div className="my-8">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
        ) : isError ? (
          <div className="text-center py-8 text-red-600">Error loading projects!</div>
        ) : (
          <div>
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              Your Projects
              <Badge variant="secondary">{projects?.length ?? 0}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={`border rounded p-4 bg-white shadow-sm group flex flex-col ${selectedProjectId === project.id ? "border-purple-500 ring-2 ring-purple-300" : "hover:border-purple-300"}`}
                    tabIndex={0}
                    aria-selected={selectedProjectId === project.id}
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className="font-bold text-lg cursor-pointer truncate"
                        onClick={() => setSelectedProjectId(project.id)}
                        title={project.name}
                      >
                        {project.name}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline">{project.complexity ?? "N/A"}</Badge>
                        <button
                          aria-label="Delete"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteProject(project.id);
                            toast({
                              title: "Project Deleted",
                              description: `"${project.name}" has been deleted.`,
                              duration: 1800,
                            });
                            if (selectedProjectId === project.id) setSelectedProjectId(null);
                          }}
                          className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {project.description || <span className="italic">No description</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tech_stack?.map((ts) => (
                        <Badge key={ts} variant="secondary">{ts}</Badge>
                      ))}
                      {project.category && <Badge variant="outline">{project.category}</Badge>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center col-span-full">
                  No projects found. Create one below!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Project Form */}
      <div className="my-6 border rounded-lg bg-white shadow-md max-w-md mx-auto p-6 space-y-3">
        <div className="font-semibold text-purple-800 text-lg flex items-center gap-2">
          + New Project
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newProjectForm.name) {
              toast({ title: "Missing Project Name", description: "Please enter a project name." });
              return;
            }
            await createProject({
              name: newProjectForm.name,
              description: newProjectForm.description,
            });
            setNewProjectForm({ name: "", description: "" });
            toast({ title: "Project Created", description: "Your project has been created!" });
          }}
          className="space-y-3"
        >
          <input
            className="w-full border rounded px-3 py-2 text-base"
            placeholder="Project name"
            value={newProjectForm.name}
            onChange={e => setNewProjectForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Short description (optional)"
            value={newProjectForm.description}
            onChange={e => setNewProjectForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 font-semibold"
            type="submit"
          >
            Create Project
          </button>
        </form>
      </div>

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
          
          {selectedTemplate && (
            <Card className="border-green-200 bg-gradient-to-tr from-green-100 via-emerald-100 to-white animate-fade-in shadow-lg transition hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                  <Badge className="bg-green-600">Selected</Badge>
                  {selectedTemplate.name}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {selectedTemplate.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{selectedTemplate.complexity}</Badge>
                    <Badge variant="outline">
                      {"estimatedTime" in selectedTemplate && selectedTemplate.estimatedTime
                        ? selectedTemplate.estimatedTime
                        : (isOpenSourceProject(selectedTemplate) && selectedTemplate.estimatedHours) || ""}
                    </Badge>
                    <Badge variant="outline">{selectedTemplate.terragruntModules?.length || 1} modules</Badge>
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
                  {isOpenSourceProject(selectedTemplate) && (
                    <>
                      <Badge variant="secondary">
                        GitHub:
                        <a href={selectedTemplate.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 underline">
                          {selectedTemplate.githubUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </Badge>
                      <Badge variant="secondary">{selectedTemplate.techStack?.join(", ")}</Badge>
                      <Badge variant="secondary">{selectedTemplate.category}</Badge>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-bold text-slate-700 mb-1">Learning Objectives:</div>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    {isOpenSourceProject(selectedTemplate) && selectedTemplate.learningObjectives
                      ? selectedTemplate.learningObjectives.map(obj => (
                        <li key={obj}>{obj}</li>
                      ))
                      : <li>N/A</li>
                    }
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-slate-700">Roles:</span>
                  <div className="inline-flex gap-1 ml-2">
                    {isOpenSourceProject(selectedTemplate) && selectedTemplate.roles
                      ? selectedTemplate.roles.map(role => (
                        <Badge key={role} className="bg-slate-100 text-slate-700 border border-slate-300">{role}</Badge>
                      ))
                      : <Badge className="bg-slate-100 text-slate-500 border border-slate-300">N/A</Badge>
                    }
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
