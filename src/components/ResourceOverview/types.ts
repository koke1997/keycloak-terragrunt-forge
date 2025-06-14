
import React from "react";

export interface TerraformFile {
  filePath: string;
  content: string;
  parsed?: any;
}

export interface ResourceOverviewProps {
  terragruntFiles: TerraformFile[];
  realmName: string;
}

export interface ResourceDetails {
  status: 'configured' | 'partial' | 'missing';
  priority: 'high' | 'medium' | 'low';
  coverage: number;
  examples: string[];
  recommendations: string[];
}

export interface EnhancedResourceCount {
  type: string;
  count: number;
  description: string;
  terraformBlocks?: number;
  actualResources?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  files: string[];
  details: ResourceDetails;
}
