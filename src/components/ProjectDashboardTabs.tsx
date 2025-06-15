
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Users, LayoutDashboard, Rocket } from "lucide-react";
import { ProjectTypeSelector } from "@/components/ProjectTypeSelector";
import { EnhancedProjectBuilder } from "@/components/EnhancedProjectBuilder";
import { useProjectState } from "@/hooks/useProjectState";

type ProjectDashboardTabsProps = {
  selectedTemplate: any;
  setShowSetupWizard: (b: boolean) => void;
  handleProjectSelect: (project: any) => void;
  handleEnhancedProjectGenerate: (config: any) => void;
  showSetupWizard: boolean;
};

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

export function ProjectDashboardTabs({
  selectedTemplate,
  setShowSetupWizard,
  handleProjectSelect,
  handleEnhancedProjectGenerate,
  showSetupWizard,
}: ProjectDashboardTabsProps) {
  return (
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
                    ? selectedTemplate.learningObjectives.map((obj: string) => (
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
                    ? selectedTemplate.roles.map((role: string) => (
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
  );
}
