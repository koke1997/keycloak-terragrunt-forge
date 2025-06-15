import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, 
  Dock, 
  GitBranch, 
  Database, 
  Server, 
  Code2, 
  Package, 
  Settings,
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Folder,
  FileText,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DockerService {
  name: string;
  image: string;
  port: string;
  status: 'running' | 'stopped' | 'building';
  description: string;
}

interface GitOperation {
  type: 'commit' | 'push' | 'pull' | 'branch' | 'merge';
  description: string;
  command: string;
}

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

  const packageScripts = [
    { name: 'dev', description: 'Start development server', command: `${packageManager} run dev` },
    { name: 'build', description: 'Build for production', command: `${packageManager} run build` },
    { name: 'test', description: 'Run test suite', command: `${packageManager} test` },
    { name: 'lint', description: 'Lint code', command: `${packageManager} run lint` },
    { name: 'format', description: 'Format code', command: `${packageManager} run format` },
    { name: 'install', description: 'Install dependencies', command: `${packageManager} install` }
  ];

  const toggleDockerService = (serviceName: string) => {
    setDockerServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: service.status === 'running' ? 'stopped' : 'running' }
        : service
    ));
    
    toast({
      title: "Docker Service",
      description: `${serviceName} ${dockerServices.find(s => s.name === serviceName)?.status === 'running' ? 'stopped' : 'started'}`
    });
  };

  const executeGitCommand = (operation: GitOperation) => {
    console.log(`Executing: ${operation.command}`);
    toast({
      title: "Git Command",
      description: `Executed: ${operation.description}`
    });
  };

  const executePackageScript = (script: { name: string; command: string; description: string }) => {
    console.log(`Executing: ${script.command}`);
    toast({
      title: "Package Script",
      description: `Running: ${script.description}`
    });
  };

  const generateDockerCompose = () => {
    const compose = `version: '3.8'
services:
${dockerServices.map(service => `  ${service.name.toLowerCase()}:
    image: ${service.image}
    ports:
      - "${service.port}:${service.port}"
    environment:
      - NODE_ENV=development`).join('\n')}

networks:
  dev-network:
    driver: bridge
`;

    navigator.clipboard.writeText(compose);
    toast({
      title: "Docker Compose Generated",
      description: "Configuration copied to clipboard"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <TabsTrigger value="docker">
                <Dock className="w-4 h-4 mr-2" />
                Docker
              </TabsTrigger>
              <TabsTrigger value="git">
                <GitBranch className="w-4 h-4 mr-2" />
                Git
              </TabsTrigger>
              <TabsTrigger value="packages">
                <Package className="w-4 h-4 mr-2" />
                Packages
              </TabsTrigger>
              <TabsTrigger value="database">
                <Database className="w-4 h-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger value="deployment">
                <Server className="w-4 h-4 mr-2" />
                Deploy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="docker" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Docker Services</h3>
                <Button onClick={generateDockerCompose} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate docker-compose.yml
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dockerServices.map(service => (
                  <Card key={service.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Dock className="w-4 h-4" />
                          <CardTitle className="text-sm">{service.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium">Image:</span> {service.image}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Port:</span> {service.port}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => toggleDockerService(service.name)}
                          className="w-full"
                        >
                          {service.status === 'running' ? (
                            <>
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="git" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Label>Package Manager:</Label>
                <div className="flex gap-2">
                  {(['npm', 'yarn', 'pnpm', 'bun'] as const).map(pm => (
                    <Button
                      key={pm}
                      variant={packageManager === pm ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPackageManager(pm)}
                    >
                      {pm}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageScripts.map((script, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {script.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{script.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <code className="text-xs bg-gray-100 p-2 rounded block">
                          {script.command}
                        </code>
                        <Button 
                          size="sm" 
                          onClick={() => executePackageScript(script)}
                          className="w-full"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Database Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="w-3 h-3 mr-2" />
                      Run Migrations
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Seed Database
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-3 h-3 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Upload className="w-3 h-3 mr-2" />
                      Restore Database
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Connection Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">PostgreSQL</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Redis</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Elasticsearch</span>
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Disconnected
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Deployment Targets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Server className="w-3 h-3 mr-2" />
                      Deploy to Staging
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Server className="w-3 h-3 mr-2" />
                      Deploy to Production
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="w-3 h-3 mr-2" />
                      Deploy to Vercel
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="w-3 h-3 mr-2" />
                      Deploy to Netlify
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Build Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Build</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Build Time</span>
                        <span className="text-sm text-muted-foreground">2m 34s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Deploy</span>
                        <span className="text-sm text-muted-foreground">5 min ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
