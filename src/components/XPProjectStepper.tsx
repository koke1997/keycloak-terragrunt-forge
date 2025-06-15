
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const steps = [
  {
    key: "select-project",
    label: "1. Select Project",
    tip: "Choose the base app you'd like to enhance."
  },
  {
    key: "select-roles",
    label: "2. Choose Roles",
    tip: "Pick which AI agents or roles will be active in the project."
  },
  {
    key: "llm-config",
    label: "3. LLM & Workflow",
    tip: "Configure your local LLM and how your XP team will collaborate."
  },
  {
    key: "features",
    label: "4. Extra Features",
    tip: "Fine-tune project requirements or enable advanced options."
  },
  {
    key: "generate",
    label: "5. Generate!",
    tip: "Review the summary and launch your enhanced XP Project!"
  }
];

interface XPProjectStepperProps {
  currentStep: number;
}

export function XPProjectStepper({ currentStep }: XPProjectStepperProps) {
  return (
    <div className="sticky top-24 z-10 w-full max-w-xs bg-white border rounded-lg shadow-sm p-4 mb-4 animate-fade-in">
      <h4 className="font-semibold text-lg mb-2 flex items-center gap-1">
        <Info className="w-5 h-5 text-purple-500" />
        Project Setup Guidance
      </h4>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`flex items-center gap-2 ${idx === currentStep ? "font-bold text-purple-700" : "text-muted-foreground"}`}
          >
            <Badge className={idx === currentStep ? "bg-purple-600" : "bg-gray-200"}>{idx + 1}</Badge>
            <span>{step.label}</span>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  {step.tip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-muted-foreground">
        Tip: Complete each step for best project results. More help is available on button/tooltips throughout the builder!
      </div>
    </div>
  );
}
