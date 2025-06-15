import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Brain, 
  GitBranch, 
  Code2, 
  TestTube, 
  Shield, 
  Palette,
  Database,
  Settings,
  Play,
  RefreshCw,
  Zap,
  Workflow,
  Target
} from "lucide-react";
import { XPExpandedRoles, expandedXPRoles, type XPRole } from "@/components/XPExpandedRoles";

interface XPRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  responsibilities: string[];
  keySkills: string[];
  toolsUsed: string[];
  aiPrompt: string;
  color: string;
}

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

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

interface EnhancedProjectBuilderProps {
  onProjectGenerate: (config: any) => void;
}

const xpRoles: XPRole[] = [
  {
    id: 'customer',
    name: 'Customer/Product Owner',
    description: 'Defines requirements and priorities',
    icon: <Users className="w-4 h-4" />,
    responsibilities: ['Define user stories', 'Set priorities', 'Accept deliverables', 'Provide feedback'],
    keySkills: ['Communication', 'Project Management', 'User Research'],
    toolsUsed: ['Jira', 'Trello', 'Slack'],
    aiPrompt: 'You are a product owner focused on user needs and business value. Prioritize features based on user impact.',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Implements code and technical solutions',
    icon: <Code2 className="w-4 h-4" />,
    responsibilities: ['Write clean code', 'Implement features', 'Code reviews', 'Technical decisions'],
    keySkills: ['Programming', 'Problem Solving', 'Version Control'],
    toolsUsed: ['Git', 'VSCode', 'Jira'],
    aiPrompt: 'You are a senior developer focused on clean, maintainable code and best practices.',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'tester',
    name: 'Tester/QA',
    description: 'Ensures quality and finds issues',
    icon: <TestTube className="w-4 h-4" />,
    responsibilities: ['Write test cases', 'Find bugs', 'Quality assurance', 'User acceptance testing'],
    keySkills: ['Testing', 'Debugging', 'Automation'],
    toolsUsed: ['Jest', 'Selenium', 'Postman'],
    aiPrompt: 'You are a QA engineer focused on finding edge cases and ensuring robust, reliable software.',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'designer',
    name: 'Designer/UX',
    description: 'Creates user experience and interface',
    icon: <Palette className="w-4 h-4" />,
    responsibilities: ['UI/UX design', 'User research', 'Wireframes', 'Design systems'],
    keySkills: ['Design', 'Accessibility', 'User Experience'],
    toolsUsed: ['Figma', 'Adobe XD', 'InVision'],
    aiPrompt: 'You are a UX/UI designer focused on user-centered design and accessibility.',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'architect',
    name: 'Technical Architect',
    description: 'Designs system architecture and patterns',
    icon: <Database className="w-4 h-4" />,
    responsibilities: ['System design', 'Architecture decisions', 'Performance optimization', 'Scalability'],
    keySkills: ['Architecture', 'Scalability', 'Performance'],
    toolsUsed: ['Docker', 'Kubernetes', 'AWS'],
    aiPrompt: 'You are a technical architect focused on scalable, maintainable system design.',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'security',
    name: 'Security Engineer',
    description: 'Ensures security best practices',
    icon: <Shield className="w-4 h-4" />,
    responsibilities: ['Security review', 'Vulnerability assessment', 'Compliance', 'Best practices'],
    keySkills: ['Security', 'Compliance', 'Vulnerability'],
    toolsUsed: ['Nessus', 'OpenVAS', 'OWASP'],
    aiPrompt: 'You are a security engineer focused on identifying and mitigating security risks.',
    color: 'bg-yellow-100 text-yellow-800'
  }
];

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
    learningObjectives: ['State management', 'Real-time updates', 'Authentication', 'UI animations']
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
    learningObjectives: ['Data visualization', 'Complex state', 'PWA features', 'Financial calculations']
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
    learningObjectives: ['Rich text editing', 'SEO optimization', 'Multi-user systems', 'Content management']
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
    learningObjectives: ['Drag and drop', 'Real-time collaboration', 'Project management', 'Time tracking']
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
    learningObjectives: ['CRUD operations', 'Image handling', 'PWA basics', 'Local storage']
  }
];

export function EnhancedProjectBuilder({ onProjectGenerate }: EnhancedProjectBuilderProps) {
  const [selectedProject, setSelectedProject] = useState<OpenSourceProject | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['customer', 'developer', 'designer']);
  const [selectedRole, setSelectedRole] = useState<XPRole | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    model: 'codellama',
    temperature: 0.7,
    maxTokens: 2000
  });
  const [iterationSettings, setIterationSettings] = useState({
    iterationLength: 'weekly',
    autoReview: true,
    continuousIntegration: true,
    pairProgramming: true,
    workflowOptimization: true,
    realTimeTraining: true
  });
  const [customRequirements, setCustomRequirements] = useState('');
  const [projectName, setProjectName] = useState('');

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleRoleInfo = (role: XPRole) => {
    setSelectedRole(role);
    setShowRoleDialog(true);
  };

  const handleGenerateProject = () => {
    if (!selectedProject) return;

    const config = {
      project: selectedProject,
      projectName: projectName || selectedProject.name,
      roles: expandedXPRoles.filter(role => selectedRoles.includes(role.id)),
      llmConfig,
      iterationSettings,
      customRequirements,
      features: {
        workflowOptimization: iterationSettings.workflowOptimization,
        realTimeTraining: iterationSettings.realTimeTraining,
        expandedRoles: true,
        advancedMetrics: true
      },
      timestamp: new Date().toISOString()
    };

    onProjectGenerate(config);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Enhanced AI-Powered XP Project Builder
        </h2>
        <p className="text-muted-foreground">
          Advanced workflow optimization with expanded roles and real-time model training
        </p>
      </div>

      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            New Enhanced Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Workflow Optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Real-Time Training</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Expanded Role Library</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Advanced AI Features</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="roles">Enhanced Roles</TabsTrigger>
          <TabsTrigger value="llm">LLM Config</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openSourceProjects.map(project => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all ${
                  selectedProject?.id === project.id 
                    ? 'border-purple-500 shadow-lg bg-purple-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedProject(project)}
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
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <XPExpandedRoles
            selectedRoles={selectedRoles}
            onRoleToggle={handleRoleToggle}
            onRoleInfo={handleRoleInfo}
          />

          <Card>
            <CardHeader>
              <CardTitle>Selected Roles Summary ({selectedRoles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(roleId => {
                  const role = expandedXPRoles.find(r => r.id === roleId);
                  return role ? (
                    <Badge key={roleId} className={role.color}>
                      {role.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local LLM Configuration</CardTitle>
              <CardDescription>Configure your local LLM for AI-assisted development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">LLM Provider</Label>
                  <Select value={llmConfig.provider} onValueChange={(value: any) => 
                    setLLMConfig(prev => ({ ...prev, provider: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ollama">Ollama</SelectItem>
                      <SelectItem value="llamacpp">LlamaCPP</SelectItem>
                      <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={llmConfig.endpoint}
                    onChange={(e) => setLLMConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model Name</Label>
                  <Input
                    id="model"
                    value={llmConfig.model}
                    onChange={(e) => setLLMConfig(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="codellama, deepseek-coder, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="temperature">Temperature ({llmConfig.temperature})</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={llmConfig.temperature}
                    onChange={(e) => setLLMConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Workflow Settings</CardTitle>
              <CardDescription>Configure advanced workflow optimization features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iterationLength">Iteration Length</Label>
                  <Select value={iterationSettings.iterationLength} onValueChange={(value) => 
                    setIterationSettings(prev => ({ ...prev, iterationLength: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (24h cycles)</SelectItem>
                      <SelectItem value="weekly">Weekly (7 day sprints)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (14 day sprints)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="workflowOpt">Workflow Optimization</Label>
                    <Switch
                      id="workflowOpt"
                      checked={iterationSettings.workflowOptimization}
                      onCheckedChange={(checked) => 
                        setIterationSettings(prev => ({ ...prev, workflowOptimization: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="realTimeTraining">Real-Time Model Training</Label>
                    <Switch
                      id="realTimeTraining"
                      checked={iterationSettings.realTimeTraining}
                      onCheckedChange={(checked) => 
                        setIterationSettings(prev => ({ ...prev, realTimeTraining: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoReview">Advanced Code Review</Label>
                    <Switch
                      id="autoReview"
                      checked={iterationSettings.autoReview}
                      onCheckedChange={(checked) => 
                        setIterationSettings(prev => ({ ...prev, autoReview: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="pairProgramming">Enhanced AI Pair Programming</Label>
                    <Switch
                      id="pairProgramming"
                      checked={iterationSettings.pairProgramming}
                      onCheckedChange={(checked) => 
                        setIterationSettings(prev => ({ ...prev, pairProgramming: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Specify additional requirements and constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="customRequirements">Project-Specific Requirements</Label>
                <Textarea
                  id="customRequirements"
                  placeholder="Describe any specific requirements, architectural constraints, performance goals, or unique features for this project..."
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateProject}
          disabled={!selectedProject || selectedRoles.length === 0}
          size="lg"
          className="px-8"
        >
          <Play className="w-4 h-4 mr-2" />
          Generate Enhanced XP Project
        </Button>
      </div>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole?.icon}
              {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>{selectedRole?.description}</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRole.responsibilities.map(resp => (
                    <li key={resp}>{resp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Core Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.keySkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tools & Technologies:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.toolsUsed.map(tool => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">AI Assistant Personality:</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {selectedRole.aiPrompt}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
