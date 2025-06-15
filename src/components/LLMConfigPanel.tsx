
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Link } from "lucide-react";

interface LLMConfig {
  provider: 'ollama' | 'llamacpp' | 'openai-compatible' | 'huggingface';
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens?: number;
  githubToken?: string;
  huggingfaceToken?: string;
}

interface LLMConfigPanelProps {
  llmConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

export function LLMConfigPanel({ llmConfig, onConfigChange }: LLMConfigPanelProps) {
  const [inputHFToken, setInputHFToken] = useState("");
  const [inputGitHubToken, setInputGitHubToken] = useState("");

  const updateConfig = (updates: Partial<LLMConfig>) => {
    onConfigChange({ ...llmConfig, ...updates });
  };

  const handleLoginHF = () => {
    if (inputHFToken.trim()) {
      updateConfig({ provider: "huggingface", huggingfaceToken: inputHFToken.trim() });
      setInputHFToken("");
    }
  };

  const handleLoginGitHub = () => {
    if (inputGitHubToken.trim()) {
      updateConfig({ githubToken: inputGitHubToken.trim() });
      setInputGitHubToken("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>LLM & Service Configuration</CardTitle>
          <CardDescription>
            Configure your local or cloud LLM (llama.cpp, Hugging Face, OpenAI-compatible), and optionally connect free services.
          </CardDescription>
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
                  <SelectItem value="llamacpp">llama.cpp (local, WebGPU/WebAssembly)</SelectItem>
                  <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
                  <SelectItem value="huggingface">Hugging Face Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endpoint">
                API Endpoint <span className="ml-2 text-xs text-muted-foreground">
                  {llmConfig.provider === "llamacpp"
                    ? "(run locally, e.g. http://localhost:8000)"
                    : llmConfig.provider === "openai-compatible"
                    ? "(OpenAI/Supabase/Other endpoint)"
                    : llmConfig.provider === "huggingface"
                    ? "(HF Inference endpoint or leave blank for hub)"
                    : ""}
                </span>
              </Label>
              <Input
                id="endpoint"
                value={llmConfig.endpoint}
                onChange={(e) => updateConfig({ endpoint: e.target.value })}
                placeholder={
                  llmConfig.provider === "llamacpp"
                    ? "http://localhost:8000"
                    : llmConfig.provider === "huggingface"
                    ? "https://api-inference.huggingface.co/models/[repo]"
                    : "http://localhost:11434"
                }
              />
            </div>

            <div>
              <Label htmlFor="model">Model Name</Label>
              <Input
                id="model"
                value={llmConfig.model}
                onChange={(e) => updateConfig({ model: e.target.value })}
                placeholder="e.g. phi3, codellama, mistral, etc."
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

          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">Optional Integrations:</Badge>
              <span className="text-xs text-muted-foreground ml-2">
                Enhance LLM access and project workflows by connecting below:
              </span>
            </div>
            {/* Hugging Face Login */}
            <div className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="Hugging Face API Token (inference or free)"
                value={inputHFToken}
                onChange={(e) => setInputHFToken(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleLoginHF} size="sm" variant="outline">
                <Link className="w-4 h-4 mr-1" /> Connect Hugging Face
              </Button>
              {llmConfig.huggingfaceToken && (
                <Badge className="bg-green-200 text-green-800 ml-2">Connected</Badge>
              )}
            </div>
            {/* GitHub Login */}
            <div className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="GitHub Personal Access Token"
                value={inputGitHubToken}
                onChange={(e) => setInputGitHubToken(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleLoginGitHub} size="sm" variant="outline">
                <Github className="w-4 h-4 mr-1" /> Connect GitHub
              </Button>
              {llmConfig.githubToken && (
                <Badge className="bg-green-200 text-green-800 ml-2">Connected</Badge>
              )}
            </div>
          </div>
          {/* Llama.cpp Guidance */}
          <div className="mt-4">
            <Label>llama.cpp Tips</Label>
            <ul className="text-xs text-muted-foreground list-disc pl-5">
              <li>
                To run llama.cpp locally, start your server and point to <code>http://localhost:8000</code> (or your configured endpoint).
              </li>
              <li>
                For browser-based or WebGPU LLMs, see &nbsp;
                <a
                  className="underline text-purple-600"
                  href="https://github.com/abetlen/llama-cpp-python#web-server"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  llama.cpp docs
                </a>
                &nbsp; or launch models via Hugging Face Inference endpoints.
              </li>
              <li>
                All features here require only public/free tokens—never store secrets in your code.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
