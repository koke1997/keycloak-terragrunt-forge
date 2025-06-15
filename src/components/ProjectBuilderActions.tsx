
import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  techStack: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'web-app' | 'api' | 'full-stack' | 'mobile' | 'desktop';
  estimatedHours: string;
  learningObjectives: string[];
}

interface ProjectBuilderActionsProps {
  selectedProject: OpenSourceProject | null;
  selectedRoles: string[];
  onGenerateProject: () => void;
}

export function ProjectBuilderActions({
  selectedProject,
  selectedRoles,
  onGenerateProject
}: ProjectBuilderActionsProps) {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={onGenerateProject}
        disabled={!selectedProject || selectedRoles.length === 0}
        size="lg"
        className="px-8"
      >
        <Play className="w-4 h-4 mr-2" />
        Generate Enhanced XP Project
      </Button>
    </div>
  );
}
