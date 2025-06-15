
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Play } from "lucide-react";
import { PackageScript } from "./localDevToolsTypes";
import { toast } from "@/hooks/use-toast";

type PackagesTabProps = {
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  setPackageManager: React.Dispatch<React.SetStateAction<'npm' | 'yarn' | 'pnpm' | 'bun'>>;
  packageScripts: PackageScript[];
};

export function PackagesTab({
  packageManager,
  setPackageManager,
  packageScripts
}: PackagesTabProps) {

  const executePackageScript = (script: PackageScript) => {
    console.log(`Executing: ${script.command}`);
    toast({
      title: "Package Script",
      description: `Running: ${script.description}`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Label>Package Manager:</Label>
        <div className="flex gap-2">
          {(['npm', 'yarn', 'pnpm', 'bun'] as const).map(pm => (
            <Button
              key={pm}
              variant={packageManager === pm ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPackageManager(pm)}
            >
              {pm}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packageScripts.map((script, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                {script.name}
              </CardTitle>
              <CardDescription className="text-xs">{script.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {script.command}
                </code>
                <Button
                  size="sm"
                  onClick={() => executePackageScript(script)}
                  className="w-full"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
