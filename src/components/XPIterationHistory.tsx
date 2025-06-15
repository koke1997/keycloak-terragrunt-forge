
import React from "react";
import { Badge } from "@/components/ui/badge";

interface XPIteration {
  id: string;
  phase: 'planning' | 'development' | 'testing' | 'review' | 'retrospective';
  activeRole: string;
  progress: number;
  messages: any[];
  startTime: Date;
  estimatedEndTime: Date;
}

interface XPIterationHistoryProps {
  iterationHistory: XPIteration[];
}

export function XPIterationHistory({ iterationHistory }: XPIterationHistoryProps) {
  if (iterationHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="font-medium mb-2">Previous Iterations</h4>
      {iterationHistory.map((iteration, index) => (
        <Badge key={iteration.id} variant="secondary" className="mr-2">
          Iteration {index + 1} - Completed
        </Badge>
      ))}
    </div>
  );
}
