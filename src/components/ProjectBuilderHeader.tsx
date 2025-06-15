
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Zap,
  Workflow,
  Target,
  Users,
  Bot
} from "lucide-react";

export function ProjectBuilderHeader() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Enhanced AI-Powered XP Project Builder
        </h2>
        <p className="text-muted-foreground">
          Advanced workflow optimization with expanded roles, AI agent management, and compliance automation
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
              <span className="text-sm font-medium">21+ Specialized Roles</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">AI Agent Swarm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
