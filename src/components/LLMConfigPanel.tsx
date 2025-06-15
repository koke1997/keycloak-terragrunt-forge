
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface LLMConfigPanelProps {
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

export function LLMConfigPanel({ llmConfig, onConfigChange }: LLMConfigPanelProps) {
  const updateConfig = (updates: Partial<LLMConfig>) => {
    onConfigChange({ ...llmConfig, ...updates });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Local LLM Configuration</CardTitle>
          <CardDescription>Configure your local LLM for AI-assisted development</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">LLM Provider</Label>
              <Select 
                value={llmConfig.provider} 
                onValueChange={(value: any) => updateConfig({ provider: value })}
              >
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
                onChange={(e) => updateConfig({ endpoint: e.target.value })}
                placeholder="http://localhost:11434"
              />
            </div>

            <div>
              <Label htmlFor="model">Model Name</Label>
              <Input
                id="model"
                value={llmConfig.model}
                onChange={(e) => updateConfig({ model: e.target.value })}
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
                onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
