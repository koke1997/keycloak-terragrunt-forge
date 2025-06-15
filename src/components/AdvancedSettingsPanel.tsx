
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdvancedSettingsPanelProps {
  customRequirements: string;
  onRequirementsChange: (requirements: string) => void;
}

export function AdvancedSettingsPanel({ 
  customRequirements, 
  onRequirementsChange 
}: AdvancedSettingsPanelProps) {
  return (
    <div className="space-y-4">
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
              onChange={(e) => onRequirementsChange(e.target.value)}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
