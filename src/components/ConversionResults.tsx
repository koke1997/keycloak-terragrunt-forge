
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, File, Download } from "lucide-react";

interface ConversionResult {
  fileName: string;
  terragrunt: string;
  error?: string;
}

interface ConversionResultsProps {
  results: ConversionResult[];
  onCopy?: (fileName: string, terragrunt: string) => void;
}

function getTfFileName(fileName: string): string {
  // Use file name (no extension) + .tf
  let base = fileName.replace(/\.[^.]+$/, '') || "realm";
  return `${base}.tf`;
}

function downloadTerragrunt(fileName: string, terragrunt: string) {
  const blob = new Blob([terragrunt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = getTfFileName(fileName);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
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
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy?.(r.fileName, r.terragrunt)}
                disabled={!!r.error}
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadTerragrunt(r.fileName, r.terragrunt)}
                disabled={!!r.error}
                aria-label="Download tf file"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

