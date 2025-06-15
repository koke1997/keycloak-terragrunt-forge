
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import { EnhancedProjectBuilder } from "@/components/EnhancedProjectBuilder";

type Props = {
  handleEnhancedProjectGenerate: (config: any) => void;
};

export function AIXPProjectsTabContent({ handleEnhancedProjectGenerate }: Props) {
  return (
    <>
      <Card className="mb-2 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-100 via-indigo-100 to-white shadow animate-fade-in">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 animate-bounce" />
            AI XP Projects
          </CardTitle>
          <CardDescription className="text-purple-800">
            Collaborate with AI agents—every workflow uses OSS tools so your infra & code are always yours to own and build on.
          </CardDescription>
        </CardHeader>
      </Card>
      <EnhancedProjectBuilder onProjectGenerate={handleEnhancedProjectGenerate} />
    </>
  );
}
