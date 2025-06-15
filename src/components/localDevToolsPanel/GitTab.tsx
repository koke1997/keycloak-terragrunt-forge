
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch } from "lucide-react";
import { GitOperation } from "./localDevToolsTypes";
import { toast } from "@/hooks/use-toast";

type GitTabProps = {
  projectPath: string;
  setProjectPath: React.Dispatch<React.SetStateAction<string>>;
  gitBranch: string;
  setGitBranch: React.Dispatch<React.SetStateAction<string>>;
  commitMessage: string;
  setCommitMessage: React.Dispatch<React.SetStateAction<string>>;
  commonGitOperations: GitOperation[];
};

export function GitTab({
  projectPath,
  setProjectPath,
  gitBranch,
  setGitBranch,
  commitMessage,
  setCommitMessage,
  commonGitOperations
}: GitTabProps) {

  const executeGitCommand = (operation: GitOperation) => {
    console.log(`Executing: ${operation.command}`);
    toast({
      title: "Git Command",
      description: `Executed: ${operation.description}`
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Project Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Project Path</Label>
            <Input
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/path/to/project"
            />
          </div>
          <div>
            <Label>Current Branch</Label>
            <Input
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder="main"
            />
          </div>
          <div>
            <Label>Commit Message</Label>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="feat: add new feature"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Git Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {commonGitOperations.map((operation, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => executeGitCommand(operation)}
                className="w-full justify-start"
              >
                <GitBranch className="w-3 h-3 mr-2" />
                {operation.description}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
