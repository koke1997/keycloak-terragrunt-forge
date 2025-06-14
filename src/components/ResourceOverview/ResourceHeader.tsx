
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
  Database
} from "lucide-react";
import { EnhancedResourceCount } from "./types";

interface ResourceHeaderProps {
  enhancedResources: EnhancedResourceCount[];
  realmName: string;
}

export function ResourceHeader({ enhancedResources, realmName }: ResourceHeaderProps) {
  const totalResources = enhancedResources.reduce((sum, r) => sum + r.count, 0);
  const configuredResources = enhancedResources.filter(r => r.details.status === 'configured').length;
  const partialResources = enhancedResources.filter(r => r.details.status === 'partial').length;

  return (
    <Card className="border-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          Resource Overview Dashboard
          <Badge variant="outline" className="ml-auto">
            {enhancedResources.length} Types
          </Badge>
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Comprehensive analysis of your Keycloak infrastructure resources with actionable insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Resources</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totalResources}</div>
            <div className="text-xs text-gray-500 mt-1">Across all types</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Configured</span>
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{configuredResources}</div>
            <div className="text-xs text-gray-500 mt-1">Fully configured</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Partial</span>
            </div>
            <div className="text-2xl font-bold text-orange-700 mt-1">{partialResources}</div>
            <div className="text-xs text-gray-500 mt-1">Needs attention</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Target Realm</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1 truncate">{realmName}</div>
            <div className="text-xs text-gray-500 mt-1">Primary realm</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Configuration Progress</h4>
            <span className="text-sm text-gray-500">
              {Math.round((configuredResources / enhancedResources.length) * 100)}% Complete
            </span>
          </div>
          <Progress 
            value={(configuredResources / enhancedResources.length) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{configuredResources} configured</span>
            <span>{partialResources} partial</span>
            <span>{enhancedResources.length - configuredResources - partialResources} missing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
