
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface XPIteration {
  id: string;
  phase: 'planning' | 'development' | 'testing' | 'review' | 'retrospective';
  activeRole: string;
  progress: number;
  messages: any[];
  startTime: Date;
  estimatedEndTime: Date;
}

interface XPIterationStatusProps {
  currentIteration: XPIteration;
  phases: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
  }>;
  onNextPhase: () => void;
  onCompleteIteration: () => void;
}

export function XPIterationStatus({ 
  currentIteration, 
  phases, 
  onNextPhase, 
  onCompleteIteration 
}: XPIterationStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Iteration - {phases.find(p => p.id === currentIteration.phase)?.name}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onNextPhase}>
              Next Phase
            </Button>
            <Button variant="outline" size="sm" onClick={onCompleteIteration}>
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
                  currentIteration.phase === phase.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {phase.icon}
                {phase.name}
              </div>
            ))}
          </div>
          <Progress value={currentIteration.progress || 0} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
