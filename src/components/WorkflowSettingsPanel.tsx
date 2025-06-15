
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface IterationSettings {
  iterationLength: string;
  autoReview: boolean;
  continuousIntegration: boolean;
  pairProgramming: boolean;
  workflowOptimization: boolean;
  realTimeTraining: boolean;
}

interface WorkflowSettingsPanelProps {
  iterationSettings: IterationSettings;
  onSettingsChange: (settings: IterationSettings) => void;
}

export function WorkflowSettingsPanel({ iterationSettings, onSettingsChange }: WorkflowSettingsPanelProps) {
  const updateSettings = (updates: Partial<IterationSettings>) => {
    onSettingsChange({ ...iterationSettings, ...updates });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Workflow Settings</CardTitle>
          <CardDescription>Configure advanced workflow optimization features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iterationLength">Iteration Length</Label>
              <Select 
                value={iterationSettings.iterationLength} 
                onValueChange={(value) => updateSettings({ iterationLength: value })}
              >
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
                  onCheckedChange={(checked) => updateSettings({ workflowOptimization: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="realTimeTraining">Real-Time Model Training</Label>
                <Switch
                  id="realTimeTraining"
                  checked={iterationSettings.realTimeTraining}
                  onCheckedChange={(checked) => updateSettings({ realTimeTraining: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoReview">Advanced Code Review</Label>
                <Switch
                  id="autoReview"
                  checked={iterationSettings.autoReview}
                  onCheckedChange={(checked) => updateSettings({ autoReview: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pairProgramming">Enhanced AI Pair Programming</Label>
                <Switch
                  id="pairProgramming"
                  checked={iterationSettings.pairProgramming}
                  onCheckedChange={(checked) => updateSettings({ pairProgramming: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
