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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`group border rounded-2xl bg-white shadow-md p-5 flex flex-col justify-between hover:shadow-xl focus:ring-2 focus:ring-purple-400 relative transition-all cursor-pointer
                    ${selectedProjectId === project.id ? "ring-2 ring-purple-400 border-purple-500 bg-purple-50 scale-[1.015]" : "hover:border-purple-300"}
                    `}
                    tabIndex={0}
                    aria-selected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    style={{ textAlign: "left" }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xl truncate max-w-[60%]" title={project.name}>{project.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-1
                          ${project.complexity === "Beginner" ? "bg-green-100 text-green-800 border-green-200"
                            : project.complexity === "Intermediate" ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : project.complexity === "Advanced" ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-200 text-gray-700 border-gray-300"
                          }
                        `}
                      >
                        {project.complexity || "N/A"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mb-3 text-sm line-clamp-2">
                      {project.description || <span className="italic">No description</span>}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {project.tech_stack?.map((ts) => (
                          <Badge
                            key={ts}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-purple-100 hover:text-purple-700 transition-colors"
                            title={`Filter by ${ts}`}
                            tabIndex={-1}
                            // Add your click logic for filter here if desired
                          >
                            {ts}
                          </Badge>
                        ))}
                        {project.category && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-100 border-slate-200 text-slate-900"
                          >
                            {project.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {project.roles?.map((role) => (
                          <Badge
                            key={role}
                            className="bg-slate-100 text-slate-700 border border-slate-300 text-xs cursor-pointer hover:bg-purple-100 hover:text-purple-700"
                            title={`Filter by ${role}`}
                            tabIndex={-1}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <div className="text-xs flex items-center gap-1 text-muted-foreground">
                        ⏱️ {project.estimated_hours || "?"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto group-hover:bg-purple-600 group-hover:text-white transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(project.id);
                          // Open a "details" modal or navigate, or just visually highlight for now.
                          toast({
                            title: `Project: ${project.name}`,
                            description: project.description || "",
                          });
                        }}
                      >
                        View Details
                      </Button>
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
                  </button>
                ))
              ) : (
                <div className="text-muted-foreground text-center col-span-full">
                  No projects found. Create or combine one below!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Replace the old CombineReposServiceCard with the OOP-powered form */}
      <CombineRepositoriesForm />

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
