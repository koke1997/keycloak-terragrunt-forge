
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, File } from "lucide-react";

interface ConversionResult {
  fileName: string;
  terragrunt: string;
  error?: string;
}

interface ConversionResultsProps {
  results: ConversionResult[];
  onCopy?: (fileName: string, terragrunt: string) => void;
}

export function ConversionResults({ results, onCopy }: ConversionResultsProps) {
  if (!results.length) return null;
  return (
    <div className="space-y-5 mt-6">
      <h3 className="text-lg font-semibold">Generated Terragrunt code:</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((r) => (
          <Card key={r.fileName} className="p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <File className="w-5 h-5" />
              <span className="font-medium">{r.fileName}</span>
            </div>
            {r.error ? (
              <div className="text-destructive font-mono text-sm">{r.error}</div>
            ) : (
              <pre className="bg-muted p-2 rounded mb-8 text-xs overflow-x-auto">
                {r.terragrunt}
              </pre>
            )}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onCopy?.(r.fileName, r.terragrunt)}
              disabled={!!r.error}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
