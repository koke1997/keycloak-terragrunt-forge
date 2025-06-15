
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Zap, CheckCircle } from "lucide-react";

export function DeployTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Deployment Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Server className="w-3 h-3 mr-2" />
            Deploy to Staging
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Server className="w-3 h-3 mr-2" />
            Deploy to Production
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Zap className="w-3 h-3 mr-2" />
            Deploy to Vercel
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Zap className="w-3 h-3 mr-2" />
            Deploy to Netlify
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Build Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Build</span>
              <Badge className="bg-green-100 text-green-800">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
