
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, File, Download, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TerraformFile {
  filePath: string;
  content: string;
}

interface ConversionResult {
  fileName: string;
  terragruntFiles: TerraformFile[];
  error?: string;
}

interface ConversionResultsProps {
  results: ConversionResult[];
  onCopy?: (fileName: string, content: string) => void;
}

function downloadAllFiles(result: ConversionResult) {
  result.terragruntFiles.forEach(file => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filePath.replace(/\//g, '_');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  });
}

function downloadSingleFile(file: TerraformFile) {
  const blob = new Blob([file.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filePath.replace(/\//g, '_');
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
      <h3 className="text-lg font-semibold">Generated Terraform Modules:</h3>
      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.fileName} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">{result.fileName} → Terraform Module</span>
              </div>
              <Button
                variant="outline"
                onClick={() => downloadAllFiles(result)}
                disabled={!!result.error}
              >
                <Download className="w-4 h-4 mr-1" />
                Download All ({result.terragruntFiles?.length || 0} files)
              </Button>
            </div>
            
            {result.error ? (
              <div className="text-destructive font-mono text-sm">{result.error}</div>
            ) : (
              <div className="space-y-3">
                {result.terragruntFiles.map((file, idx) => (
                  <Collapsible key={idx}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-muted/50 rounded hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        <span className="font-mono text-sm">{file.filePath}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy?.(file.filePath, file.content);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSingleFile(file);
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="bg-muted p-3 rounded-b text-xs overflow-x-auto border-t">
                        {file.content}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
