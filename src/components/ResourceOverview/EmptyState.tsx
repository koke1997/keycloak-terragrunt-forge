
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Resources Detected</h3>
            <p className="text-gray-600 mt-2">
              No Keycloak resources were found in the uploaded files.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Upload Terraform files or Keycloak JSON exports to see resource analysis.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
