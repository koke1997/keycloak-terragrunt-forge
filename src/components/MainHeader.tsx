
import { Badge } from "@/components/ui/badge";
import { Zap, FileText, Layers, Settings, Rocket, Brain, Users } from "lucide-react";

export function MainHeader() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
        <Zap className="w-8 h-8 text-blue-600" />
        Infrastructure Code Booster
      </h1>
      <p className="text-xl text-muted-foreground mb-4">
        Generate optimized Terragrunt infrastructure from Keycloak realms, Spring Boot apps, and more
      </p>
      <div className="flex justify-center gap-2 mb-6">
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Keycloak Support
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          Spring Boot Integration
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Settings className="w-3 h-3" />
          Visual Configuration
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Rocket className="w-3 h-3" />
          Local Dev Setup
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Brain className="w-3 h-3" />
          AI-Powered XP
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          Team Collaboration
        </Badge>
      </div>
    </div>
  );
}
