import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";
import { DockerTab } from "./localDevToolsPanel/DockerTab";
import { GitTab } from "./localDevToolsPanel/GitTab";
import { PackagesTab } from "./localDevToolsPanel/PackagesTab";
import { DatabaseTab } from "./localDevToolsPanel/DatabaseTab";
import { DeployTab } from "./localDevToolsPanel/DeployTab";
import { GitOperation, DockerService, PackageScript } from "./localDevToolsPanel/localDevToolsTypes";

// Keeping the same toast import and no logic change!
import { toast } from "@/hooks/use-toast";

export function LocalDevToolsPanel() {
  const [dockerServices, setDockerServices] = useState<DockerService[]>([
    { name: 'PostgreSQL', image: 'postgres:15', port: '5432', status: 'running', description: 'Main database' },
    { name: 'Redis', image: 'redis:7', port: '6379', status: 'running', description: 'Cache & sessions' },
    { name: 'Nginx', image: 'nginx:alpine', port: '80', status: 'stopped', description: 'Reverse proxy' },
    { name: 'Elasticsearch', image: 'elasticsearch:8.11', port: '9200', status: 'stopped', description: 'Search engine' }
  ]);

  const [projectPath, setProjectPath] = useState('/home/user/projects/my-app');
  const [gitBranch, setGitBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm' | 'bun'>('npm');

  const commonGitOperations: GitOperation[] = [
    { type: 'commit', description: 'Commit changes', command: 'git add . && git commit -m "feat: implement feature"' },
    { type: 'push', description: 'Push to remote', command: 'git push origin main' },
    { type: 'pull', description: 'Pull latest changes', command: 'git pull origin main' },
    { type: 'branch', description: 'Create new branch', command: 'git checkout -b feature/new-feature' },
    { type: 'merge', description: 'Merge branch', command: 'git merge feature/branch-name' }
  ];

  const packageScripts: PackageScript[] = [
    { name: 'dev', description: 'Start development server', command: `${packageManager} run dev` },
    { name: 'build', description: 'Build for production', command: `${packageManager} run build` },
    { name: 'test', description: 'Run test suite', command: `${packageManager} test` },
    { name: 'lint', description: 'Lint code', command: `${packageManager} run lint` },
    { name: 'format', description: 'Format code', command: `${packageManager} run format` },
    { name: 'install', description: 'Install dependencies', command: `${packageManager} install` }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Local Development Tools
          </CardTitle>
          <CardDescription>
            Manage your local development environment, services, and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="docker" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="docker">Docker</TabsTrigger>
              <TabsTrigger value="git">Git</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="deployment">Deploy</TabsTrigger>
            </TabsList>

            <TabsContent value="docker" className="space-y-4">
              <DockerTab dockerServices={dockerServices} setDockerServices={setDockerServices} />
            </TabsContent>

            <TabsContent value="git" className="space-y-4">
              <GitTab
                projectPath={projectPath}
                setProjectPath={setProjectPath}
                gitBranch={gitBranch}
                setGitBranch={setGitBranch}
                commitMessage={commitMessage}
                setCommitMessage={setCommitMessage}
                commonGitOperations={commonGitOperations}
              />
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              <PackagesTab
                packageManager={packageManager}
                setPackageManager={setPackageManager}
                packageScripts={packageScripts}
              />
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <DatabaseTab />
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4">
              <DeployTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
