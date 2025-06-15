import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  MessageSquare, 
  GitCommit,
  CheckCircle,
  RotateCcw,
  Users,
  Brain,
  Workflow,
  BarChart,
  Settings
} from "lucide-react";
import { XPIterationStatus } from "@/components/XPIterationStatus";
import { XPRoleSelector } from "@/components/XPRoleSelector";
import { XPConversation } from "@/components/XPConversation";
import { XPIterationHistory } from "@/components/XPIterationHistory";
import { XPModelTrainingDashboard } from "@/components/XPModelTrainingDashboard";
import { XPWorkflowOptimizer } from "@/components/XPWorkflowOptimizer";

interface XPIteration {
  id: string;
  phase: 'planning' | 'development' | 'testing' | 'review' | 'retrospective';
  activeRole: string;
  progress: number;
  messages: XPMessage[];
  startTime: Date;
  estimatedEndTime: Date;
}

interface XPMessage {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  type: 'suggestion' | 'implementation' | 'question' | 'feedback';
  relatedFiles?: string[];
}

interface XPDevelopmentConsoleProps {
  projectConfig: any;
  onComplete: () => void;
}

export function XPDevelopmentConsole({ projectConfig, onComplete }: XPDevelopmentConsoleProps) {
  const [currentIteration, setCurrentIteration] = useState<XPIteration | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [iterationHistory, setIterationHistory] = useState<XPIteration[]>([]);
  const [activeTab, setActiveTab] = useState('conversation');

  const phases = [
    { id: 'planning', name: 'Planning', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'development', name: 'Development', icon: <Brain className="w-4 h-4" /> },
    { id: 'testing', name: 'Testing', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'review', name: 'Review', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'retrospective', name: 'Retrospective', icon: <RotateCcw className="w-4 h-4" /> }
  ];

  const startIteration = () => {
    const newIteration: XPIteration = {
      id: `iteration-${Date.now()}`,
      phase: 'planning',
      activeRole: projectConfig.roles[0]?.id || 'customer',
      progress: 0,
      messages: [],
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + (projectConfig.iterationSettings.iterationLength === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000))
    };

    const initialMessage: XPMessage = {
      id: `msg-${Date.now()}`,
      role: 'customer',
      content: `Starting new iteration for ${projectConfig.projectName}. Let's define the user stories and priorities for this iteration using our enhanced workflow with ${projectConfig.roles.length} specialized roles.`,
      timestamp: new Date(),
      type: 'suggestion'
    };

    newIteration.messages.push(initialMessage);
    setCurrentIteration(newIteration);
    setIsActive(true);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !currentIteration) return;

    const userMessage: XPMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      type: 'feedback'
    };

    const updatedIteration = {
      ...currentIteration,
      messages: [...currentIteration.messages, userMessage]
    };

    setCurrentIteration(updatedIteration);
    setUserInput('');

    setTimeout(() => {
      const aiResponse = generateRoleResponse(currentIteration.activeRole, userInput);
      const aiMessage: XPMessage = {
        id: `msg-${Date.now() + 1}`,
        role: currentIteration.activeRole,
        content: aiResponse,
        timestamp: new Date(),
        type: 'suggestion'
      };

      setCurrentIteration(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage],
        progress: Math.min(prev.progress + 10, 100)
      } : null);
    }, 1000);
  };

  const generateRoleResponse = (roleId: string, userInput: string): string => {
    const role = projectConfig.roles.find((r: any) => r.id === roleId);
    if (!role) return "I understand your input and will work on it.";

    const enhancedResponses = {
      'frontend-specialist': [
        "I'll implement this with optimized React components and ensure cross-browser compatibility.",
        "Let me create a responsive design that works perfectly on all devices.",
        "I'll focus on performance optimization and accessibility for this feature."
      ],
      'backend-specialist': [
        "I'll design efficient APIs and optimize database queries for this requirement.",
        "Let me implement proper authentication and data validation for this feature.",
        "I'll ensure scalable backend architecture for this functionality."
      ],
      'security': [
        "I'll perform a security audit and implement necessary safeguards.",
        "Let me check for potential vulnerabilities and ensure compliance.",
        "I'll implement security best practices for this feature."
      ],
      'performance-engineer': [
        "I'll analyze performance bottlenecks and optimize critical paths.",
        "Let me implement caching strategies and performance monitoring.",
        "I'll ensure this feature maintains optimal speed and efficiency."
      ]
    };

    const roleResponses = enhancedResponses[roleId as keyof typeof enhancedResponses] || [
      "I'll work on implementing this according to best practices.",
      "Let me analyze this requirement and provide an optimal solution.",
      "I'll ensure this meets our quality standards and user needs."
    ];

    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  };

  const switchRole = (roleId: string) => {
    if (!currentIteration) return;
    
    setCurrentIteration({
      ...currentIteration,
      activeRole: roleId
    });
  };

  const nextPhase = () => {
    if (!currentIteration) return;

    const currentPhaseIndex = phases.findIndex(p => p.id === currentIteration.phase);
    const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    
    setCurrentIteration({
      ...currentIteration,
      phase: phases[nextPhaseIndex].id as any,
      progress: 0
    });
  };

  const completeIteration = () => {
    if (!currentIteration) return;

    setIterationHistory(prev => [...prev, currentIteration]);
    setCurrentIteration(null);
    setIsActive(false);
  };

  const handleWorkflowOptimize = (optimizations: any) => {
    console.log('Workflow optimizations applied:', optimizations);
    // Apply workflow optimizations to current iteration
  };

  const handleModelConfigUpdate = (config: any) => {
    console.log('Model configuration updated:', config);
    // Update LLM configuration
  };

  if (!currentIteration && !isActive) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enhanced XP Development Console
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ready to Start Enhanced Development</h3>
            <p className="text-muted-foreground mb-4">
              Project: {projectConfig.projectName}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Active Roles: {projectConfig.roles.map((r: any) => r.name).join(', ')}
            </p>
            {projectConfig.features?.workflowOptimization && (
              <p className="text-sm text-green-600 mb-4">
                ✨ Workflow Optimization Enabled
              </p>
            )}
            {projectConfig.features?.realTimeTraining && (
              <p className="text-sm text-purple-600 mb-4">
                🧠 Real-Time Model Training Enabled
              </p>
            )}
          </div>
          <Button onClick={startIteration} size="lg">
            <Play className="w-4 h-4 mr-2" />
            Start Enhanced Iteration
          </Button>
          
          <XPIterationHistory iterationHistory={iterationHistory} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <XPIterationStatus
        currentIteration={currentIteration!}
        phases={phases}
        onNextPhase={nextPhase}
        onCompleteIteration={completeIteration}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversation">
            <MessageSquare className="w-4 h-4 mr-2" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Workflow className="w-4 h-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="training">
            <Brain className="w-4 h-4 mr-2" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <XPRoleSelector
              projectConfig={projectConfig}
              activeRole={currentIteration!.activeRole}
              onRoleSwitch={switchRole}
            />

            <div className="lg:col-span-3">
              <XPConversation
                messages={currentIteration!.messages}
                projectConfig={projectConfig}
                userInput={userInput}
                onUserInputChange={setUserInput}
                onSendMessage={sendMessage}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectConfig.roles.map((role: any) => (
              <Card key={role.id} className={`cursor-pointer transition-all ${
                currentIteration!.activeRole === role.id ? 'border-purple-500 bg-purple-50' : ''
              }`} onClick={() => switchRole(role.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {role.icon}
                    {role.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium">Specialization:</p>
                      <p className="text-xs text-muted-foreground">{role.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Experience:</p>
                      <p className="text-xs text-muted-foreground capitalize">{role.experienceLevel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          {projectConfig.features?.workflowOptimization && (
            <XPWorkflowOptimizer
              currentIteration={currentIteration!}
              roles={projectConfig.roles}
              onWorkflowOptimize={handleWorkflowOptimize}
            />
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {projectConfig.features?.realTimeTraining && (
            <XPModelTrainingDashboard
              llmConfig={projectConfig.llmConfig}
              onConfigUpdate={handleModelConfigUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Development Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentIteration!.messages.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages Exchanged</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {projectConfig.roles.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Roles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(currentIteration!.progress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Phase Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
