
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info, Rocket, LayoutDashboard, LayoutList } from "lucide-react";

export function ProjectDashboardIntro() {
  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
          <Info className="w-6 h-6 text-blue-700" />
          How This Tool Works
          <Badge className="ml-2 bg-gradient-to-tr from-green-300 to-blue-300 text-blue-900">Open Source</Badge>
        </CardTitle>
        <CardDescription className="text-blue-800 text-base mt-2">
          Build production-grade infrastructure and code with AI, in 3 easy steps:
          <ol className="list-decimal pl-7 mt-3 space-y-1 text-blue-900 text-sm">
            <li>
              <span className="font-bold text-violet-700">Choose</span> an <span className="font-semibold">AI XP Project</span> or a <span className="font-semibold text-slate-700">Standard Template</span>.<br />
              <span className="text-xs text-slate-600 italic">AI XP Projects give you guided, collaborative workflows.</span>
            </li>
            <li>
              <span className="font-bold text-violet-700">Customize</span> your stack, settings, and agents.
            </li>
            <li>
              <span className="font-bold text-green-700">Generate</span> and <span className="font-bold">deploy</span> modular, open source code.
            </li>
          </ol>
        </CardDescription>
        <CardContent className="pt-2">
          <div className="flex gap-2 items-center flex-wrap mb-2 animate-fade-in">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 text-white shadow hover-scale">
                    <Rocket className="w-4 h-4 mr-1" /> Deploy Now
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deploy to your preferred cloud instantly.</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" className="hover-scale">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Open Dev Tools
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Access Docker, Git, Packages, DB, and more tools.</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="hover-scale">
                    <LayoutList className="w-4 h-4 mr-1" /> View All Projects
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Browse and manage your projects/templates.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
