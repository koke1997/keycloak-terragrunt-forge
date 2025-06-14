
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Network, 
  Shield, 
  Database, 
  Settings, 
  Code, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Copy
} from "lucide-react";

interface NetworkConfig {
  vpcCidr: string;
  privateSubnets: string[];
  publicSubnets: string[];
  enableNatGateway: boolean;
  enableVpnGateway: boolean;
}

interface SecretConfig {
  name: string;
  value: string;
  type: 'password' | 'api_key' | 'certificate' | 'custom';
  description: string;
}

interface TerragruntConfig {
  projectName: string;
  environment: string;
  region: string;
  networkConfig: NetworkConfig;
  secrets: SecretConfig[];
  enableMonitoring: boolean;
  enableBackup: boolean;
  tags: Record<string, string>;
}

interface TerragruntConfigPanelProps {
  onConfigChange: (config: TerragruntConfig) => void;
  onGenerateCode: () => void;
}

export function TerragruntConfigPanel({ onConfigChange, onGenerateCode }: TerragruntConfigPanelProps) {
  const [config, setConfig] = useState<TerragruntConfig>({
    projectName: 'keycloak-project',
    environment: 'dev',
    region: 'eu-central-1',
    networkConfig: {
      vpcCidr: '10.0.0.0/16',
      privateSubnets: ['10.0.1.0/24', '10.0.2.0/24'],
      publicSubnets: ['10.0.101.0/24', '10.0.102.0/24'],
      enableNatGateway: true,
      enableVpnGateway: false
    },
    secrets: [
      { name: 'keycloak_admin_password', value: '', type: 'password', description: 'Keycloak admin console password' },
      { name: 'database_password', value: '', type: 'password', description: 'Database password for Keycloak' }
    ],
    enableMonitoring: true,
    enableBackup: true,
    tags: {
      'Environment': 'dev',
      'Project': 'keycloak-project',
      'ManagedBy': 'terragrunt'
    }
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const updateConfig = (updates: Partial<TerragruntConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const updateNetworkConfig = (updates: Partial<NetworkConfig>) => {
    updateConfig({
      networkConfig: { ...config.networkConfig, ...updates }
    });
  };

  const addSecret = () => {
    const newSecret: SecretConfig = {
      name: '',
      value: '',
      type: 'custom',
      description: ''
    };
    updateConfig({
      secrets: [...config.secrets, newSecret]
    });
  };

  const updateSecret = (index: number, updates: Partial<SecretConfig>) => {
    const newSecrets = [...config.secrets];
    newSecrets[index] = { ...newSecrets[index], ...updates };
    updateConfig({ secrets: newSecrets });
  };

  const removeSecret = (index: number) => {
    updateConfig({
      secrets: config.secrets.filter((_, i) => i !== index)
    });
  };

  const addSubnet = (type: 'private' | 'public') => {
    const currentSubnets = type === 'private' ? config.networkConfig.privateSubnets : config.networkConfig.publicSubnets;
    const baseIp = type === 'private' ? '10.0.' : '10.0.10';
    const newSubnet = `${baseIp}${currentSubnets.length + 1}.0/24`;
    
    updateNetworkConfig({
      [type === 'private' ? 'privateSubnets' : 'publicSubnets']: [...currentSubnets, newSubnet]
    });
  };

  const addTag = () => {
    const tagKey = `CustomTag${Object.keys(config.tags).length + 1}`;
    updateConfig({
      tags: { ...config.tags, [tagKey]: '' }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Terragrunt Configuration Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="secrets">Secrets</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={config.projectName}
                    onChange={(e) => updateConfig({ projectName: e.target.value })}
                    placeholder="keycloak-project"
                  />
                </div>
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={config.environment} onValueChange={(value) => updateConfig({ environment: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="prod">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">AWS Region</Label>
                  <Select value={config.region} onValueChange={(value) => updateConfig({ region: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu-central-1">EU Central 1</SelectItem>
                      <SelectItem value="eu-west-1">EU West 1</SelectItem>
                      <SelectItem value="us-east-1">US East 1</SelectItem>
                      <SelectItem value="us-west-2">US West 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Network className="w-4 h-4" />
                    VPC Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vpcCidr">VPC CIDR Block</Label>
                    <Input
                      id="vpcCidr"
                      value={config.networkConfig.vpcCidr}
                      onChange={(e) => updateNetworkConfig({ vpcCidr: e.target.value })}
                      placeholder="10.0.0.0/16"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center justify-between">
                        Private Subnets
                        <Button size="sm" variant="outline" onClick={() => addSubnet('private')}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </Label>
                      {config.networkConfig.privateSubnets.map((subnet, index) => (
                        <Input
                          key={index}
                          value={subnet}
                          onChange={(e) => {
                            const newSubnets = [...config.networkConfig.privateSubnets];
                            newSubnets[index] = e.target.value;
                            updateNetworkConfig({ privateSubnets: newSubnets });
                          }}
                          className="mb-2"
                        />
                      ))}
                    </div>
                    <div>
                      <Label className="flex items-center justify-between">
                        Public Subnets
                        <Button size="sm" variant="outline" onClick={() => addSubnet('public')}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </Label>
                      {config.networkConfig.publicSubnets.map((subnet, index) => (
                        <Input
                          key={index}
                          value={subnet}
                          onChange={(e) => {
                            const newSubnets = [...config.networkConfig.publicSubnets];
                            newSubnets[index] = e.target.value;
                            updateNetworkConfig({ publicSubnets: newSubnets });
                          }}
                          className="mb-2"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="natGateway">Enable NAT Gateway</Label>
                    <Switch
                      id="natGateway"
                      checked={config.networkConfig.enableNatGateway}
                      onCheckedChange={(checked) => updateNetworkConfig({ enableNatGateway: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vpnGateway">Enable VPN Gateway</Label>
                    <Switch
                      id="vpnGateway"
                      checked={config.networkConfig.enableVpnGateway}
                      onCheckedChange={(checked) => updateNetworkConfig({ enableVpnGateway: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secrets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Secret Management
                    </span>
                    <Button size="sm" onClick={addSecret}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Secret
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.secrets.map((secret, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Secret Name</Label>
                          <Input
                            value={secret.name}
                            onChange={(e) => updateSecret(index, { name: e.target.value })}
                            placeholder="secret_name"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={secret.type} 
                            onValueChange={(value: SecretConfig['type']) => updateSecret(index, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="password">Password</SelectItem>
                              <SelectItem value="api_key">API Key</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <Label>Value</Label>
                        <div className="flex gap-2">
                          <Input
                            type={showSecrets[`secret-${index}`] ? 'text' : 'password'}
                            value={secret.value}
                            onChange={(e) => updateSecret(index, { value: e.target.value })}
                            placeholder="Secret value"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSecrets(prev => ({ 
                              ...prev, 
                              [`secret-${index}`]: !prev[`secret-${index}`] 
                            }))}
                          >
                            {showSecrets[`secret-${index}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeSecret(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={secret.description}
                          onChange={(e) => updateSecret(index, { description: e.target.value })}
                          placeholder="Secret description"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monitoring">Enable Monitoring</Label>
                  <Switch
                    id="monitoring"
                    checked={config.enableMonitoring}
                    onCheckedChange={(checked) => updateConfig({ enableMonitoring: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup">Enable Backups</Label>
                  <Switch
                    id="backup"
                    checked={config.enableBackup}
                    onCheckedChange={(checked) => updateConfig({ enableBackup: checked })}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    Resource Tags
                    <Button size="sm" onClick={addTag}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Tag
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(config.tags).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newTags = { ...config.tags };
                            delete newTags[key];
                            newTags[e.target.value] = value;
                            updateConfig({ tags: newTags });
                          }}
                          placeholder="Tag key"
                        />
                        <Input
                          value={value}
                          onChange={(e) => updateConfig({ 
                            tags: { ...config.tags, [key]: e.target.value } 
                          })}
                          placeholder="Tag value"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const newTags = { ...config.tags };
                            delete newTags[key];
                            updateConfig({ tags: newTags });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => console.log('Config:', config)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Config
            </Button>
            <Button onClick={onGenerateCode}>
              <Code className="w-4 h-4 mr-2" />
              Generate Terragrunt Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
