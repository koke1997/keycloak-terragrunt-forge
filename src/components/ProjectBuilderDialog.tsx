
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { type XPRole } from "@/components/XPExpandedRoles";

interface ProjectBuilderDialogProps {
  showRoleDialog: boolean;
  selectedRole: XPRole | null;
  onOpenChange: (open: boolean) => void;
}

export function ProjectBuilderDialog({
  showRoleDialog,
  selectedRole,
  onOpenChange
}: ProjectBuilderDialogProps) {
  return (
    <Dialog open={showRoleDialog} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedRole?.icon}
            {selectedRole?.name}
          </DialogTitle>
          <DialogDescription>{selectedRole?.description}</DialogDescription>
        </DialogHeader>
        {selectedRole && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Key Responsibilities:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {selectedRole.responsibilities.map(resp => (
                  <li key={resp}>{resp}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Core Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRole.keySkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tools & Technologies:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRole.toolsUsed.map(tool => (
                  <Badge key={tool} variant="outline">{tool}</Badge>
                ))}
              </div>
            </div>
            {selectedRole.aiTrainingTopics && (
              <div>
                <h4 className="font-medium mb-2">AI Training Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.aiTrainingTopics.map(topic => (
                    <Badge key={topic} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-2">AI Assistant Personality:</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                {selectedRole.aiPrompt}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
