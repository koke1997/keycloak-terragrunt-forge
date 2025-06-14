// Update this page (the content is just a fallback if you fail to update the page)

import { useState } from "react";
import { JsonFileUploader } from "@/components/JsonFileUploader";
import { ConversionResults } from "@/components/ConversionResults";
import { keycloakRealmJsonToTerragrunt, isValidKeycloakJson } from "@/utils/keycloakToTerragrunt";
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
  terragrunt: string;
  error?: string;
};

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleConvertAll = () => {
    setProcessing(true);
    const outputs: ConversionResult[] = files.map(f => {
      if (f.error) return { fileName: f.name, terragrunt: "", error: f.error };
      if (!f.parsed || !isValidKeycloakJson(f.parsed))
        return { fileName: f.name, terragrunt: "", error: "Not a valid Keycloak realm.json" };
      try {
        const terragrunt = keycloakRealmJsonToTerragrunt(f.parsed, f.name);
        return { fileName: f.name, terragrunt };
      } catch (err: any) {
        return { fileName: f.name, terragrunt: "", error: "Conversion failed" };
      }
    });
    setResults(outputs);
    setProcessing(false);
  };

  const handleCopy = async (fileName: string, terragrunt: string) => {
    try {
      await navigator.clipboard.writeText(terragrunt);
      toast({ title: `Copied for ${fileName}`, description: "Terragrunt code copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", description: "Could not copy code.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-background py-12">
      <section className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Keycloak Realm.json → Terragrunt</h1>
          <p className="text-xl text-muted-foreground">
            Upload one or more Keycloak <code>realm.json</code> files and generate Terraform / Terragrunt code.
          </p>
        </div>
        <JsonFileUploader files={files} onFilesChange={setFiles} />

        <div className="flex gap-4">
          <Button
            disabled={files.length === 0 || processing}
            onClick={handleConvertAll}
          >
            Convert All ({files.length})
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
