
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openSourceProjects, OpenSourceProject } from "@/data/openSourceProjects";

// Utility to check project-role intersection
function arrayIntersect(a: string[], b: string[]) {
  return a.some(x => b.includes(x));
}

interface ProjectSelectorProps {
  selectedProject: OpenSourceProject | null;
  projectName: string;
  onProjectSelect: (project: OpenSourceProject) => void;
  onProjectNameChange: (name: string) => void;
  filterRoles?: string[];
}

export function ProjectSelector({
  selectedProject,
  projectName,
  onProjectSelect,
  onProjectNameChange,
  filterRoles = []
}: ProjectSelectorProps) {
  // Filter projects based on selected roles
  const filteredProjects = filterRoles.length === 0
    ? openSourceProjects
    : openSourceProjects.filter(project => arrayIntersect(project.roles, filterRoles));

  return (
    <div className="space-y-6">
      {/* Responsive Projects Grid */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        xl:grid-cols-4 
        2xl:grid-cols-5 
        gap-6
        max-h-[64vh] 
        overflow-y-auto 
        pr-3
      ">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            <p className="text-lg">No projects available for the selected agents.</p>
            <p className="text-sm">Try selecting more or different roles in the "Enhanced Roles" tab.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <Card 
              key={project.id}
              className={`
                cursor-pointer transition-all h-full 
                flex flex-col 
                justify-between
                border-2
                ${selectedProject?.id === project.id 
                  ? 'border-purple-500 shadow-2xl bg-purple-50 scale-[1.03]' 
                  : 'hover:shadow-md hover:scale-[1.015] border-muted-foreground/10'
                }
                min-w-0
              `}
              onClick={() => onProjectSelect(project)}
              tabIndex={0}
              aria-selected={selectedProject?.id === project.id}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate max-w-[75%]" title={project.name}>{project.name}</span>
                  <Badge variant={project.complexity === 'Beginner' ? 'secondary' : 
                         project.complexity === 'Intermediate' ? 'default' : 'destructive'}>
                    {project.complexity}
                  </Badge>
                </CardTitle>
                <CardDescription className="h-12 line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-xs pt-0 flex-1">
                <div>
                  <p className="font-medium mb-1">Tech Stack:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map(tech => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Learning Objectives:</p>
                  <ul className="list-disc pl-5">
                    {project.learningObjectives.slice(0, 2).map(obj => (
                      <li key={obj}>{obj}</li>
                    ))}
                    {project.learningObjectives.length > 2 && (
                      <li>+{project.learningObjectives.length - 2} more...</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span>⏱️ {project.estimatedHours}</span>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {project.roles.map(role => (
                    <Badge key={role} className="bg-slate-100 text-slate-700 border border-slate-300 text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
                <div className="mt-1">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 underline text-xs hover:text-purple-900"
                  >
                    GitHub Repo
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Selected Project Details & Custom Name */}
      {selectedProject && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-600">Selected</Badge>
              {selectedProject.name}
            </CardTitle>
            <div className="space-y-2 mt-2">
              <Label htmlFor="projectName">Custom Project Name (Optional)</Label>
              <Input
                id="projectName"
                placeholder={selectedProject.name}
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

