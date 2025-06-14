
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  MessageSquare, 
  GitCommit,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Brain
} from "lucide-react";

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

    // Add initial planning message
    const initialMessage: XPMessage = {
      id: `msg-${Date.now()}`,
      role: 'customer',
      content: `Starting new iteration for ${projectConfig.projectName}. Let's define the user stories and priorities for this iteration.`,
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

    // Simulate AI role response
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

    const responses = {
      customer: [
        "That's a great user story! Let me add it to our backlog with priority.",
        "I think we should focus on the core user experience first.",
        "This feature would provide significant business value to our users."
      ],
      developer: [
        "I can implement this using the tech stack we've defined.",
        "Let me break this down into smaller, manageable tasks.",
        "I'll need to consider the architecture implications of this change."
      ],
      tester: [
        "I'll create comprehensive test cases for this functionality.",
        "We should consider edge cases and error handling scenarios.",
        "Let me verify this meets our quality standards."
      ],
      designer: [
        "I'll create wireframes and user flow diagrams for this feature.",
        "We should ensure this maintains consistency with our design system.",
        "Let me consider the accessibility implications of this design."
      ]
    };

    const roleResponses = responses[roleId as keyof typeof responses] || ["I'll work on that."];
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

  if (!currentIteration && !isActive) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            XP Development Console
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ready to Start Development</h3>
            <p className="text-muted-foreground mb-4">
              Project: {projectConfig.projectName}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Active Roles: {projectConfig.roles.map((r: any) => r.name).join(', ')}
            </p>
          </div>
          <Button onClick={startIteration} size="lg">
            <Play className="w-4 h-4 mr-2" />
            Start First Iteration
          </Button>
          
          {iterationHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Previous Iterations</h4>
              {iterationHistory.map((iteration, index) => (
                <Badge key={iteration.id} variant="secondary" className="mr-2">
                  Iteration {index + 1} - Completed
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Iteration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Iteration - {phases.find(p => p.id === currentIteration?.phase)?.name}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={nextPhase}>
                Next Phase
              </Button>
              <Button variant="outline" size="sm" onClick={completeIteration}>
                Complete Iteration
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {phases.map(phase => (
                <div
                  key={phase.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    currentIteration?.phase === phase.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {phase.icon}
                  {phase.name}
                </div>
              ))}
            </div>
            <Progress value={currentIteration?.progress || 0} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Active Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectConfig.roles.map((role: any) => (
                <Button
                  key={role.id}
                  variant={currentIteration?.activeRole === role.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => switchRole(role.id)}
                >
                  {role.icon}
                  <span className="ml-2">{role.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Development Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 mb-4">
              <div className="space-y-4">
                {currentIteration?.messages.map(message => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-50 ml-8'
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {message.role === 'user' ? 'You' : 
                         projectConfig.roles.find((r: any) => r.id === message.role)?.name || message.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Share your thoughts, feedback, or requirements..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              />
              <Button onClick={sendMessage} disabled={!userInput.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
