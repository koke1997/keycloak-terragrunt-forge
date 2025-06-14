
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Shield, 
  Database, 
  Server, 
  Coffee, 
  Lock,
  Globe,
  Layers
} from "lucide-react";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'keycloak' | 'spring-boot' | 'microservices' | 'full-stack';
  features: string[];
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  terragruntModules: string[];
}

interface ProjectTypeSelectorProps {
  onProjectSelect: (project: ProjectTemplate) => void;
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'keycloak-basic',
    name: 'Keycloak Identity Server',
    description: 'Complete Keycloak deployment with PostgreSQL database, load balancer, and monitoring',
    icon: <Lock className="w-6 h-6" />,
    type: 'keycloak',
    features: ['Single Sign-On', 'OIDC/SAML', 'User Federation', 'Multi-tenancy', 'Admin Console'],
    complexity: 'Intermediate',
    estimatedTime: '15-30 min',
    terragruntModules: ['vpc', 'rds', 'ecs', 'alb', 'secrets-manager', 'cloudwatch']
  },
  {
    id: 'keycloak-ha',
    name: 'Keycloak High Availability',
    description: 'Multi-AZ Keycloak cluster with Redis cache, auto-scaling, and disaster recovery',
    icon: <Layers className="w-6 h-6" />,
    type: 'keycloak',
    features: ['High Availability', 'Auto Scaling', 'Redis Cache', 'Multi-AZ', 'Disaster Recovery'],
    complexity: 'Advanced',
    estimatedTime: '30-60 min',
    terragruntModules: ['vpc', 'rds-cluster', 'ecs-cluster', 'alb', 'elasticache', 'route53', 'backup']
  },
  {
    id: 'spring-boot-api',
    name: 'Spring Boot REST API',
    description: 'Containerized Spring Boot application with database, monitoring, and CI/CD pipeline',
    icon: <Coffee className="w-6 h-6" />,
    type: 'spring-boot',
    features: ['REST API', 'Database Integration', 'Docker Container', 'Health Checks', 'Metrics'],
    complexity: 'Simple',
    estimatedTime: '10-20 min',
    terragruntModules: ['vpc', 'rds', 'ecs', 'alb', 'ecr', 'cloudwatch']
  },
  {
    id: 'spring-boot-keycloak',
    name: 'Spring Boot + Keycloak Integration',
    description: 'Secured Spring Boot application integrated with Keycloak for authentication',
    icon: <Shield className="w-6 h-6" />,
    type: 'full-stack',
    features: ['OAuth2/OIDC', 'JWT Tokens', 'Role-based Access', 'API Security', 'SSO Integration'],
    complexity: 'Intermediate',
    estimatedTime: '20-40 min',
    terragruntModules: ['vpc', 'rds', 'ecs', 'alb', 'secrets-manager', 'route53', 'cloudwatch']
  },
  {
    id: 'microservices-platform',
    name: 'Microservices Platform',
    description: 'Complete microservices architecture with service mesh, API gateway, and observability',
    icon: <Server className="w-6 h-6" />,
    type: 'microservices',
    features: ['Service Mesh', 'API Gateway', 'Service Discovery', 'Circuit Breaker', 'Distributed Tracing'],
    complexity: 'Advanced',
    estimatedTime: '45-90 min',
    terragruntModules: ['vpc', 'eks', 'alb', 'rds-cluster', 'elasticache', 'secrets-manager', 'cloudwatch', 'x-ray']
  },
  {
    id: 'web-app-stack',
    name: 'Full-Stack Web Application',
    description: 'Complete web application stack with frontend, backend, database, and CDN',
    icon: <Globe className="w-6 h-6" />,
    type: 'full-stack',
    features: ['React Frontend', 'REST API', 'Database', 'CDN', 'SSL/TLS', 'Monitoring'],
    complexity: 'Intermediate',
    estimatedTime: '25-45 min',
    terragruntModules: ['vpc', 'rds', 'ecs', 'alb', 's3', 'cloudfront', 'route53', 'acm']
  }
];

const complexityColors = {
  'Simple': 'bg-green-100 text-green-800 border-green-300',
  'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Advanced': 'bg-red-100 text-red-800 border-red-300'
};

const typeColors = {
  'keycloak': 'bg-blue-100 text-blue-800',
  'spring-boot': 'bg-green-100 text-green-800',
  'microservices': 'bg-purple-100 text-purple-800',
  'full-stack': 'bg-orange-100 text-orange-800'
};

export function ProjectTypeSelector({ onProjectSelect }: ProjectTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredTemplates = selectedType === 'all' 
    ? projectTemplates 
    : projectTemplates.filter(template => template.type === selectedType);

  const projectTypes = [
    { value: 'all', label: 'All Projects', count: projectTemplates.length },
    { value: 'keycloak', label: 'Keycloak', count: projectTemplates.filter(t => t.type === 'keycloak').length },
    { value: 'spring-boot', label: 'Spring Boot', count: projectTemplates.filter(t => t.type === 'spring-boot').length },
    { value: 'microservices', label: 'Microservices', count: projectTemplates.filter(t => t.type === 'microservices').length },
    { value: 'full-stack', label: 'Full Stack', count: projectTemplates.filter(t => t.type === 'full-stack').length }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Code className="w-6 h-6" />
          Project Template Generator
        </h2>
        <p className="text-muted-foreground">
          Choose a project template to generate optimized Terragrunt infrastructure code
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {projectTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            onClick={() => setSelectedType(type.value)}
            className="flex items-center gap-2"
          >
            {type.label}
            <Badge variant="secondary" className="ml-1">
              {type.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {template.icon}
                  <Badge className={typeColors[template.type]}>
                    {template.type.replace('-', ' ')}
                  </Badge>
                </div>
                <Badge className={complexityColors[template.complexity]}>
                  {template.complexity}
                </Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Key Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Terragrunt Modules:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.terragruntModules.map(module => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>⏱️ {template.estimatedTime}</span>
                  <span>📦 {template.terragruntModules.length} modules</span>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={() => onProjectSelect(template)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Generate Infrastructure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
