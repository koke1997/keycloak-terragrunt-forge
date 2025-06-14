import { useState } from "react";
import { JsonFileUploader } from "@/components/JsonFileUploader";
import { ConversionResults } from "@/components/ConversionResults";
import { ComplianceTemplateSelector } from "@/components/ComplianceTemplateSelector";
import { keycloakRealmJsonToTerragrunt, isValidKeycloakJson, TerraformFile } from "@/utils/keycloakToTerragrunt";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RealmTemplate } from "@/utils/complianceTemplates";

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

  const handleConvertAll = () => {
    setProcessing(true);
    const outputs: ConversionResult[] = files.map(f => {
      if (f.error) return { fileName: f.name, terragruntFiles: [], error: f.error };
      if (!f.parsed || !isValidKeycloakJson(f.parsed))
        return { fileName: f.name, terragruntFiles: [], error: "Not a valid Keycloak realm.json" };
      try {
        const terragruntFiles = keycloakRealmJsonToTerragrunt(f.parsed, f.name);
        return { fileName: f.name, terragruntFiles };
      } catch (err: any) {
        return { fileName: f.name, terragruntFiles: [], error: "Conversion failed" };
      }
    });
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

  const handleTemplateSelect = (template: RealmTemplate) => {
    const templateFile: UploadedFile = {
      name: `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`,
      content: JSON.stringify(template.template, null, 2),
      parsed: template.template
    };
    
    // Add to files list
    const updatedFiles = [...files, templateFile].reduce<UploadedFile[]>((acc, curr) => {
      if (!acc.some(f => f.name === curr.name)) acc.push(curr);
      return acc;
    }, []);
    
    setFiles(updatedFiles);
    
    toast({ 
      title: "Vorlage hinzugefügt", 
      description: `${template.name} wurde zu Ihren Dateien hinzugefügt.` 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-background py-12">
      <section className="w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Keycloak → Terraform Modules</h1>
          <p className="text-xl text-muted-foreground">
            Convert Keycloak <code>realm.json</code> files into modular Terraform structures with submodules.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Dateien hochladen</TabsTrigger>
            <TabsTrigger value="templates">Compliance-Vorlagen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <ComplianceTemplateSelector onTemplateSelect={handleTemplateSelect} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Index;
