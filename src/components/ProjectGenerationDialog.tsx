
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectGenerationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  projectSummary: React.ReactNode;
  advancedOptions: React.ReactNode;
}

export function ProjectGenerationDialog({
  open,
  onConfirm,
  onCancel,
  projectSummary,
  advancedOptions
}: ProjectGenerationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <Badge variant="default">Ready to Generate?</Badge>
            Confirm AI XP Project Setup
          </DialogTitle>
          <DialogDescription>
            Please review your selected options before generating.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">{projectSummary}</div>
        <div>{advancedOptions}</div>
        <div className="flex gap-4 pt-4">
          <Button variant="default" className="w-full" onClick={onConfirm}>
            Generate Project Now
          </Button>
          <Button variant="secondary" className="w-full" onClick={onCancel}>
            Review/Edit Choices
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
