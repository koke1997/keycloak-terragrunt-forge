
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";

export function DatabaseTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Database Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Database className="w-3 h-3 mr-2" />
            Run Migrations
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <RefreshCw className="w-3 h-3 mr-2" />
            Seed Database
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="w-3 h-3 mr-2" />
            Backup Database
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Upload className="w-3 h-3 mr-2" />
            Restore Database
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">PostgreSQL</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Redis</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Elasticsearch</span>
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
