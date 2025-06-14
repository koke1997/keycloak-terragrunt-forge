
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PieChart,
  Hash,
  Clock,
  FileText,
  MapPin
} from "lucide-react";
import { EnhancedResourceCount } from "./types";

interface ResourceCardProps {
  resource: EnhancedResourceCount;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ResourceCard({ resource, isExpanded, onToggle }: ResourceCardProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={`transition-all duration-300 hover:shadow-lg ${resource.borderColor} border-2 relative overflow-hidden`}>
        {/* Priority indicator */}
        <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
          resource.details.priority === 'high' ? 'bg-red-500' :
          resource.details.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        
        <CollapsibleTrigger className="w-full">
          <CardContent className={`p-6 ${resource.bgColor} transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm ${resource.color} relative`}>
                  {resource.icon}
                  {resource.details.status === 'configured' && (
                    <CheckCircle className="w-3 h-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                  {resource.details.status === 'partial' && (
                    <AlertCircle className="w-3 h-3 text-orange-600 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${resource.color}`}>
                      {resource.count}
                    </span>
                    <div className="flex flex-col">
                      <Badge variant="outline" className={`text-xs ${
                        resource.details.status === 'configured' ? 'text-green-700 border-green-300' :
                        resource.details.status === 'partial' ? 'text-orange-700 border-orange-300' :
                        'text-gray-700 border-gray-300'
                      }`}>
                        {resource.details.status}
                      </Badge>
                      {resource.details.coverage > 0 && (
                        <span className="text-xs text-gray-500 mt-1">
                          {Math.round(resource.details.coverage)}% covered
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 capitalize">
                    {resource.type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {resource.description}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className={`${resource.color} border-current text-xs`}>
                  {resource.details.priority} priority
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {resource.actualResources! > 0 && resource.terraformBlocks! > 0 && 
             resource.actualResources !== resource.terraformBlocks && (
              <div className="mt-3 pt-3 border-t border-white/50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>TF blocks: {resource.terraformBlocks}</span>
                  <TrendingUp className="w-3 h-3" />
                  <span>Resources: {resource.actualResources}</span>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-6 pb-6 pt-0 space-y-4">
            {/* Resource Insights */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Resource Insights
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{resource.actualResources || 0}</div>
                  <div className="text-xs text-gray-500">JSON Resources</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{resource.terraformBlocks || 0}</div>
                  <div className="text-xs text-gray-500">TF Blocks</div>
                </div>
              </div>

              {resource.details.coverage > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Infrastructure Coverage</span>
                    <span>{Math.round(resource.details.coverage)}%</span>
                  </div>
                  <Progress value={resource.details.coverage} className="h-1" />
                </div>
              )}
            </div>

            {/* Examples */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Resource Examples
              </h4>
              <div className="space-y-2">
                {resource.details.examples.map((example, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {example}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Next Steps
              </h4>
              <div className="space-y-2">
                {resource.details.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      recommendation.startsWith('✅') ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <span className={recommendation.startsWith('✅') ? 'text-green-700' : 'text-gray-600'}>
                      {recommendation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Files */}
            {resource.files.length > 0 && (
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Source Files ({resource.files.length})
                </h4>
                <div className="text-xs text-gray-500 space-y-1">
                  {resource.files.slice(0, 3).map((file, index) => (
                    <div key={index} className="font-mono bg-gray-50 px-2 py-1 rounded border">
                      {file.split('/').pop()}
                    </div>
                  ))}
                  {resource.files.length > 3 && (
                    <div className="text-center py-1 text-gray-400">
                      +{resource.files.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
