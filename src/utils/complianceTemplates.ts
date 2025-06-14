
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  industry: string[];
  dataTypes: string[];
  requirements: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RealmTemplate {
  id: string;
  name: string;
  description: string;
  compliance: string[];
  industries: string[];
  template: any; // Keycloak realm JSON structure
}

export const germanComplianceRequirements: ComplianceRequirement[] = [
  {
    id: 'gdpr',
    name: 'DSGVO/GDPR',
    description: 'Datenschutz-Grundverordnung - EU General Data Protection Regulation',
    industry: ['finance', 'accounting', 'banking', 'insurance'],
    dataTypes: ['personal', 'financial', 'customer_data'],
    requirements: [
      'Einwilligung für Datenverarbeitung',
      'Recht auf Vergessenwerden',
      'Datenportabilität',
      'Privacy by Design',
      'Datenschutz-Folgenabschätzung'
    ],
    severity: 'critical'
  },
  {
    id: 'gobd',
    name: 'GoBD',
    description: 'Grundsätze zur ordnungsmäßigen Führung von Büchern - Accounting Compliance',
    industry: ['finance', 'accounting', 'banking'],
    dataTypes: ['financial', 'tax_relevant', 'accounting_records'],
    requirements: [
      'Unveränderbarkeit von Buchungen',
      'Vollständigkeit der Aufzeichnungen',
      'Zeitgerechte Buchungen',
      'Ordnung und Nachvollziehbarkeit',
      '10-jährige Aufbewahrungspflicht'
    ],
    severity: 'critical'
  },
  {
    id: 'kwg',
    name: 'KWG',
    description: 'Kreditwesengesetz - German Banking Act',
    industry: ['banking', 'finance'],
    dataTypes: ['banking_data', 'credit_information', 'financial_transactions'],
    requirements: [
      'Bankgeheimnis',
      'Geldwäscheprävention',
      'Kreditrisikomanagement',
      'Meldepflichten an BaFin',
      'Mindestkapitalanforderungen'
    ],
    severity: 'critical'
  },
  {
    id: 'vag',
    name: 'VAG',
    description: 'Versicherungsaufsichtsgesetz - Insurance Supervision Act',
    industry: ['insurance', 'finance'],
    dataTypes: ['insurance_data', 'policy_information', 'claims_data'],
    requirements: [
      'Solvabilität II Compliance',
      'Versicherungsgeheimnis',
      'Risikomanagementsystem',
      'Governance-Anforderungen',
      'Berichterstattung an BaFin'
    ],
    severity: 'critical'
  },
  {
    id: 'mifid',
    name: 'MiFID II',
    description: 'Markets in Financial Instruments Directive - Wertpapierhandelsgesetz',
    industry: ['finance', 'investment', 'banking'],
    dataTypes: ['trading_data', 'investment_records', 'client_information'],
    requirements: [
      'Anlegerschutz',
      'Transparenzanforderungen',
      'Aufzeichnungspflichten',
      'Best Execution',
      'Interessenkonflikte vermeiden'
    ],
    severity: 'high'
  },
  {
    id: 'aml',
    name: 'GwG',
    description: 'Geldwäschegesetz - Anti-Money Laundering Act',
    industry: ['banking', 'finance', 'insurance'],
    dataTypes: ['transaction_data', 'customer_due_diligence', 'suspicious_activities'],
    requirements: [
      'Kundenidentifizierung (KYC)',
      'Verdachtsmeldungen',
      'Risikobewertung',
      'Aufzeichnungspflichten',
      'Mitarbeiterschulungen'
    ],
    severity: 'critical'
  },
  {
    id: 'steuergesetze',
    name: 'Steuergesetze',
    description: 'Deutsche Steuergesetze - German Tax Laws',
    industry: ['accounting', 'finance', 'tax_consulting'],
    dataTypes: ['tax_data', 'financial_statements', 'deductible_expenses'],
    requirements: [
      'Steuerliche Buchführungspflicht',
      'Umsatzsteuermeldungen',
      'Jahresabschluss',
      'Betriebsprüfung Vorbereitung',
      'Digitale Schnittstelle ELSTER'
    ],
    severity: 'high'
  }
];

export const realmTemplates: RealmTemplate[] = [
  {
    id: 'banking_kwg_compliant',
    name: 'Banking KWG Compliance',
    description: 'Vollständig KWG-konforme Konfiguration für Banken und Kreditinstitute',
    compliance: ['kwg', 'gdpr', 'aml', 'mifid'],
    industries: ['banking', 'finance'],
    template: {
      realm: 'banking-kwg-realm',
      displayName: 'Bank Compliance System',
      enabled: true,
      sslRequired: 'all',
      userManagedAccessAllowed: false,
      registrationAllowed: false,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: false,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      maxFailureWaitSeconds: 3600,
      minimumQuickLoginWaitSeconds: 600,
      waitIncrementSeconds: 300,
      quickLoginCheckMilliSeconds: 100,
      maxDeltaTimeSeconds: 14400,
      failureFactor: 5,
      passwordPolicy: "length(16) and digits(3) and lowerCase(3) and upperCase(3) and specialChars(3) and notUsername and notEmail and passwordHistory(24)",
      otpPolicyType: "totp",
      otpPolicyAlgorithm: "HmacSHA512",
      otpPolicyDigits: 8,
      otpPolicyLookAheadWindow: 1,
      otpPolicyPeriod: 30,
      attributes: {
        'kwg.banking_compliance': 'true',
        'kwg.banking_secrecy': 'enforced',
        'aml.kyc_required': 'true',
        'mifid.investor_protection': 'true',
        'audit.financial_transactions': 'full',
        'session.banking_timeout': '1800',
        'gdpr.financial_data_protection': 'maximum',
        'retention.banking_records': '3653'
      }
    }
  },
  {
    id: 'accounting_gobd_compliant',
    name: 'Buchhaltung GoBD Compliance',
    description: 'GoBD-konforme Buchhaltungssoftware-Konfiguration',
    compliance: ['gobd', 'gdpr', 'steuergesetze'],
    industries: ['accounting', 'finance'],
    template: {
      realm: 'accounting-gobd-realm',
      displayName: 'Buchhaltungs-System',
      enabled: true,
      sslRequired: 'all',
      userManagedAccessAllowed: true,
      registrationAllowed: false,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      maxFailureWaitSeconds: 1800,
      passwordPolicy: "length(14) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail and passwordHistory(12)",
      attributes: {
        'gobd.immutable_records': 'true',
        'gobd.complete_documentation': 'true',
        'gobd.timely_booking': 'enforced',
        'gobd.audit_trail': 'complete',
        'steuergesetze.tax_compliance': 'true',
        'steuergesetze.elster_ready': 'true',
        'audit.accounting_events': 'all',
        'retention.accounting_records': '3653',
        'gdpr.accounting_data_protection': 'true'
      }
    }
  },
  {
    id: 'insurance_vag_compliant',
    name: 'Versicherung VAG Compliance',
    description: 'VAG und Solvabilität II konforme Versicherungskonfiguration',
    compliance: ['vag', 'gdpr', 'aml'],
    industries: ['insurance', 'finance'],
    template: {
      realm: 'insurance-vag-realm',
      displayName: 'Versicherungs-System',
      enabled: true,
      sslRequired: 'all',
      userManagedAccessAllowed: false,
      registrationAllowed: false,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      maxFailureWaitSeconds: 2400,
      passwordPolicy: "length(14) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail and passwordHistory(16)",
      attributes: {
        'vag.solvency_ii_compliant': 'true',
        'vag.insurance_secrecy': 'enforced',
        'vag.risk_management': 'integrated',
        'vag.governance_requirements': 'met',
        'aml.insurance_aml': 'true',
        'audit.insurance_operations': 'comprehensive',
        'gdpr.insurance_data_protection': 'enhanced',
        'retention.insurance_records': '3653'
      }
    }
  },
  {
    id: 'tax_consulting_compliant',
    name: 'Steuerberatung Compliance',
    description: 'Speziell für Steuerberatungskanzleien konfigurierte Lösung',
    compliance: ['steuergesetze', 'gobd', 'gdpr'],
    industries: ['tax_consulting', 'accounting'],
    template: {
      realm: 'tax-consulting-realm',
      displayName: 'Steuerberatungs-System',
      enabled: true,
      sslRequired: 'all',
      userManagedAccessAllowed: true,
      registrationAllowed: false,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      passwordPolicy: "length(12) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail",
      attributes: {
        'steuergesetze.tax_advisory_compliant': 'true',
        'steuergesetze.client_confidentiality': 'enforced',
        'gobd.tax_records_compliant': 'true',
        'audit.tax_advisory_operations': 'detailed',
        'gdpr.client_data_protection': 'maximum',
        'retention.tax_documents': '3653',
        'elster.digital_interface': 'enabled'
      }
    }
  },
  {
    id: 'investment_mifid_compliant',
    name: 'Investment MiFID II Compliance',
    description: 'MiFID II konforme Konfiguration für Wertpapierfirmen',
    compliance: ['mifid', 'gdpr', 'aml'],
    industries: ['investment', 'finance'],
    template: {
      realm: 'investment-mifid-realm',
      displayName: 'Investment-System',
      enabled: true,
      sslRequired: 'all',
      userManagedAccessAllowed: false,
      registrationAllowed: false,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      passwordPolicy: "length(14) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail and passwordHistory(20)",
      attributes: {
        'mifid.investor_protection': 'maximum',
        'mifid.transparency_requirements': 'full',
        'mifid.recording_obligations': 'comprehensive',
        'mifid.best_execution': 'enforced',
        'mifid.conflict_of_interest': 'managed',
        'aml.investment_aml': 'true',
        'audit.trading_activities': 'complete',
        'gdpr.investment_data_protection': 'enhanced'
      }
    }
  }
];

export const getTemplatesByCompliance = (complianceIds: string[]): RealmTemplate[] => {
  return realmTemplates.filter(template => 
    complianceIds.some(id => template.compliance.includes(id))
  );
};

export const getTemplatesByIndustry = (industry: string): RealmTemplate[] => {
  return realmTemplates.filter(template => 
    template.industries.includes(industry) || template.industries.includes('all')
  );
};

export const getComplianceByIndustry = (industry: string): ComplianceRequirement[] => {
  return germanComplianceRequirements.filter(req => 
    req.industry.includes(industry) || req.industry.includes('all')
  );
};
