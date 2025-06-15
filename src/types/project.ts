
export interface ProjectTemplate {
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

export interface TerragruntConfig {
  projectName: string;
  environment: string;
  region: string;
  networkConfig: any;
  secrets: any[];
  enableMonitoring: boolean;
  enableBackup: boolean;
  tags: Record<string, string>;
}

export type UploadedFile = {
  name: string;
  content: string;
  parsed: any | null;
  error?: string;
};

export type ConversionResult = {
  fileName: string;
  terragruntFiles: any[];
  error?: string;
};
