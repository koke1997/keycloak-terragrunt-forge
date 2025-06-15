
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface XPRoleSelectorProps {
  projectConfig: any;
  activeRole: string;
  onRoleSwitch: (roleId: string) => void;
}

export function XPRoleSelector({ projectConfig, activeRole, onRoleSwitch }: XPRoleSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projectConfig.roles.map((role: any) => (
            <Button
              key={role.id}
              variant={activeRole === role.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => onRoleSwitch(role.id)}
            >
              {role.icon}
              <span className="ml-2">{role.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
