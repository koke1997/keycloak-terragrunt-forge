
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { analyzeResourcesInFiles } from "@/utils/terraformResourceAnalyzer";
import { ResourceOverviewProps, EnhancedResourceCount } from "./ResourceOverview/types";
import { getResourceTypeConfig } from "./ResourceOverview/constants";
import { getResourceDetails, getFilesForResourceType } from "./ResourceOverview/utils";
import { ResourceHeader } from "./ResourceOverview/ResourceHeader";
import { ResourceCard } from "./ResourceOverview/ResourceCard";
import { EmptyState } from "./ResourceOverview/EmptyState";

export function ResourceOverview({ terragruntFiles, realmName }: ResourceOverviewProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (resourceType: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(resourceType)) {
      newExpanded.delete(resourceType);
    } else {
      newExpanded.add(resourceType);
    }
    setExpandedSections(newExpanded);
  };

  const resourceAnalysis = analyzeResourcesInFiles(terragruntFiles);
  
  const enhancedResources: EnhancedResourceCount[] = resourceAnalysis.map(resource => {
    const files = getFilesForResourceType(resource.type, terragruntFiles);
    const config = getResourceTypeConfig(resource.type);
    const details = getResourceDetails(resource, files);
    
    return {
      ...resource,
      ...config,
      files,
      details
    };
  });

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <ResourceHeader enhancedResources={enhancedResources} realmName={realmName} />

        {enhancedResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enhancedResources.map(resource => (
              <ResourceCard
                key={resource.type}
                resource={resource}
                isExpanded={expandedSections.has(resource.type)}
                onToggle={() => toggleSection(resource.type)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </TooltipProvider>
  );
}
