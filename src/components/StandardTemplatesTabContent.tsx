
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LayoutDashboard, Rocket } from "lucide-react";
import { ProjectTypeSelector } from "@/components/ProjectTypeSelector";
import React from "react";

type Props = {
  selectedTemplate: any;
  setShowSetupWizard: (b: boolean) => void;
  handleProjectSelect: (project: any) => void;
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

export function StandardTemplatesTabContent({
  selectedTemplate,
  setShowSetupWizard,
  handleProjectSelect,
}: Props) {
  return (
    <>
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
                      {selectedTemplate.githubUrl?.replace(/^https?:\/\//, '')}
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
    </>
  );
}
