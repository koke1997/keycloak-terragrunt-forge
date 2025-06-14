
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, File, Download, FolderOpen, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TerraformStructureView } from "./TerraformStructureView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedFile, setSelectedFile] = useState<TerraformFile | null>(null);
  const [viewingResult, setViewingResult] = useState<ConversionResult | null>(null);

  if (!results.length) return null;
  
  return (
    <div className="space-y-5 mt-6">
      <h3 className="text-lg font-semibold">Generated Terraform Modules:</h3>
      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.fileName} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium text-lg">{result.fileName} → Terraform Module</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewingResult(result)}
                  disabled={!!result.error}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Structure
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadAllFiles(result)}
                  disabled={!!result.error}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download All ({result.terragruntFiles?.length || 0} files)
                </Button>
              </div>
            </div>
            
            {result.error ? (
              <div className="text-destructive font-mono text-sm bg-red-50 p-4 rounded">
                {result.error}
              </div>
            ) : (
              <>
                {viewingResult?.fileName === result.fileName && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <TerraformStructureView
                      terragruntFiles={result.terragruntFiles}
                      realmName={result.fileName.replace('.json', '')}
                      onViewFile={setSelectedFile}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Generated Files:</h4>
                  {result.terragruntFiles.map((file, idx) => (
                    <Collapsible key={idx}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded hover:bg-muted transition-colors">
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
                              setSelectedFile(file);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
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
                        <pre className="bg-muted p-3 rounded-b text-xs overflow-x-auto border-t max-h-96 overflow-y-auto">
                          {file.content}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* File Viewer Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              {selectedFile?.filePath}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
              {selectedFile?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
