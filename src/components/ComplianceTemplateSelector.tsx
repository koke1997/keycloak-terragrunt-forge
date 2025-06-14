
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Download, Info } from "lucide-react";
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
  { value: 'all', label: 'Alle Branchen' },
  { value: 'finance', label: 'Finanzwesen' },
  { value: 'health', label: 'Gesundheitswesen' },
  { value: 'energy', label: 'Energiewirtschaft' },
  { value: 'government', label: 'Öffentlicher Sektor' },
  { value: 'transport', label: 'Verkehrswesen' },
  { value: 'water', label: 'Wasserversorgung' },
  { value: 'food', label: 'Lebensmittelindustrie' },
  { value: 'accounting', label: 'Buchhaltung' },
  { value: 'medical', label: 'Medizintechnik' }
];

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export function ComplianceTemplateSelector({ onTemplateSelect }: ComplianceTemplateSelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);

  const filteredTemplates = selectedIndustry === 'all' 
    ? realmTemplates 
    : getTemplatesByIndustry(selectedIndustry);

  const relevantCompliance = selectedIndustry === 'all' 
    ? germanComplianceRequirements 
    : getComplianceByIndustry(selectedIndustry);

  const handleComplianceToggle = (complianceId: string) => {
    setSelectedCompliance(prev => 
      prev.includes(complianceId) 
        ? prev.filter(id => id !== complianceId)
        : [...prev, complianceId]
    );
  };

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
          'selected_compliance': selectedCompliance.join(',')
        }
      }
    };
    onTemplateSelect(templateWithMetadata);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="w-6 h-6" />
          Deutsche Compliance-Vorlagen
        </h2>
        <p className="text-muted-foreground">
          Vorkonfigurierte Keycloak-Realm-Vorlagen für deutsche Gesetze und Branchenstandards
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Rechtlicher Hinweis:</strong> Diese Vorlagen bieten eine grundlegende Compliance-Konfiguration. 
          Konsultieren Sie immer einen Rechtsexperten für vollständige rechtliche Beratung.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Branche auswählen:</label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Branche wählen" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="compliance">Compliance-Anforderungen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      className="ml-2"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Verwenden
                    </Button>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Compliance:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.compliance.map(comp => {
                          const requirement = germanComplianceRequirements.find(r => r.id === comp);
                          return (
                            <Badge 
                              key={comp} 
                              variant="outline"
                              className={requirement ? severityColors[requirement.severity] : ''}
                            >
                              {requirement?.name || comp}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Branchen:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.industries.map(industry => (
                          <Badge key={industry} variant="secondary">
                            {industries.find(i => i.value === industry)?.label || industry}
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

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {relevantCompliance.map(requirement => (
              <Card key={requirement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {requirement.name}
                    <Badge className={severityColors[requirement.severity]}>
                      {requirement.severity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{requirement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Anforderungen:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {requirement.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Datentypen:</p>
                      <div className="flex flex-wrap gap-1">
                        {requirement.dataTypes.map(type => (
                          <Badge key={type} variant="outline">{type}</Badge>
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
