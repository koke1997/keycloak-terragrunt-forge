
import { useState } from "react";
import { JsonFileUploader } from "@/components/JsonFileUploader";
import { ConversionResults } from "@/components/ConversionResults";
import { isValidKeycloakJson, TerraformFile } from "@/utils/keycloakToTerragrunt";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type UploadedFile = {
  name: string;
  content: string;
  parsed: any | null;
  error?: string;
};

type ConversionResult = {
  fileName: string;
  terragruntFiles: TerraformFile[];
  error?: string;
};

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleConvertAll = async () => {
    setProcessing(true);
    const outputs: ConversionResult[] = [];
    
    for (const file of files) {
      if (file.error) {
        outputs.push({ fileName: file.name, terragruntFiles: [], error: file.error });
        continue;
      }
      
      if (!file.parsed || !isValidKeycloakJson(file.parsed)) {
        outputs.push({ fileName: file.name, terragruntFiles: [], error: "Not a valid Keycloak realm.json" });
        continue;
      }
      
      try {
        // Call Java backend API
        const response = await fetch('/api/v1/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            realm: file.parsed,
            options: {
              includeUsers: true,
              includeGroups: true,
              includeClients: true,
              includeRoles: true,
              generateTerragrunt: true,
              outputFormat: 'terragrunt',
              validateOutput: true
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.files) {
          const terragruntFiles: TerraformFile[] = result.files.map((f: any) => ({
            filePath: f.filePath,
            content: f.content
          }));
          outputs.push({ fileName: file.name, terragruntFiles });
        } else {
          outputs.push({ fileName: file.name, terragruntFiles: [], error: result.error || 'Backend conversion failed' });
        }
        
      } catch (err: any) {
        console.error('Conversion error:', err);
        outputs.push({ fileName: file.name, terragruntFiles: [], error: `Backend error: ${err.message}` });
      }
    }
    
    setResults(outputs);
    setProcessing(false);
  };

  const handleCopy = async (fileName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: `Copied ${fileName}`, description: "File content copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", description: "Could not copy content.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-background py-12">
      <section className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Keycloak → Terraform Modules</h1>
          <p className="text-xl text-muted-foreground">
            Convert Keycloak <code>realm.json</code> files into modular Terraform structures with submodules.
          </p>
        </div>
        <JsonFileUploader files={files} onFilesChange={setFiles} />

        <div className="flex gap-4">
          <Button
            disabled={files.length === 0 || processing}
            onClick={handleConvertAll}
          >
            Generate Modules ({files.length})
          </Button>
          <Button
            variant="secondary"
            disabled={files.length === 0}
            onClick={() => setResults([])}
          >
            Clear Results
          </Button>
        </div>

        <ConversionResults results={results} onCopy={handleCopy} />
      </section>
    </main>
  );
};

export default Index;
