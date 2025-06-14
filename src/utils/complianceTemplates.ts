
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
    industry: ['all'],
    dataTypes: ['personal', 'sensitive', 'biometric'],
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
    id: 'bdsg',
    name: 'BDSG',
    description: 'Bundesdatenschutzgesetz - German Federal Data Protection Act',
    industry: ['all'],
    dataTypes: ['personal', 'employee'],
    requirements: [
      'Verarbeitungsverzeichnis',
      'Datenschutzbeauftragte/r',
      'Technische und organisatorische Maßnahmen'
    ],
    severity: 'high'
  },
  {
    id: 'kritis',
    name: 'KRITIS',
    description: 'Kritische Infrastrukturen - Critical Infrastructure Protection',
    industry: ['energy', 'water', 'food', 'health', 'transport', 'finance'],
    dataTypes: ['operational', 'critical_systems'],
    requirements: [
      'IT-Sicherheitskatalog',
      'Meldepflicht bei Störungen',
      'Zwei-Jahres-Nachweis',
      'Angemessene IT-Sicherheit'
    ],
    severity: 'critical'
  },
  {
    id: 'bsi_grundschutz',
    name: 'BSI IT-Grundschutz',
    description: 'BSI IT Security Basic Protection',
    industry: ['government', 'public', 'finance', 'health'],
    dataTypes: ['confidential', 'internal'],
    requirements: [
      'Informationssicherheitsmanagement',
      'Risikoanalyse',
      'Sicherheitskonzept',
      'Notfallvorsorge'
    ],
    severity: 'high'
  },
  {
    id: 'gobd',
    name: 'GoBD',
    description: 'Grundsätze zur ordnungsmäßigen Führung von Büchern - Accounting Compliance',
    industry: ['finance', 'accounting', 'all'],
    dataTypes: ['financial', 'tax_relevant'],
    requirements: [
      'Unveränderbarkeit von Buchungen',
      'Vollständigkeit der Aufzeichnungen',
      'Zeitgerechte Buchungen',
      'Ordnung und Nachvollziehbarkeit'
    ],
    severity: 'medium'
  },
  {
    id: 'hipaa_de',
    name: 'Medizinprodukte-Verordnung (MDR)',
    description: 'Medical Device Regulation for Healthcare Data',
    industry: ['health', 'medical'],
    dataTypes: ['health', 'medical_records', 'patient'],
    requirements: [
      'Patientendaten-Schutz',
      'Medizinische Geräte-Sicherheit',
      'Klinische Bewertung',
      'Post-Market Surveillance'
    ],
    severity: 'critical'
  }
];

export const realmTemplates: RealmTemplate[] = [
  {
    id: 'gdpr_basic',
    name: 'DSGVO Basis-Konfiguration',
    description: 'Grundlegende DSGVO-konforme Keycloak-Konfiguration',
    compliance: ['gdpr', 'bdsg'],
    industries: ['all'],
    template: {
      realm: 'gdpr-compliant-realm',
      displayName: 'DSGVO Konforme Anwendung',
      enabled: true,
      userManagedAccessAllowed: true,
      registrationAllowed: true,
      registrationEmailAsUsername: true,
      rememberMe: false,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      maxFailureWaitSeconds: 900,
      minimumQuickLoginWaitSeconds: 60,
      waitIncrementSeconds: 60,
      quickLoginCheckMilliSeconds: 1000,
      maxDeltaTimeSeconds: 43200,
      failureFactor: 30,
      passwordPolicy: "length(12) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail",
      attributes: {
        'gdpr.data_retention_days': '2555', // 7 years
        'gdpr.consent_required': 'true',
        'gdpr.right_to_be_forgotten': 'true',
        'privacy.data_processing_purpose': 'Authentication and Authorization'
      }
    }
  },
  {
    id: 'kritis_secure',
    name: 'KRITIS Sichere Konfiguration',
    description: 'Hochsichere Konfiguration für kritische Infrastrukturen',
    compliance: ['kritis', 'bsi_grundschutz', 'gdpr'],
    industries: ['energy', 'water', 'transport', 'finance'],
    template: {
      realm: 'kritis-secure-realm',
      displayName: 'KRITIS Sichere Anwendung',
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
      maxFailureWaitSeconds: 1800,
      minimumQuickLoginWaitSeconds: 300,
      waitIncrementSeconds: 120,
      quickLoginCheckMilliSeconds: 500,
      maxDeltaTimeSeconds: 21600,
      failureFactor: 10,
      passwordPolicy: "length(16) and digits(3) and lowerCase(3) and upperCase(3) and specialChars(3) and notUsername and notEmail and passwordHistory(12)",
      otpPolicyType: "totp",
      otpPolicyAlgorithm: "HmacSHA256",
      otpPolicyDigits: 8,
      otpPolicyLookAheadWindow: 1,
      otpPolicyPeriod: 30,
      attributes: {
        'kritis.security_level': 'high',
        'bsi.grundschutz_compliant': 'true',
        'audit.log_all_events': 'true',
        'session.max_lifespan': '28800', // 8 hours
        'gdpr.data_retention_days': '2555'
      }
    }
  },
  {
    id: 'healthcare_mdr',
    name: 'Gesundheitswesen MDR',
    description: 'Medizinprodukte-Verordnung konforme Konfiguration',
    compliance: ['hipaa_de', 'gdpr', 'bdsg'],
    industries: ['health', 'medical'],
    template: {
      realm: 'healthcare-mdr-realm',
      displayName: 'Medizinische Anwendung',
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
      maxFailureWaitSeconds: 1200,
      passwordPolicy: "length(14) and digits(2) and lowerCase(2) and upperCase(2) and specialChars(2) and notUsername and notEmail and passwordHistory(8)",
      attributes: {
        'healthcare.patient_data_protection': 'true',
        'mdr.medical_device_compliant': 'true',
        'audit.healthcare_events': 'true',
        'gdpr.health_data_special_category': 'true',
        'session.healthcare_timeout': '3600' // 1 hour
      }
    }
  },
  {
    id: 'financial_gobd',
    name: 'Finanzwesen GoBD',
    description: 'GoBD-konforme Konfiguration für Finanzdienstleister',
    compliance: ['gobd', 'gdpr', 'bdsg'],
    industries: ['finance', 'accounting'],
    template: {
      realm: 'financial-gobd-realm',
      displayName: 'Finanz-Anwendung',
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
        'gobd.audit_trail': 'true',
        'gobd.data_immutability': 'true',
        'financial.transaction_logging': 'true',
        'gdpr.financial_data_protection': 'true',
        'retention.financial_records': '3653' // 10 years
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
