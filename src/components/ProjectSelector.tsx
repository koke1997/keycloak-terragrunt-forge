
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Add roles property
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
  roles: string[]; // AGENTS/ROLES THIS PROJECT SUPPORTS
}

interface ProjectSelectorProps {
  selectedProject: OpenSourceProject | null;
  projectName: string;
  onProjectSelect: (project: OpenSourceProject) => void;
  onProjectNameChange: (name: string) => void;
  filterRoles?: string[]; // New: which roles are active
}

// Sample mapping for demonstration: projects are tagged with supported role ids.
const openSourceProjects: OpenSourceProject[] = [
  {
    id: 'react-todo',
    name: 'Advanced Todo App',
    description: 'Feature-rich todo application with real-time sync, drag-and-drop, and team collaboration',
    githubUrl: 'https://github.com/example/react-todo-advanced',
    techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Framer Motion'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '15-25 hours',
    learningObjectives: ['State management', 'Real-time updates', 'Authentication', 'UI animations'],
    roles: ['developer', 'designer', 'customer'] // add any roles supported
  },
  {
    id: 'expense-tracker',
    name: 'Personal Finance Tracker',
    description: 'Comprehensive expense tracking with budgets, categories, and financial insights',
    githubUrl: 'https://github.com/example/expense-tracker',
    techStack: ['React', 'TypeScript', 'Chart.js', 'Supabase', 'PWA'],
    complexity: 'Advanced',
    category: 'full-stack',
    estimatedHours: '30-45 hours',
    learningObjectives: ['Data visualization', 'Complex state', 'PWA features', 'Financial calculations'],
    roles: ['developer', 'customer', 'security']
  },
  {
    id: 'blog-platform',
    name: 'Modern Blog Platform',
    description: 'Multi-author blog platform with rich text editor, comments, and SEO optimization',
    githubUrl: 'https://github.com/example/blog-platform',
    techStack: ['React', 'TypeScript', 'TinyMCE', 'Supabase', 'React Query'],
    complexity: 'Advanced',
    category: 'full-stack',
    estimatedHours: '40-60 hours',
    learningObjectives: ['Rich text editing', 'SEO optimization', 'Multi-user systems', 'Content management'],
    roles: ['developer', 'designer', 'customer', 'seo']
  },
  {
    id: 'task-manager',
    name: 'Team Task Manager',
    description: 'Kanban-style task management with team collaboration and time tracking',
    githubUrl: 'https://github.com/example/task-manager',
    techStack: ['React', 'TypeScript', 'DnD Kit', 'Supabase', 'WebSockets'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '20-35 hours',
    learningObjectives: ['Drag and drop', 'Real-time collaboration', 'Project management', 'Time tracking'],
    roles: ['developer', 'designer', 'manager', 'customer']
  },
  {
    id: 'recipe-app',
    name: 'Recipe Collection App',
    description: 'Recipe management with meal planning, shopping lists, and nutritional info',
    githubUrl: 'https://github.com/example/recipe-app',
    techStack: ['React', 'TypeScript', 'Supabase', 'PWA', 'Camera API'],
    complexity: 'Beginner',
    category: 'web-app',
    estimatedHours: '10-20 hours',
    learningObjectives: ['CRUD operations', 'Image handling', 'PWA basics', 'Local storage'],
    roles: ['developer', 'customer']
  }
];

function arrayIntersect(a: string[], b: string[]) {
  return a.some(x => b.includes(x));
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            <p className="text-lg">No projects available for the selected agents.</p>
            <p className="text-sm">Try selecting more or different roles in the "Enhanced Roles" tab.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <Card 
              key={project.id}
              className={`cursor-pointer transition-all ${
                selectedProject?.id === project.id 
                  ? 'border-purple-500 shadow-lg bg-purple-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onProjectSelect(project)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  <Badge variant={project.complexity === 'Beginner' ? 'secondary' : 
                         project.complexity === 'Intermediate' ? 'default' : 'destructive'}>
                    {project.complexity}
                  </Badge>
                </CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.map(tech => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Learning Objectives:</p>
                    <ul className="text-xs text-muted-foreground">
                      {project.learningObjectives.slice(0, 2).map(obj => (
                        <li key={obj}>• {obj}</li>
                      ))}
                      {project.learningObjectives.length > 2 && (
                        <li>• +{project.learningObjectives.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedProject && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-600">Selected</Badge>
              {selectedProject.name}
            </CardTitle>
            <div className="space-y-2">
              <Label htmlFor="projectName">Custom Project Name (Optional)</Label>
              <Input
                id="projectName"
                placeholder={selectedProject.name}
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
              />
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
