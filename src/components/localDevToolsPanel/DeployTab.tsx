
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Zap, CheckCircle, Rocket, LayoutDashboard, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const deployOptions = [
  {
    key: "lovable",
    name: "Lovable Cloud",
    icon: <Rocket className="w-4 h-4 text-pink-500" />,
    gradient: "from-pink-400 via-fuchsia-400 to-purple-500",
    description: "Deploy seamlessly to Lovable's production cloud.",
    status: "Ready",
    statusColor: "bg-green-100 text-green-800",
    badge: <Badge className="bg-pink-100 text-pink-700 border-pink-200">Official</Badge>
  },
  {
    key: "wasmer",
    name: "Wasmer.io",
    icon: <LayoutGrid className="w-4 h-4 text-indigo-500" />,
    gradient: "from-indigo-400 via-blue-400 to-sky-500",
    description: "Deploy to Wasmer.io for blazing fast WASM hosting.",
    status: "Beta",
    statusColor: "bg-yellow-100 text-yellow-800",
    badge: <Badge className="bg-blue-100 text-blue-700 border-blue-200">Beta</Badge>
  },
  {
    key: "staging",
    name: "Staging Server",
    icon: <Server className="w-4 h-4 text-teal-600" />,
    gradient: "from-teal-200 via-cyan-200 to-blue-300",
    description: "Run validations before production.",
    status: "Last: Success",
    statusColor: "bg-green-100 text-green-700",
    badge: <Badge className="bg-slate-100 text-slate-700 border-slate-200">Dev</Badge>
  },
  {
    key: "production",
    name: "Prod Server",
    icon: <Server className="w-4 h-4 text-green-700" />,
    gradient: "from-green-300 via-emerald-300 to-lime-200",
    description: "Launch your app for real users.",
    status: "Last: Success",
    statusColor: "bg-green-100 text-green-700",
    badge: <Badge className="bg-lime-100 text-lime-700 border-lime-200">Live</Badge>
  },
  {
    key: "vercel",
    name: "Vercel",
    icon: <Zap className="w-4 h-4 text-black" />,
    gradient: "from-gray-200 via-zinc-300 to-neutral-300",
    description: "Deploy to Vercel’s edge platform.",
    status: "Ready",
    statusColor: "bg-gray-100 text-gray-800",
    badge: <Badge className="bg-white text-black border-neutral-200">Edge</Badge>
  },
  {
    key: "netlify",
    name: "Netlify",
    icon: <Zap className="w-4 h-4 text-green-500" />,
    gradient: "from-green-200 via-emerald-200 to-teal-200",
    description: "One-click deploy to Netlify.",
    status: "Maintenance",
    statusColor: "bg-yellow-100 text-yellow-900",
    badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Soon</Badge>
  },
];

export function DeployTab() {
  // Handler for deployment (dummy for now)
  function handleDeploy(target: string) {
    // Ideally trigger a toast or side modal here
    alert(`Triggered deploy to ${target}! For demo only.`);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fade-in">
      {/* Deploy targets */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border-none shadow-xl mb-2 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-500" />
            Deploy Anywhere!
          </CardTitle>
          <CardDescription>
            Choose where to deploy — from cloud to the Lovable platform or blazing-fast Wasmer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {deployOptions.map(opt => (
              <TooltipProvider key={opt.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className={`
                        w-full flex flex-col items-start gap-2 py-4 pl-4 pr-2
                        bg-gradient-to-tr ${opt.gradient}
                        text-left font-semibold shadow hover-scale
                        border-2 border-transparent
                        hover:border-${opt.key === 'lovable' ? 'pink-300' : opt.key === 'wasmer' ? 'blue-300' : 'purple-200'}
                        group transition-all duration-200
                        animate-fade-in
                      `}
                      style={{ minHeight: "90px" }}
                      onClick={() => handleDeploy(opt.name)}
                    >
                      <span className="flex items-center gap-3">
                        {opt.icon}
                        <span>{opt.name}</span>
                        {opt.badge}
                      </span>
                      <span className="text-xs text-slate-700 group-hover:underline">
                        {opt.description}
                      </span>
                      <span className={`mt-1 px-2 py-0.5 rounded text-xs font-medium ${opt.statusColor} flex items-center gap-1`}>
                        <CheckCircle className="w-3 h-3 inline-block" />
                        {opt.status}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs z-50">
                    Deploy to <strong>{opt.name}</strong>: {opt.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Build/Deploy Status */}
      <Card className="border-2 border-slate-200 shadow-lg animate-scale-in">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            Build & Deploy Status
          </CardTitle>
          <CardDescription>
            Monitor your pipeline, recent builds and deploys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Build</span>
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Build Time</span>
              <span className="text-sm text-muted-foreground">2m 34s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Deploy</span>
              <span className="text-sm text-muted-foreground">5 min ago</span>
            </div>
            {/* Recent Deploys */}
            <div>
              <span className="font-medium text-slate-700 block mb-1">Recent Deploys:</span>
              <ul className="list-disc pl-6 text-xs text-slate-600 space-y-1">
                <li>
                  <span className="font-bold text-pink-500">Lovable:</span> success – Just now
                </li>
                <li>
                  <span className="font-bold text-indigo-500">Wasmer.io:</span> success – 3 min ago
                </li>
                <li>
                  <span className="font-bold text-green-700">Prod:</span> failed – 6 min ago
                </li>
                <li>
                  <span className="font-bold text-teal-700">Staging:</span> success – 7 min ago
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
