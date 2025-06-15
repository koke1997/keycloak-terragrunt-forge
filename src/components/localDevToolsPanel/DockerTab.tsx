
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Dock, Play, Square } from "lucide-react";
import { DockerService } from "./localDevToolsTypes";
import { toast } from "@/hooks/use-toast";

function getStatusColor(status: string) {
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
}

type DockerTabProps = {
  dockerServices: DockerService[];
  setDockerServices: React.Dispatch<React.SetStateAction<DockerService[]>>;
};

export function DockerTab({ dockerServices, setDockerServices }: DockerTabProps) {
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

  return (
    <div className="space-y-4">
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
    </div>
  );
}
