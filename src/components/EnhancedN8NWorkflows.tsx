
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Workflow, 
  Zap, 
  Download, 
  Copy, 
  Settings, 
  Play,
  GitBranch,
  MessageSquare,
  Mail,
  Database,
  Shield,
  Code2,
  TestTube,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  Webhook
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface N8NWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'cicd' | 'notifications' | 'monitoring' | 'automation' | 'integration' | 'security';
  triggers: string[];
  nodes: string[];
  complexity: 'simple' | 'intermediate' | 'advanced';
  workflow: any;
}

export function EnhancedN8NWorkflows() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8NWorkflowTemplate | null>(null);
  const [n8nEndpoint, setN8nEndpoint] = useState('https://n8n.example.com');

  const workflowTemplates: N8NWorkflowTemplate[] = [
    {
      id: 'git-cicd',
      name: 'Git CI/CD Pipeline',
      description: 'Automated testing and deployment on git push',
      category: 'cicd',
      triggers: ['GitHub Webhook', 'GitLab Webhook'],
      nodes: ['GitHub', 'Docker', 'Slack', 'HTTP Request'],
      complexity: 'intermediate',
      workflow: {
        nodes: [
          {
            "name": "GitHub Webhook",
            "type": "n8n-nodes-base.githubTrigger",
            "position": [250, 300],
            "parameters": {
              "events": ["push", "pull_request"],
              "repository": "owner/repo"
            }
          },
          {
            "name": "Run Tests",
            "type": "n8n-nodes-base.httpRequest",
            "position": [450, 300],
            "parameters": {
              "method": "POST",
              "url": "=https://api.github.com/repos/{{$node['GitHub Webhook'].json['repository']['full_name']}}/actions/workflows/test.yml/dispatches"
            }
          },
          {
            "name": "Deploy to Staging",
            "type": "n8n-nodes-base.httpRequest",
            "position": [650, 300],
            "parameters": {
              "method": "POST",
              "url": "https://deploy.example.com/staging"
            }
          },
          {
            "name": "Notify Team",
            "type": "n8n-nodes-base.slack",
            "position": [850, 300],
            "parameters": {
              "channel": "#deployments",
              "text": "=New deployment: {{$node['GitHub Webhook'].json['head_commit']['message']}}"
            }
          }
        ]
      }
    },
    {
      id: 'code-review-automation',
      name: 'Automated Code Review',
      description: 'AI-powered code review and quality checks',
      category: 'cicd',
      triggers: ['Pull Request'],
      nodes: ['GitHub', 'OpenAI', 'SonarQube', 'Slack'],
      complexity: 'advanced',
      workflow: {
        nodes: [
          {
            "name": "PR Created",
            "type": "n8n-nodes-base.githubTrigger",
            "position": [250, 300],
            "parameters": {
              "events": ["pull_request"]
            }
          },
          {
            "name": "Get PR Diff",
            "type": "n8n-nodes-base.github",
            "position": [450, 300],
            "parameters": {
              "operation": "getCompare",
              "owner": "={{$node['PR Created'].json['repository']['owner']['login']}}",
              "repo": "={{$node['PR Created'].json['repository']['name']}}"
            }
          },
          {
            "name": "AI Code Review",
            "type": "n8n-nodes-base.openAi",
            "position": [650, 300],
            "parameters": {
              "model": "gpt-4",
              "prompt": "=Review this code diff and provide feedback: {{$node['Get PR Diff'].json['files']}}"
            }
          },
          {
            "name": "Post Review Comment",
            "type": "n8n-nodes-base.github",
            "position": [850, 300],
            "parameters": {
              "operation": "createReview",
              "body": "={{$node['AI Code Review'].json['choices'][0]['message']['content']}}"
            }
          }
        ]
      }
    },
    {
      id: 'security-scanner',
      name: 'Security Vulnerability Scanner',
      description: 'Automated security scanning and alerting',
      category: 'security',
      triggers: ['Schedule', 'Code Push'],
      nodes: ['GitHub', 'Snyk', 'Email', 'Slack'],
      complexity: 'intermediate',
      workflow: {
        nodes: [
          {
            "name": "Daily Security Scan",
            "type": "n8n-nodes-base.scheduleTrigger",
            "position": [250, 300],
            "parameters": {
              "rule": {
                "interval": [{"field": "cronExpression", "value": "0 9 * * *"}]
              }
            }
          },
          {
            "name": "Scan Dependencies",
            "type": "n8n-nodes-base.httpRequest",
            "position": [450, 300],
            "parameters": {
              "method": "POST",
              "url": "https://api.snyk.io/v1/test",
              "body": {
                "type": "npm"
              }
            }
          },
          {
            "name": "Check Vulnerabilities",
            "type": "n8n-nodes-base.if",
            "position": [650, 300],
            "parameters": {
              "conditions": {
                "number": [{"value1": "={{$node['Scan Dependencies'].json['issues'].length}}", "operation": "larger", "value2": 0}]
              }
            }
          },
          {
            "name": "Send Alert",
            "type": "n8n-nodes-base.slack",
            "position": [850, 200],
            "parameters": {
              "channel": "#security",
              "text": "=🚨 Security vulnerabilities found: {{$node['Scan Dependencies'].json['issues'].length}} issues"
            }
          }
        ]
      }
    },
    {
      id: 'performance-monitor',
      name: 'Performance Monitoring',
      description: 'Monitor app performance and send alerts',
      category: 'monitoring',
      triggers: ['Schedule', 'Webhook'],
      nodes: ['HTTP Request', 'Google Sheets', 'Email', 'Discord'],
      complexity: 'simple',
      workflow: {
        nodes: [
          {
            "name": "Performance Check",
            "type": "n8n-nodes-base.scheduleTrigger",
            "position": [250, 300],
            "parameters": {
              "rule": {
                "interval": [{"field": "minutes", "value": 15}]
              }
            }
          },
          {
            "name": "Test API Response",
            "type": "n8n-nodes-base.httpRequest",
            "position": [450, 300],
            "parameters": {
              "method": "GET",
              "url": "https://your-api.com/health",
              "options": {
                "timeout": 5000
              }
            }
          },
          {
            "name": "Log Performance",
            "type": "n8n-nodes-base.googleSheets",
            "position": [650, 300],
            "parameters": {
              "operation": "append",
              "values": {
                "timestamp": "={{new Date().toISOString()}}",
                "response_time": "={{$node['Test API Response'].json['response_time']}}",
                "status": "={{$node['Test API Response'].json['status']}}"
              }
            }
          }
        ]
      }
    },
    {
      id: 'database-backup',
      name: 'Automated Database Backup',
      description: 'Regular database backups with cloud storage',
      category: 'automation',
      triggers: ['Schedule'],
      nodes: ['PostgreSQL', 'AWS S3', 'Email', 'Slack'],
      complexity: 'intermediate',
      workflow: {
        nodes: [
          {
            "name": "Daily Backup",
            "type": "n8n-nodes-base.scheduleTrigger",
            "position": [250, 300],
            "parameters": {
              "rule": {
                "interval": [{"field": "cronExpression", "value": "0 2 * * *"}]
              }
            }
          },
          {
            "name": "Create DB Dump",
            "type": "n8n-nodes-base.postgres",
            "position": [450, 300],
            "parameters": {
              "operation": "executeQuery",
              "query": "pg_dump database_name"
            }
          },
          {
            "name": "Upload to S3",
            "type": "n8n-nodes-base.s3",
            "position": [650, 300],
            "parameters": {
              "operation": "upload",
              "bucket": "database-backups",
              "key": "=backup-{{new Date().toISOString().split('T')[0]}}.sql"
            }
          },
          {
            "name": "Backup Confirmation",
            "type": "n8n-nodes-base.slack",
            "position": [850, 300],
            "parameters": {
              "channel": "#ops",
              "text": "✅ Daily database backup completed successfully"
            }
          }
        ]
      }
    },
    {
      id: 'user-onboarding',
      name: 'User Onboarding Automation',
      description: 'Automated welcome emails and setup tasks',
      category: 'automation',
      triggers: ['Webhook', 'Database'],
      nodes: ['HTTP Request', 'Email', 'Slack', 'Airtable'],
      complexity: 'simple',
      workflow: {
        nodes: [
          {
            "name": "New User Signup",
            "type": "n8n-nodes-base.webhook",
            "position": [250, 300],
            "parameters": {
              "httpMethod": "POST",
              "path": "new-user"
            }
          },
          {
            "name": "Send Welcome Email",
            "type": "n8n-nodes-base.emailSend",
            "position": [450, 300],
            "parameters": {
              "toEmail": "={{$node['New User Signup'].json['email']}}",
              "subject": "Welcome to our platform!",
              "text": "=Hi {{$node['New User Signup'].json['name']}}, welcome to our platform!"
            }
          },
          {
            "name": "Add to CRM",
            "type": "n8n-nodes-base.airtable",
            "position": [650, 300],
            "parameters": {
              "operation": "create",
              "table": "Users",
              "fields": {
                "Name": "={{$node['New User Signup'].json['name']}}",
                "Email": "={{$node['New User Signup'].json['email']}}",
                "Signup Date": "={{new Date().toISOString()}}"
              }
            }
          },
          {
            "name": "Notify Sales Team",
            "type": "n8n-nodes-base.slack",
            "position": [850, 300],
            "parameters": {
              "channel": "#sales",
              "text": "=🎉 New user signup: {{$node['New User Signup'].json['name']}} ({{$node['New User Signup'].json['email']}})"
            }
          }
        ]
      }
    },
    {
      id: 'error-monitoring',
      name: 'Error Monitoring & Alerting',
      description: 'Monitor application errors and send alerts',
      category: 'monitoring',
      triggers: ['Webhook', 'HTTP'],
      nodes: ['HTTP Request', 'Discord', 'Email', 'PagerDuty'],
      complexity: 'intermediate',
      workflow: {
        nodes: [
          {
            "name": "Error Webhook",
            "type": "n8n-nodes-base.webhook",
            "position": [250, 300],
            "parameters": {
              "httpMethod": "POST",
              "path": "error-alert"
            }
          },
          {
            "name": "Parse Error",
            "type": "n8n-nodes-base.set",
            "position": [450, 300],
            "parameters": {
              "values": {
                "error_level": "={{$node['Error Webhook'].json['level']}}",
                "error_message": "={{$node['Error Webhook'].json['message']}}",
                "stack_trace": "={{$node['Error Webhook'].json['stack']}}"
              }
            }
          },
          {
            "name": "Check Severity",
            "type": "n8n-nodes-base.if",
            "position": [650, 300],
            "parameters": {
              "conditions": {
                "string": [{"value1": "={{$node['Parse Error'].json['error_level']}}", "operation": "equal", "value2": "critical"}]
              }
            }
          },
          {
            "name": "Critical Alert",
            "type": "n8n-nodes-base.discord",
            "position": [850, 200],
            "parameters": {
              "channel": "alerts",
              "text": "=🚨 CRITICAL ERROR: {{$node['Parse Error'].json['error_message']}}"
            }
          },
          {
            "name": "Regular Alert",
            "type": "n8n-nodes-base.slack",
            "position": [850, 400],
            "parameters": {
              "channel": "#errors",
              "text": "=⚠️ Error reported: {{$node['Parse Error'].json['error_message']}}"
            }
          }
        ]
      }
    },
    {
      id: 'api-integration',
      name: 'Third-party API Integration',
      description: 'Sync data between different services',
      category: 'integration',
      triggers: ['Schedule', 'Webhook'],
      nodes: ['HTTP Request', 'MySQL', 'Airtable', 'Slack'],
      complexity: 'advanced',
      workflow: {
        nodes: [
          {
            "name": "Sync Trigger",
            "type": "n8n-nodes-base.scheduleTrigger",
            "position": [250, 300],
            "parameters": {
              "rule": {
                "interval": [{"field": "hours", "value": 1}]
              }
            }
          },
          {
            "name": "Fetch External Data",
            "type": "n8n-nodes-base.httpRequest",
            "position": [450, 300],
            "parameters": {
              "method": "GET",
              "url": "https://api.external-service.com/data",
              "authentication": "genericCredentialType",
              "genericAuthType": "httpHeaderAuth"
            }
          },
          {
            "name": "Transform Data",
            "type": "n8n-nodes-base.set",
            "position": [650, 300],
            "parameters": {
              "values": {
                "transformed_data": "={{$node['Fetch External Data'].json.map(item => ({ id: item.id, name: item.title, updated: new Date().toISOString() }))}}"
              }
            }
          },
          {
            "name": "Update Database",
            "type": "n8n-nodes-base.mysql",
            "position": [850, 300],
            "parameters": {
              "operation": "insert",
              "table": "synced_data",
              "columns": "id,name,updated_at"
            }
          }
        ]
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Workflow className="w-4 h-4" /> },
    { id: 'cicd', name: 'CI/CD', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'monitoring', name: 'Monitoring', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'automation', name: 'Automation', icon: <Bot className="w-4 h-4" /> },
    { id: 'integration', name: 'Integration', icon: <Zap className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  const filteredWorkflows = selectedCategory === 'all' 
    ? workflowTemplates 
    : workflowTemplates.filter(w => w.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(c => c.id === category);
    return categoryObj?.icon || <Workflow className="w-4 h-4" />;
  };

  const exportWorkflow = (workflow: N8NWorkflowTemplate) => {
    const workflowData = {
      name: workflow.name,
      nodes: workflow.workflow.nodes,
      connections: {},
      active: false,
      settings: {},
      id: workflow.id
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Workflow Exported",
      description: `${workflow.name} workflow downloaded as JSON`
    });
  };

  const copyWorkflowCode = (workflow: N8NWorkflowTemplate) => {
    navigator.clipboard.writeText(JSON.stringify(workflow.workflow, null, 2));
    toast({
      title: "Workflow Copied",
      description: "Workflow JSON copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Enhanced N8N Workflow Templates
          </CardTitle>
          <CardDescription>
            Pre-built workflow templates for common development and automation tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Label>N8N Instance URL:</Label>
              <Input
                value={n8nEndpoint}
                onChange={(e) => setN8nEndpoint(e.target.value)}
                placeholder="https://n8n.example.com"
                className="max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows.map(workflow => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(workflow.category)}
                        <CardTitle className="text-sm">{workflow.name}</CardTitle>
                      </div>
                      <Badge className={getComplexityColor(workflow.complexity)}>
                        {workflow.complexity}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium mb-1">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {workflow.triggers.map(trigger => (
                            <Badge key={trigger} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1">Nodes:</p>
                        <div className="flex flex-wrap gap-1">
                          {workflow.nodes.map(node => (
                            <Badge key={node} variant="secondary" className="text-xs">
                              {node}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            setShowWorkflowDialog(true);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportWorkflow(workflow)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyWorkflowCode(workflow)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkflow && getCategoryIcon(selectedWorkflow.category)}
              {selectedWorkflow?.name}
            </DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Workflow Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant="outline">{selectedWorkflow.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Complexity:</span>
                      <Badge className={getComplexityColor(selectedWorkflow.complexity)}>
                        {selectedWorkflow.complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Nodes:</span>
                      <span>{selectedWorkflow.nodes.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Import Instructions:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Export the workflow JSON</li>
                    <li>Open your N8N instance</li>
                    <li>Go to Workflows → Import</li>
                    <li>Upload the JSON file</li>
                    <li>Configure credentials</li>
                    <li>Activate the workflow</li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Workflow JSON:</h4>
                <Textarea
                  value={JSON.stringify(selectedWorkflow.workflow, null, 2)}
                  readOnly
                  rows={15}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => copyWorkflowCode(selectedWorkflow)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
                <Button onClick={() => exportWorkflow(selectedWorkflow)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
