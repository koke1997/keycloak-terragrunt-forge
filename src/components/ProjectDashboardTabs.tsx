import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Users, LayoutDashboard } from "lucide-react";
import { AIXPProjectsTabContent } from "./AIXPProjectsTabContent";
import { StandardTemplatesTabContent } from "./StandardTemplatesTabContent";

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
        <AIXPProjectsTabContent
          handleEnhancedProjectGenerate={handleEnhancedProjectGenerate}
        />
      </TabsContent>

      <TabsContent value="template" className="space-y-6 animate-fade-in">
        <StandardTemplatesTabContent
          selectedTemplate={selectedTemplate}
          setShowSetupWizard={setShowSetupWizard}
          handleProjectSelect={handleProjectSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
