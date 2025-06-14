
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Download, Info, Building2 } from "lucide-react";
import { 
  germanComplianceRequirements, 
  realmTemplates, 
  getTemplatesByIndustry, 
  getComplianceByIndustry,
  type RealmTemplate,
  type ComplianceRequirement 
} from "@/utils/complianceTemplates";

interface ComplianceTemplateSelectorProps {
  onTemplateSelect: (template: RealmTemplate) => void;
}

const industries = [
  { value: 'all', label: 'Alle Finanz-/Rechnungswesen', icon: '🏢' },
  { value: 'banking', label: 'Bankwesen', icon: '🏦' },
  { value: 'accounting', label: 'Buchhaltung', icon: '📊' },
  { value: 'finance', label: 'Finanzdienstleistungen', icon: '💰' },
  { value: 'insurance', label: 'Versicherungen', icon: '🛡️' },
  { value: 'investment', label: 'Wertpapierhandel', icon: '📈' },
  { value: 'tax_consulting', label: 'Steuerberatung', icon: '📋' }
];

const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

export function ComplianceTemplateSelector({ onTemplateSelect }: ComplianceTemplateSelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const filteredTemplates = selectedIndustry === 'all' 
    ? realmTemplates 
    : getTemplatesByIndustry(selectedIndustry);

  const relevantCompliance = selectedIndustry === 'all' 
    ? germanComplianceRequirements 
    : getComplianceByIndustry(selectedIndustry);

  const handleTemplateSelect = (template: RealmTemplate) => {
    const templateWithMetadata = {
      ...template,
      template: {
        ...template.template,
        attributes: {
          ...template.template.attributes,
          'generated_by': 'lovable-compliance-generator',
          'generated_date': new Date().toISOString(),
          'selected_industry': selectedIndustry,
          'compliance_focus': 'accounting_finance'
        }
      }
    };
    onTemplateSelect(templateWithMetadata);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Building2 className="w-6 h-6" />
          Finanz- & Rechnungswesen Compliance
        </h2>
        <p className="text-muted-foreground">
          Spezialisierte Keycloak-Vorlagen für deutsche Finanz- und Rechnungswesengesetze
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Branchenfokus:</strong> Diese Vorlagen sind speziell für Finanzdienstleister, 
          Banken, Versicherungen, Buchhaltung und Steuerberatung entwickelt worden.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Finanzbereich auswählen:</label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Bereich wählen" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry.value} value={industry.value}>
                  <span className="flex items-center gap-2">
                    <span>{industry.icon}</span>
                    {industry.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Compliance-Vorlagen</TabsTrigger>
          <TabsTrigger value="regulations">Gesetzesgrundlagen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {template.name}
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      className="ml-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Verwenden
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Compliance-Gesetze:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.compliance.map(comp => {
                          const requirement = germanComplianceRequirements.find(r => r.id === comp);
                          return (
                            <Badge 
                              key={comp} 
                              variant="outline"
                              className={`${requirement ? severityColors[requirement.severity] : 'bg-gray-100'} text-xs`}
                            >
                              {requirement?.name || comp}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Anwendungsbereich:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.industries.map(industry => (
                          <Badge key={industry} variant="secondary" className="text-xs">
                            {industries.find(i => i.value === industry)?.label || industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">
                        <strong>Sicherheitsfeatures:</strong> 2FA, erweiterte Passwort-Richtlinien, 
                        Audit-Logging, Sitzungstimeouts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {relevantCompliance.map(requirement => (
              <Card key={requirement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {requirement.name}
                    </span>
                    <Badge className={severityColors[requirement.severity]}>
                      {requirement.severity === 'critical' ? 'Kritisch' : 
                       requirement.severity === 'high' ? 'Hoch' : 
                       requirement.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{requirement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Kernanforderungen:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {requirement.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Betroffene Datentypen:</p>
                      <div className="flex flex-wrap gap-2">
                        {requirement.dataTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Anwendbare Branchen:</p>
                      <div className="flex flex-wrap gap-2">
                        {requirement.industry.map(ind => (
                          <Badge key={ind} variant="secondary" className="text-xs">
                            {industries.find(i => i.value === ind)?.label || ind}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
