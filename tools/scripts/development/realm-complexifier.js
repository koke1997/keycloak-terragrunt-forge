#!/usr/bin/env node

/**
 * Keycloak Realm Complexifier
 *
 * This script takes an existing realm.json file and makes it significantly more complex
 * by adding various Keycloak features, users, groups, roles, clients, and configurations.
 *
 * Usage: node realm-complexifier.js <input-realm.json> [output-file.json] [--config config.json]
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration for complexity generation
const DEFAULT_CONFIG = {
    users: {
        count: 50,
        generateCredentials: true,
        generateAttributes: true,
        generateFederatedIdentities: true
    },
    groups: {
        count: 15,
        maxDepth: 4,
        generateAttributes: true,
        generateSubGroups: true
    },
    roles: {
        realmRoles: 25,
        clientRoles: 20,
        generateComposites: true
    },
    clients: {
        count: 12,
        generateScopes: true,
        generateMappers: true,
        generateClientRoles: true
    },
    identityProviders: {
        count: 5,
        types: ['oidc', 'saml', 'github', 'google', 'facebook']
    },
    authenticationFlows: {
        count: 8,
        generateCustomExecutors: true
    },
    features: {
        addBruteForceProtection: true,
        addPasswordPolicy: true,
        addOtpPolicy: true,
        addWebAuthnPolicy: true,
        addClientPolicies: true,
        addEvents: true,
        addInternationalization: true
    }
};

// Creative name generators
const COMPANY_NAMES = [
    'GlobalTech', 'InnovateCorp', 'NextGenSolutions', 'QuantumDynamics', 'CyberCore',
    'DigitalForge', 'TechNova', 'DataStream', 'CloudVision', 'SmartSystems',
    'FutureBridge', 'NetworX', 'TechSphere', 'InfoPlex', 'SystemCore'
];

const DEPARTMENT_NAMES = [
    'Engineering', 'Marketing', 'Sales', 'HumanResources', 'Finance', 'Operations',
    'ProductManagement', 'CustomerSuccess', 'QualityAssurance', 'BusinessIntelligence',
    'Research', 'Legal', 'Procurement', 'Facilities', 'Security'
];

const FIRST_NAMES = [
    'Alexander', 'Sophia', 'Michael', 'Emma', 'William', 'Olivia', 'James', 'Isabella',
    'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Mia', 'Theodore', 'Harper',
    'Sebastian', 'Evelyn', 'Oliver', 'Abigail', 'Ethan', 'Emily', 'Jacob', 'Elizabeth',
    'Mason', 'Sofia', 'Logan', 'Avery', 'Jackson', 'Ella', 'Liam', 'Madison',
    'Noah', 'Scarlett', 'Aiden', 'Victoria', 'Caden', 'Aria', 'Grayson', 'Grace'
];

const LAST_NAMES = [
    'Anderson', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const PROJECT_NAMES = [
    'Phoenix', 'Nebula', 'Quantum', 'Catalyst', 'Horizon', 'Zenith', 'Apex', 'Vector',
    'Matrix', 'Fusion', 'Prism', 'Vertex', 'Nexus', 'Axiom', 'Synapse', 'Photon',
    'Helix', 'Vortex', 'Genesis', 'Odyssey', 'Titan', 'Aurora', 'Eclipse', 'Infinity',
    'Cosmos', 'Pulsar', 'Quasar', 'Stellar', 'Orbital', 'Galactic', 'Lunar', 'Solar'
];

const SECURITY_CLEARANCE_LEVELS = [
    'Public', 'Internal', 'Confidential', 'Restricted', 'Secret', 'Top Secret'
];

const COMPLIANCE_FRAMEWORKS = [
    'SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001', 'SOC2', 'NIST', 'CCPA', 'FERPA', 'GLBA'
];

const BUSINESS_UNITS = [
    'Corporate', 'Research', 'Innovation', 'Strategy', 'Governance', 'Risk', 'Audit',
    'Communications', 'Legal', 'Compliance', 'Partnerships', 'Mergers', 'Acquisitions'
];

const PROJECT_TYPES = [
    'Strategic', 'Operational', 'Innovation', 'Maintenance', 'Research', 'Compliance',
    'Digital Transformation', 'Cost Reduction', 'Revenue Generation', 'Process Improvement'
];

const OFFICE_LOCATIONS = [
    'New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Singapore',
    'Toronto', 'Paris', 'Amsterdam', 'Mumbai', 'São Paulo', 'Mexico City', 'Dublin',
    'Tel Aviv', 'Hong Kong', 'Seoul', 'Stockholm', 'Zurich', 'Milan'
];

const TEAM_SPECIALIZATIONS = [
    'AI/ML', 'Blockchain', 'IoT', 'Cloud Native', 'Microservices', 'API Management',
    'Data Analytics', 'Cybersecurity', 'UX/UI', 'Product Management', 'Growth Hacking',
    'Digital Marketing', 'Sales Engineering', 'Customer Success', 'Business Intelligence'
];

const ORGANIZATIONAL_LEVELS = [
    'C-Level', 'VP', 'Director', 'Senior Manager', 'Manager', 'Team Lead', 'Senior',
    'Mid-Level', 'Junior', 'Associate', 'Intern', 'Contractor', 'Consultant', 'Advisor'
];

const GROUP_TYPES = [
    'Functional', 'Cross-Functional', 'Project', 'Matrix', 'Virtual', 'Temporary',
    'Permanent', 'Security', 'Compliance', 'Advisory', 'Steering', 'Working',
    'Tiger Team', 'Task Force', 'Center of Excellence', 'Community of Practice'
];

const BUDGET_CATEGORIES = [
    'CAPEX', 'OPEX', 'R&D', 'Marketing', 'Sales', 'Operations', 'Infrastructure',
    'Personnel', 'Travel', 'Training', 'Software', 'Hardware', 'Consulting', 'Legal'
];

class RealmComplexifier {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.generatedIds = new Set();
    }

    generateId() {
        let id;
        do {
            id = crypto.randomUUID();
        } while (this.generatedIds.has(id));
        this.generatedIds.add(id);
        return id;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomChoices(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    generateUsername(firstName, lastName, department) {
        const variations = [
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
            `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`,
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${department.toLowerCase()}`,
            `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`
        ];
        return this.randomChoice(variations);
    }

    generateEmail(username, company) {
        const domains = [`${company.toLowerCase()}.com`, `${company.toLowerCase()}.org`, 'example.com'];
        return `${username}@${this.randomChoice(domains)}`;
    }

    generateComplexUsers(count) {
        const users = [];

        for (let i = 0; i < count; i++) {
            const firstName = this.randomChoice(FIRST_NAMES);
            const lastName = this.randomChoice(LAST_NAMES);
            const department = this.randomChoice(DEPARTMENT_NAMES);
            const company = this.randomChoice(COMPANY_NAMES);
            const username = this.generateUsername(firstName, lastName, department);

            const user = {
                id: this.generateId(),
                username: username,
                firstName: firstName,
                lastName: lastName,
                email: this.generateEmail(username, company),
                enabled: Math.random() > 0.1, // 90% enabled
                emailVerified: Math.random() > 0.3, // 70% verified
                createdTimestamp: Date.now() - Math.floor(Math.random() * 31536000000), // Random time in last year
                attributes: {
                    department: [department],
                    company: [company],
                    employeeId: [`EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`],
                    phoneNumber: [`+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`],
                    jobTitle: [this.generateJobTitle(department)],
                    location: [this.randomChoice(['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney'])],
                    startDate: [new Date(Date.now() - Math.floor(Math.random() * 1576800000000)).toISOString().split('T')[0]]
                }
            };

            if (this.config.users.generateCredentials) {
                user.credentials = [{
                    type: 'password',
                    value: this.generateSecurePassword(),
                    temporary: Math.random() > 0.8 // 20% temporary passwords
                }];

                if (Math.random() > 0.7) { // 30% have OTP
                    user.credentials.push({
                        type: 'otp',
                        value: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
                    });
                }
            }

            if (this.config.users.generateFederatedIdentities && Math.random() > 0.6) {
                user.federatedIdentities = [{
                    identityProvider: this.randomChoice(['google', 'github', 'facebook', 'linkedin']),
                    userId: this.generateId(),
                    userName: username
                }];
            }

            users.push(user);
        }

        return users;
    }

    generateJobTitle(department) {
        const titles = {
            Engineering: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Principal Engineer', 'DevOps Engineer'],
            Marketing: ['Marketing Manager', 'Content Creator', 'SEO Specialist', 'Brand Manager', 'Growth Hacker'],
            Sales: ['Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development', 'Customer Success'],
            HumanResources: ['HR Specialist', 'Recruiter', 'HR Business Partner', 'People Operations', 'Talent Acquisition'],
            Finance: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Treasury Specialist', 'Controller'],
            Operations: ['Operations Manager', 'Process Analyst', 'Supply Chain', 'Logistics Coordinator', 'Operations Specialist']
        };

        return this.randomChoice(titles[department] || ['Specialist', 'Manager', 'Coordinator', 'Analyst']);
    }

    generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    generateComplexGroups(count, maxDepth = 8) {
        console.log('🏢 Generating ultra-complex group hierarchies...');
        const groups = [];

        // Generate different types of groups for complete coverage
        const groupTypes = [
            'departmental',
            'cross-functional',
            'project-based',
            'location-based',
            'security-based',
            'compliance-based',
            'virtual-teams',
            'matrix-org',
            'temporary-groups',
            'centers-of-excellence'
        ];

        const groupsPerType = Math.ceil(count / groupTypes.length);

        for (const groupType of groupTypes) {
            const typeGroups = this.generateGroupsByType(groupType, groupsPerType, maxDepth);
            groups.push(...typeGroups);
        }

        // Add some additional specialized groups
        groups.push(...this.generateExecutiveGroups());
        groups.push(...this.generateEmergencyResponseGroups());
        groups.push(...this.generateCustomerFacingGroups());
        groups.push(...this.generateVendorManagementGroups());

        return groups.slice(0, count); // Ensure we don't exceed the requested count
    }

    generateGroupsByType(groupType, count, maxDepth) {
        const groups = [];

        switch (groupType) {
            case 'departmental':
                groups.push(...this.generateDepartmentalGroups(count, maxDepth));
                break;
            case 'cross-functional':
                groups.push(...this.generateCrossFunctionalGroups(count, maxDepth));
                break;
            case 'project-based':
                groups.push(...this.generateProjectBasedGroups(count, maxDepth));
                break;
            case 'location-based':
                groups.push(...this.generateLocationBasedGroups(count, maxDepth));
                break;
            case 'security-based':
                groups.push(...this.generateSecurityBasedGroups(count, maxDepth));
                break;
            case 'compliance-based':
                groups.push(...this.generateComplianceBasedGroups(count, maxDepth));
                break;
            case 'virtual-teams':
                groups.push(...this.generateVirtualTeams(count, maxDepth));
                break;
            case 'matrix-org':
                groups.push(...this.generateMatrixOrganizationGroups(count, maxDepth));
                break;
            case 'temporary-groups':
                groups.push(...this.generateTemporaryGroups(count, maxDepth));
                break;
            case 'centers-of-excellence':
                groups.push(...this.generateCentersOfExcellence(count, maxDepth));
                break;
            default:
                groups.push(...this.generateGenericGroups(count, maxDepth));
        }

        return groups;
    }

    generateDepartmentalGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < Math.min(count, DEPARTMENT_NAMES.length); i++) {
            const department = DEPARTMENT_NAMES[i];
            const company = this.randomChoice(COMPANY_NAMES);

            const group = {
                id: this.generateId(),
                name: `${company.toLowerCase()}-${department.toLowerCase()}`,
                path: `/${company.toLowerCase()}-${department.toLowerCase()}`,
                attributes: {
                    ...this.generateBaseGroupAttributes(department, company),
                    groupType: ['Departmental'],
                    organizationalLevel: ['Department'],
                    headCount: [`${Math.floor(Math.random() * 200) + 20}`],
                    annualBudget: [`${Math.floor(Math.random() * 10000000) + 1000000}`],
                    budgetCategory: [this.randomChoice(BUDGET_CATEGORIES)],
                    kpiMetrics: this.generateKPIMetrics(department),
                    reportingStructure: [`Reports to ${this.randomChoice(ORGANIZATIONAL_LEVELS)}`],
                    functionalArea: [department],
                    businessUnit: [this.randomChoice(BUSINESS_UNITS)],
                    profitCenter: [`PC-${Math.floor(Math.random() * 9000) + 1000}`],
                    riskLevel: [this.randomChoice(['Low', 'Medium', 'High', 'Critical'])],
                    auditFrequency: [this.randomChoice(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'])],
                    complianceRequirements: this.randomChoices(COMPLIANCE_FRAMEWORKS, Math.floor(Math.random() * 4) + 1)
                },
                realmRoles: this.generateDepartmentalRoles(department),
                clientRoles: this.generateDepartmentalClientRoles(department),
                subGroups: this.generateDepartmentalSubGroups(department, company, maxDepth - 1, `/${company.toLowerCase()}-${department.toLowerCase()}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateCrossFunctionalGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const projectName = this.randomChoice(PROJECT_NAMES);
            const projectType = this.randomChoice(PROJECT_TYPES);
            const departments = this.randomChoices(DEPARTMENT_NAMES, Math.floor(Math.random() * 4) + 2);

            const group = {
                id: this.generateId(),
                name: `crossfunc-${projectName.toLowerCase()}-${projectType.toLowerCase().replace(/\s+/g, '-')}`,
                path: `/cross-functional/${projectName.toLowerCase()}-${projectType.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    ...this.generateBaseGroupAttributes(departments[0], this.randomChoice(COMPANY_NAMES)),
                    groupType: ['Cross-Functional'],
                    projectName: [projectName],
                    projectType: [projectType],
                    involvedDepartments: departments,
                    projectPhase: [this.randomChoice(['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closure'])],
                    projectDuration: [`${Math.floor(Math.random() * 24) + 3} months`],
                    projectBudget: [`${Math.floor(Math.random() * 5000000) + 100000}`],
                    projectSponsor: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    projectManager: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    stakeholders: this.generateStakeholderList(),
                    deliverables: this.generateProjectDeliverables(projectType),
                    milestones: this.generateProjectMilestones(),
                    riskAssessment: [this.randomChoice(['Low', 'Medium', 'High', 'Very High'])],
                    successCriteria: this.generateSuccessCriteria(projectType),
                    communicationPlan: ['Weekly standups, Monthly steering committee, Quarterly reviews']
                },
                realmRoles: this.generateCrossFunctionalRoles(departments),
                clientRoles: this.generateProjectClientRoles(),
                subGroups: this.generateCrossFunctionalSubGroups(projectName, departments, maxDepth - 1, `/cross-functional/${projectName.toLowerCase()}-${projectType.toLowerCase().replace(/\s+/g, '-')}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateProjectBasedGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const projectName = this.randomChoice(PROJECT_NAMES);
            const company = this.randomChoice(COMPANY_NAMES);
            const department = this.randomChoice(DEPARTMENT_NAMES);

            const group = {
                id: this.generateId(),
                name: `project-${company.toLowerCase()}-${projectName.toLowerCase()}`,
                path: `/projects/${company.toLowerCase()}/${projectName.toLowerCase()}`,
                attributes: {
                    ...this.generateBaseGroupAttributes(department, company),
                    groupType: ['Project-Based'],
                    projectCode: [`PROJ-${Math.floor(Math.random() * 9000) + 1000}`],
                    projectName: [projectName],
                    projectCategory: [this.randomChoice(['Internal', 'Customer', 'Partner', 'Compliance', 'Innovation'])],
                    projectMethodology: [this.randomChoice(['Agile', 'Waterfall', 'Hybrid', 'Kanban', 'Scrum', 'Lean'])],
                    sprintLength: [`${Math.floor(Math.random() * 3) + 1} weeks`],
                    teamVelocity: [`${Math.floor(Math.random() * 50) + 10} story points`],
                    backlogSize: [`${Math.floor(Math.random() * 200) + 50} items`],
                    burndownRate: [`${Math.floor(Math.random() * 20) + 5}% per sprint`],
                    defectRate: [`${Math.floor(Math.random() * 5) + 1}% per release`],
                    testCoverage: [`${Math.floor(Math.random() * 30) + 70}%`],
                    codeQuality: [this.randomChoice(['Excellent', 'Good', 'Acceptable', 'Needs Improvement'])],
                    technicalDebt: [`${Math.floor(Math.random() * 20) + 5} hours`],
                    deploymentFrequency: [this.randomChoice(['Daily', 'Weekly', 'Bi-weekly', 'Monthly'])],
                    leadTime: [`${Math.floor(Math.random() * 10) + 1} days`],
                    mttr: [`${Math.floor(Math.random() * 4) + 1} hours`],
                    changeFailureRate: [`${Math.floor(Math.random() * 10) + 1}%`]
                },
                realmRoles: this.generateProjectRoles(),
                clientRoles: this.generateProjectClientRoles(),
                subGroups: this.generateProjectSubGroups(projectName, company, maxDepth - 1, `/projects/${company.toLowerCase()}/${projectName.toLowerCase()}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateLocationBasedGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < Math.min(count, OFFICE_LOCATIONS.length); i++) {
            const location = OFFICE_LOCATIONS[i];
            const company = this.randomChoice(COMPANY_NAMES);

            const group = {
                id: this.generateId(),
                name: `location-${company.toLowerCase()}-${location.toLowerCase().replace(/\s+/g, '-')}`,
                path: `/locations/${company.toLowerCase()}/${location.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Operations', company),
                    groupType: ['Location-Based'],
                    officeName: [location],
                    officeType: [this.randomChoice(['Headquarters', 'Regional Office', 'Branch Office', 'Satellite Office', 'Coworking Space'])],
                    officeSize: [`${Math.floor(Math.random() * 50000) + 5000} sq ft`],
                    capacity: [`${Math.floor(Math.random() * 500) + 50} people`],
                    currentOccupancy: [`${Math.floor(Math.random() * 80) + 20}%`],
                    facilityManager: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    timezone: [this.generateTimezone(location)],
                    businessHours: ['9:00 AM - 6:00 PM local time'],
                    emergencyContacts: this.generateEmergencyContacts(),
                    securityLevel: [this.randomChoice(['Basic', 'Enhanced', 'High Security', 'Maximum Security'])],
                    accessControl: [this.randomChoice(['Badge Access', 'Biometric', 'Two-Factor', 'Multi-Factor'])],
                    parkingSpaces: [`${Math.floor(Math.random() * 200) + 20}`],
                    cafeteriaCapacity: [`${Math.floor(Math.random() * 100) + 20} people`],
                    conferenceRooms: [`${Math.floor(Math.random() * 20) + 5}`],
                    internetBandwidth: [`${Math.floor(Math.random() * 1000) + 100} Mbps`],
                    backupPower: [this.randomChoice(['UPS', 'Generator', 'Both', 'None'])],
                    complianceCertifications: this.randomChoices(['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'LEED'], Math.floor(Math.random() * 3) + 1)
                },
                realmRoles: this.generateLocationRoles(),
                clientRoles: this.generateLocationClientRoles(),
                subGroups: this.generateLocationSubGroups(location, company, maxDepth - 1, `/locations/${company.toLowerCase()}/${location.toLowerCase().replace(/\s+/g, '-')}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateSecurityBasedGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const clearanceLevel = this.randomChoice(SECURITY_CLEARANCE_LEVELS);
            const company = this.randomChoice(COMPANY_NAMES);

            const group = {
                id: this.generateId(),
                name: `security-${company.toLowerCase()}-${clearanceLevel.toLowerCase().replace(/\s+/g, '-')}`,
                path: `/security/${company.toLowerCase()}/${clearanceLevel.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Security', company),
                    groupType: ['Security-Based'],
                    securityClearance: [clearanceLevel],
                    securityProtocol: [this.randomChoice(['Standard', 'Enhanced', 'Strict', 'Maximum'])],
                    backgroundCheckRequired: [this.randomChoice(['Basic', 'Enhanced', 'Top Secret', 'Polygraph'])],
                    accessReviewFrequency: [this.randomChoice(['Weekly', 'Monthly', 'Quarterly', 'Annual'])],
                    dataClassification: [this.randomChoice(['Public', 'Internal', 'Confidential', 'Restricted'])],
                    encryptionRequired: [this.randomChoice(['AES-128', 'AES-256', 'RSA-2048', 'RSA-4096'])],
                    vpnRequired: ['true'],
                    mfaRequired: ['true'],
                    deviceCompliance: ['Required'],
                    securityTraining: ['Annual mandatory training'],
                    incidentReporting: ['Immediate reporting required'],
                    auditLogging: ['Full audit trail maintained'],
                    retentionPeriod: [`${Math.floor(Math.random() * 7) + 1} years`],
                    securityContact: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    escalationPath: this.generateEscalationPath(),
                    securityMetrics: this.generateSecurityMetrics()
                },
                realmRoles: this.generateSecurityRoles(clearanceLevel),
                clientRoles: this.generateSecurityClientRoles(clearanceLevel),
                subGroups: this.generateSecuritySubGroups(clearanceLevel, company, maxDepth - 1, `/security/${company.toLowerCase()}/${clearanceLevel.toLowerCase().replace(/\s+/g, '-')}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateComplianceBasedGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < Math.min(count, COMPLIANCE_FRAMEWORKS.length); i++) {
            const framework = COMPLIANCE_FRAMEWORKS[i];
            const company = this.randomChoice(COMPANY_NAMES);

            const group = {
                id: this.generateId(),
                name: `compliance-${company.toLowerCase()}-${framework.toLowerCase()}`,
                path: `/compliance/${company.toLowerCase()}/${framework.toLowerCase()}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Compliance', company),
                    groupType: ['Compliance-Based'],
                    complianceFramework: [framework],
                    regulatoryBody: [this.getRegulatoryBody(framework)],
                    complianceStatus: [this.randomChoice(['Compliant', 'In Progress', 'Remediation Required', 'Under Review'])],
                    lastAuditDate: [new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]],
                    nextAuditDate: [new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]],
                    auditFirm: [this.randomChoice(['Deloitte', 'PwC', 'EY', 'KPMG', 'Grant Thornton', 'BDO'])],
                    complianceOfficer: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    riskRating: [this.randomChoice(['Low', 'Medium', 'High', 'Critical'])],
                    controlsImplemented: [`${Math.floor(Math.random() * 100) + 50}`],
                    controlsEffective: [`${Math.floor(Math.random() * 90) + 80}%`],
                    findingsOpen: [`${Math.floor(Math.random() * 10)}`],
                    findingsClosed: [`${Math.floor(Math.random() * 50) + 10}`],
                    remediationPlan: ['Quarterly review and updates'],
                    trainingRequired: ['Annual compliance training mandatory'],
                    documentationRequired: ['All processes must be documented'],
                    reportingRequirements: [this.generateReportingRequirements(framework)],
                    penaltyRisk: [`$${Math.floor(Math.random() * 1000000) + 10000}`],
                    insuranceCoverage: [`$${Math.floor(Math.random() * 10000000) + 1000000}`]
                },
                realmRoles: this.generateComplianceRoles(framework),
                clientRoles: this.generateComplianceClientRoles(framework),
                subGroups: this.generateComplianceSubGroups(framework, company, maxDepth - 1, `/compliance/${company.toLowerCase()}/${framework.toLowerCase()}`)
            };

            groups.push(group);
        }

        return groups;
    }

    generateSubGroups(parentDepartment, company, depth, parentPath) {
        if (depth <= 0) return [];

        const subGroups = [];
        const subGroupCount = Math.floor(Math.random() * 4) + 1;

        const subDepartments = {
            Engineering: ['Frontend', 'Backend', 'DevOps', 'QA', 'Mobile', 'Data', 'Security', 'Platform'],
            Marketing: ['Digital', 'Content', 'Events', 'PR', 'Analytics', 'Growth', 'Brand', 'SEO'],
            Sales: ['Enterprise', 'SMB', 'Channel', 'Inside', 'Field', 'Partnerships', 'Solutions', 'Support'],
            HumanResources: ['Recruitment', 'Learning', 'Compensation', 'Employee Relations', 'Benefits', 'Onboarding'],
            Finance: ['Accounting', 'Treasury', 'FP&A', 'Tax', 'Audit', 'Procurement', 'Billing', 'Revenue'],
            Operations: ['Facilities', 'IT', 'Logistics', 'Supply Chain', 'Process', 'Quality', 'Vendor Management']
        };

        const availableSubDepts = subDepartments[parentDepartment] || ['Team1', 'Team2', 'Team3', 'Team4'];

        for (let i = 0; i < Math.min(subGroupCount, availableSubDepts.length); i++) {
            const subDept = availableSubDepts[i];
            const groupPath = `${parentPath}/${subDept.toLowerCase()}`;

            const subGroup = {
                id: this.generateId(),
                name: `${company}-${parentDepartment}-${subDept}`.toLowerCase(),
                path: groupPath,
                attributes: {
                    department: [parentDepartment],
                    subDepartment: [subDept],
                    company: [company],
                    level: ['team'],
                    teamSize: [`${Math.floor(Math.random() * 20) + 3}`],
                    teamLead: [`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)}`],
                    budget: [`${Math.floor(Math.random() * 500000) + 50000}`],
                    project: [this.randomChoice(PROJECT_NAMES)],
                    technology: this.generateTechnologyStack(subDept),
                    status: [this.randomChoice(['Active', 'Planning', 'Development', 'Maintenance'])],
                    priority: [this.randomChoice(['High', 'Medium', 'Low', 'Critical'])],
                    establishedDate: [new Date(Date.now() - Math.floor(Math.random() * 788400000000)).toISOString().split('T')[0]]
                },
                realmRoles: this.generateSubGroupRoles(subDept, parentDepartment),
                clientRoles: this.generateSubGroupClientRoles(subDept),
                subGroups: depth > 1 ? this.generateSubGroups(`${parentDepartment}-${subDept}`, company, depth - 1, groupPath) : []
            };

            subGroups.push(subGroup);
        }

        return subGroups;
    }

    generateGroupRoles(department) {
        const roleMap = {
            Engineering: ['developer', 'tech-lead', 'architect', 'senior-engineer', 'staff-engineer'],
            Marketing: ['marketer', 'content-creator', 'analyst', 'campaign-manager', 'brand-manager'],
            Sales: ['sales-rep', 'account-manager', 'sales-director', 'solution-architect', 'channel-partner'],
            HumanResources: ['hr-specialist', 'recruiter', 'hr-manager', 'people-ops', 'talent-acquisition'],
            Finance: ['accountant', 'financial-analyst', 'finance-manager', 'controller', 'treasury-specialist'],
            Operations: ['operations-specialist', 'process-manager', 'facility-manager', 'vendor-manager']
        };

        const departmentRoles = roleMap[department] || ['employee', 'specialist'];
        return this.randomChoices(departmentRoles, Math.floor(Math.random() * 3) + 1);
    }

    generateSubGroupRoles(subDept, parentDepartment) {
        const specificRoles = [`${subDept.toLowerCase()}-specialist`, `${subDept.toLowerCase()}-lead`];
        const parentRoles = this.generateGroupRoles(parentDepartment);
        const baseRoles = ['employee', 'team-member'];

        return this.randomChoices([...specificRoles, ...parentRoles.slice(0, 2), ...baseRoles], Math.floor(Math.random() * 4) + 1);
    }

    generateComplexRoles(realmCount, clientCount) {
        const roles = {
            realm: [],
            client: {}
        };

        // Generate realm roles
        const baseRoles = [
            'super-admin', 'admin', 'manager', 'team-lead', 'senior-developer', 'developer',
            'analyst', 'specialist', 'coordinator', 'employee', 'contractor', 'intern'
        ];

        for (let i = 0; i < realmCount; i++) {
            const department = this.randomChoice(DEPARTMENT_NAMES);
            const level = this.randomChoice(['junior', 'mid', 'senior', 'principal', 'director']);
            const roleName = i < baseRoles.length ? baseRoles[i] : `${department.toLowerCase()}-${level}`;

            const role = {
                id: this.generateId(),
                name: roleName,
                description: `${level.charAt(0).toUpperCase() + level.slice(1)} level role in ${department}`,
                composite: false,
                clientRole: false,
                attributes: {
                    department: [department],
                    level: [level],
                    permissions: this.generatePermissions(level)
                }
            };

            if (this.config.roles.generateComposites && Math.random() > 0.7) {
                role.composite = true;
                role.composites = {
                    realm: this.randomChoices(baseRoles.slice(0, Math.min(i, 5)), Math.floor(Math.random() * 3) + 1)
                };
            }

            roles.realm.push(role);
        }

        return roles;
    }

    generatePermissions(level) {
        const allPermissions = [
            'read', 'write', 'delete', 'admin', 'manage-users', 'view-reports',
            'create-projects', 'approve-requests', 'manage-billing', 'system-config'
        ];

        const levelPermissions = {
            'junior': ['read'],
            'mid': ['read', 'write'],
            'senior': ['read', 'write', 'delete'],
            'principal': ['read', 'write', 'delete', 'manage-users'],
            'director': ['read', 'write', 'delete', 'admin', 'manage-users', 'view-reports']
        };

        return levelPermissions[level] || ['read'];
    }

    generateComplexClients(count) {
        const clients = [];
        const clientTypes = ['web-app', 'mobile-app', 'api-service', 'microservice', 'dashboard'];

        for (let i = 0; i < count; i++) {
            const projectName = this.randomChoice(PROJECT_NAMES);
            const company = this.randomChoice(COMPANY_NAMES);
            const clientType = this.randomChoice(clientTypes);
            const clientId = `${company.toLowerCase()}-${projectName.toLowerCase()}-${clientType}`;

            const client = {
                id: this.generateId(),
                clientId: clientId,
                name: `${company} ${projectName} ${clientType.replace('-', ' ')}`,
                description: `${company}'s ${projectName} ${clientType} application`,
                enabled: true,
                alwaysDisplayInConsole: false,
                clientAuthenticatorType: 'client-secret',
                secret: crypto.randomBytes(32).toString('hex'),
                redirectUris: this.generateRedirectUris(clientType, company, projectName),
                webOrigins: this.generateWebOrigins(company, projectName),
                notBefore: 0,
                bearerOnly: clientType === 'api-service',
                consentRequired: false,
                standardFlowEnabled: clientType !== 'api-service',
                implicitFlowEnabled: clientType === 'web-app',
                directAccessGrantsEnabled: clientType === 'mobile-app',
                serviceAccountsEnabled: clientType === 'api-service' || clientType === 'microservice',
                publicClient: clientType === 'web-app',
                frontchannelLogout: true,
                protocol: 'openid-connect',
                attributes: {
                    'saml.assertion.signature': 'false',
                    'saml.force.post.binding': 'false',
                    'saml.multivalued.roles': 'false',
                    'saml.encrypt': 'false',
                    'saml.server.signature': 'false',
                    'saml.server.signature.keyinfo.ext': 'false',
                    'exclude.session.state.from.auth.response': 'false',
                    'saml_force_name_id_format': 'false',
                    'saml.client.signature': 'false',
                    'tls.client.certificate.bound.access.tokens': 'false',
                    'saml.authnstatement': 'false',
                    'display.on.consent.screen': 'false',
                    'saml.onetimeuse.condition': 'false'
                }
            };

            if (this.config.clients.generateScopes) {
                client.defaultClientScopes = ['web-origins', 'role_list', 'profile', 'roles', 'email'];
                client.optionalClientScopes = ['address', 'phone', 'offline_access', 'microprofile-jwt'];
            }

            if (this.config.clients.generateMappers) {
                client.protocolMappers = this.generateProtocolMappers(clientId);
            }

            clients.push(client);
        }

        return clients;
    }

    generateRedirectUris(clientType, company, project) {
        const domain = `${company.toLowerCase()}.com`;
        const subdomain = `${project.toLowerCase()}`;

        switch (clientType) {
            case 'web-app':
                return [
                    `https://${subdomain}.${domain}/*`,
                    `https://${subdomain}-staging.${domain}/*`,
                    `http://localhost:3000/*`,
                    `http://localhost:8080/*`
                ];
            case 'mobile-app':
                return [
                    `${company.toLowerCase()}${project.toLowerCase()}://oauth/callback`,
                    `https://${subdomain}.${domain}/mobile-callback`
                ];
            case 'api-service':
            case 'microservice':
                return [`https://api.${domain}/*`];
            default:
                return [`https://${subdomain}.${domain}/*`];
        }
    }

    generateWebOrigins(company, project) {
        const domain = `${company.toLowerCase()}.com`;
        const subdomain = `${project.toLowerCase()}`;

        return [
            `https://${subdomain}.${domain}`,
            `https://${subdomain}-staging.${domain}`,
            'http://localhost:3000',
            'http://localhost:8080'
        ];
    }

    generateProtocolMappers(clientId) {
        return [
            {
                id: this.generateId(),
                name: 'username',
                protocol: 'openid-connect',
                protocolMapper: 'oidc-usermodel-property-mapper',
                consentRequired: false,
                config: {
                    'userinfo.token.claim': 'true',
                    'user.attribute': 'username',
                    'id.token.claim': 'true',
                    'access.token.claim': 'true',
                    'claim.name': 'preferred_username',
                    'jsonType.label': 'String'
                }
            },
            {
                id: this.generateId(),
                name: 'email',
                protocol: 'openid-connect',
                protocolMapper: 'oidc-usermodel-property-mapper',
                consentRequired: false,
                config: {
                    'userinfo.token.claim': 'true',
                    'user.attribute': 'email',
                    'id.token.claim': 'true',
                    'access.token.claim': 'true',
                    'claim.name': 'email',
                    'jsonType.label': 'String'
                }
            },
            {
                id: this.generateId(),
                name: 'department',
                protocol: 'openid-connect',
                protocolMapper: 'oidc-usermodel-attribute-mapper',
                consentRequired: false,
                config: {
                    'userinfo.token.claim': 'true',
                    'user.attribute': 'department',
                    'id.token.claim': 'true',
                    'access.token.claim': 'true',
                    'claim.name': 'department',
                    'jsonType.label': 'String',
                    'multivalued': 'true'
                }
            }
        ];
    }

    generateIdentityProviders(count) {
        const providers = [];
        const providerTypes = this.config.identityProviders.types;

        for (let i = 0; i < count; i++) {
            const providerType = this.randomChoice(providerTypes);
            const company = this.randomChoice(COMPANY_NAMES);

            const provider = {
                alias: `${providerType}-${company.toLowerCase()}`,
                displayName: `${company} ${providerType.toUpperCase()}`,
                providerId: providerType,
                enabled: true,
                updateProfileFirstLoginMode: 'on',
                trustEmail: false,
                storeToken: false,
                addReadTokenRoleOnCreate: false,
                authenticateByDefault: false,
                linkOnly: false,
                firstBrokerLoginFlowAlias: 'first broker login',
                config: this.generateIdentityProviderConfig(providerType)
            };

            providers.push(provider);
        }

        return providers;
    }

    generateIdentityProviderConfig(providerType) {
        const baseConfig = {
            'hideOnLoginPage': 'false',
            'syncMode': 'IMPORT'
        };

        switch (providerType) {
            case 'oidc':
                return {
                    ...baseConfig,
                    'clientId': `client-${Math.random().toString(36).substring(7)}`,
                    'clientSecret': crypto.randomBytes(32).toString('hex'),
                    'authorizationUrl': 'https://example.com/auth',
                    'tokenUrl': 'https://example.com/token',
                    'userInfoUrl': 'https://example.com/userinfo',
                    'issuer': 'https://example.com',
                    'defaultScope': 'openid profile email'
                };
            case 'saml':
                return {
                    ...baseConfig,
                    'singleSignOnServiceUrl': 'https://example.com/sso',
                    'singleLogoutServiceUrl': 'https://example.com/slo',
                    'nameIDPolicyFormat': 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
                    'postBindingResponse': 'true',
                    'postBindingAuthnRequest': 'true'
                };
            case 'github':
                return {
                    ...baseConfig,
                    'clientId': `github-${Math.random().toString(36).substring(7)}`,
                    'clientSecret': crypto.randomBytes(20).toString('hex'),
                    'defaultScope': 'user:email'
                };
            case 'google':
                return {
                    ...baseConfig,
                    'clientId': `${Math.random().toString(36).substring(7)}.apps.googleusercontent.com`,
                    'clientSecret': crypto.randomBytes(24).toString('base64'),
                    'defaultScope': 'openid profile email'
                };
            default:
                return baseConfig;
        }
    }

    generateAuthenticationFlows(count) {
        const flows = [];
        const flowNames = [
            'Custom Browser Flow', 'API Authentication', 'Mobile App Flow', 'SSO Flow',
            'Registration Flow', 'Reset Password Flow', 'Direct Grant Flow', 'Client Authentication'
        ];

        for (let i = 0; i < count; i++) {
            const flowName = i < flowNames.length ? flowNames[i] : `Custom Flow ${i + 1}`;

            const flow = {
                id: this.generateId(),
                alias: flowName.toLowerCase().replace(/\s+/g, '-'),
                description: `Custom authentication flow for ${flowName.toLowerCase()}`,
                providerId: 'basic-flow',
                topLevel: true,
                builtIn: false,
                authenticationExecutions: this.generateAuthExecutions()
            };

            flows.push(flow);
        }

        return flows;
    }

    generateAuthExecutions() {
        const executions = [
            {
                authenticator: 'auth-cookie',
                requirement: 'ALTERNATIVE',
                priority: 10,
                autheticatorConfig: this.generateId()
            },
            {
                authenticator: 'auth-spnego',
                requirement: 'DISABLED',
                priority: 20
            },
            {
                authenticator: 'identity-provider-redirector',
                requirement: 'ALTERNATIVE',
                priority: 25
            },
            {
                flowAlias: 'forms',
                requirement: 'ALTERNATIVE',
                priority: 30
            }
        ];

        return executions;
    }

    addAdvancedFeatures(realm) {
        if (this.config.features.addBruteForceProtection) {
            realm.bruteForceProtected = true;
            realm.failureFactor = 5;
            realm.waitIncrementSeconds = 60;
            realm.quickLoginCheckMilliSeconds = 1000;
            realm.minimumQuickLoginWaitSeconds = 60;
            realm.maxFailureWaitSeconds = 900;
            realm.maxDeltaTimeSeconds = 43200;
            realm.permanentLockout = false;
        }

        if (this.config.features.addPasswordPolicy) {
            realm.passwordPolicy = [
                'length(8)',
                'upperCase(1)',
                'lowerCase(1)',
                'digits(1)',
                'specialChars(1)',
                'notUsername',
                'hashIterations(27500)',
                'passwordHistory(3)'
            ].join(' and ');
        }

        if (this.config.features.addOtpPolicy) {
            realm.otpPolicyType = 'totp';
            realm.otpPolicyAlgorithm = 'HmacSHA256';
            realm.otpPolicyInitialCounter = 0;
            realm.otpPolicyDigits = 6;
            realm.otpPolicyLookAheadWindow = 1;
            realm.otpPolicyPeriod = 30;
            realm.otpSupportedApplications = ['FreeOTP', 'Google Authenticator', 'Microsoft Authenticator'];
        }

        if (this.config.features.addWebAuthnPolicy) {
            realm.webAuthnPolicy = {
                rpEntityName: realm.displayName || realm.realm,
                signatureAlgorithms: ['ES256', 'RS256'],
                rpId: 'localhost',
                attestationConveyancePreference: 'not specified',
                authenticatorAttachment: 'not specified',
                requireResidentKey: 'not specified',
                userVerificationRequirement: 'not specified',
                createTimeout: 0,
                avoidSameAuthenticatorRegister: false,
                acceptableAaguids: []
            };
        }

        if (this.config.features.addEvents) {
            realm.eventsEnabled = true;
            realm.eventsExpiration = 1800000;
            realm.eventsListeners = ['jboss-logging'];
            realm.enabledEventTypes = [
                'SEND_VERIFY_EMAIL', 'REMOVE_TOTP', 'REVOKE_GRANT', 'LOGIN_ERROR', 'CLIENT_LOGIN',
                'RESET_PASSWORD_ERROR', 'IMPERSONATE_ERROR', 'CODE_TO_TOKEN_ERROR', 'VALIDATE_ACCESS_TOKEN_ERROR',
                'CLIENT_UPDATE', 'UPDATE_CONSENT_ERROR', 'UPDATE_TOTP', 'LOGIN', 'UPDATE_PROFILE_ERROR',
                'CLIENT_DELETE', 'IDENTITY_PROVIDER_LINK_ACCOUNT', 'DELETE_ACCOUNT_ERROR', 'CLIENT_DELETE_ERROR',
                'LOGOUT', 'DELETE_ACCOUNT', 'CLIENT_LOGIN_ERROR', 'RESTART_AUTHENTICATION', 'UPDATE_PROFILE',
                'VALIDATE_ACCESS_TOKEN', 'CLIENT_INITIATED_ACCOUNT_LINKING', 'TOKEN_EXCHANGE', 'LOGOUT_ERROR',
                'REGISTER', 'CLIENT_REGISTER', 'IDENTITY_PROVIDER_LINK_ACCOUNT_ERROR', 'UPDATE_PASSWORD_ERROR',
                'REVOKE_GRANT_ERROR', 'EXECUTE_ACTIONS', 'REMOVE_FEDERATED_IDENTITY_ERROR', 'IDENTITY_PROVIDER_FIRST_LOGIN',
                'CLIENT_UPDATE_ERROR', 'REGISTER_ERROR', 'REVOKE_GRANT', 'LOGOUT'
            ];

            realm.adminEventsEnabled = true;
            realm.adminEventsDetailsEnabled = true;
        }

        if (this.config.features.addInternationalization) {
            realm.internationalizationEnabled = true;
            realm.supportedLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh-CN'];
            realm.defaultLocale = 'en';
        }

        return realm;
    }

    complexifyRealm(inputRealm) {
        console.log('🚀 Starting realm complexification...');

        const complexRealm = { ...inputRealm };

        // Update basic realm info
        complexRealm.displayName = `${complexRealm.displayName || complexRealm.realm} - Enhanced Enterprise Edition`;
        complexRealm.displayNameHtml = `<div class="kc-logo-text"><span>Enterprise</span></div>`;

        // Generate complex users
        console.log(`📊 Generating ${this.config.users.count} complex users...`);
        complexRealm.users = this.generateComplexUsers(this.config.users.count);

        // Generate complex groups
        console.log(`👥 Generating ${this.config.groups.count} complex groups...`);
        complexRealm.groups = this.generateComplexGroups(this.config.groups.count, this.config.groups.maxDepth);

        // Generate complex roles
        console.log(`🔐 Generating ${this.config.roles.realmRoles} realm roles...`);
        if (!complexRealm.roles) complexRealm.roles = {};
        complexRealm.roles.realm = this.generateComplexRoles(this.config.roles.realmRoles, this.config.roles.clientRoles).realm;

        // Assign users to groups with role mappings
        complexRealm.users = this.assignUsersToGroups(complexRealm.users, complexRealm.groups);

        // Generate complex clients
        console.log(`🔗 Generating ${this.config.clients.count} complex clients...`);
        complexRealm.clients = this.generateComplexClients(this.config.clients.count);

        // Generate identity providers
        console.log(`🆔 Generating ${this.config.identityProviders.count} identity providers...`);
        complexRealm.identityProviders = this.generateIdentityProviders(this.config.identityProviders.count);

        // Generate authentication flows
        console.log(`🔄 Generating ${this.config.authenticationFlows.count} authentication flows...`);
        complexRealm.authenticationFlows = this.generateAuthenticationFlows(this.config.authenticationFlows.count);

        // Add advanced features
        console.log('⚡ Adding advanced security and configuration features...');
        this.addAdvancedFeatures(complexRealm);

        // Add client scopes
        complexRealm.clientScopes = this.generateClientScopes();

        // Add required actions
        complexRealm.requiredActions = this.generateRequiredActions();

        // Add browser security headers
        complexRealm.browserSecurityHeaders = {
            contentSecurityPolicyReportOnly: '',
            xContentTypeOptions: 'nosniff',
            xRobotsTag: 'none',
            xFrameOptions: 'SAMEORIGIN',
            contentSecurityPolicy: "frame-src 'self'; frame-ancestors 'self'; object-src 'none';",
            xXSSProtection: '1; mode=block',
            strictTransportSecurity: 'max-age=31536000; includeSubDomains'
        };

        console.log('✅ Realm complexification completed!');
        console.log(`📈 Statistics:`);
        console.log(`   Users: ${complexRealm.users?.length || 0}`);
        console.log(`   Groups: ${this.countGroups(complexRealm.groups || [])}`);
        console.log(`   Roles: ${complexRealm.roles?.realm?.length || 0}`);
        console.log(`   Clients: ${complexRealm.clients?.length || 0}`);
        console.log(`   Identity Providers: ${complexRealm.identityProviders?.length || 0}`);
        console.log(`   Users with Group Assignments: ${complexRealm.users?.filter(u => u.groups?.length > 0).length || 0}`);

        return complexRealm;
    }

    countGroups(groups) {
        let count = groups.length;
        for (const group of groups) {
            if (group.subGroups) {
                count += this.countGroups(group.subGroups);
            }
        }
        return count;
    }

    generateClientScopes() {
        return [
            {
                id: this.generateId(),
                name: 'department',
                description: 'Department information',
                protocol: 'openid-connect',
                attributes: {
                    'consent.screen.text': '${departmentScopeConsentText}',
                    'display.on.consent.screen': 'true'
                },
                protocolMappers: [{
                    id: this.generateId(),
                    name: 'department',
                    protocol: 'openid-connect',
                    protocolMapper: 'oidc-usermodel-attribute-mapper',
                    consentRequired: false,
                    config: {
                        'userinfo.token.claim': 'true',
                        'user.attribute': 'department',
                        'id.token.claim': 'true',
                        'access.token.claim': 'true',
                        'claim.name': 'department',
                        'jsonType.label': 'String'
                    }
                }]
            },
            {
                id: this.generateId(),
                name: 'employee-info',
                description: 'Employee information',
                protocol: 'openid-connect',
                attributes: {
                    'consent.screen.text': '${employeeInfoScopeConsentText}',
                    'display.on.consent.screen': 'true'
                }
            }
        ];
    }

    generateRequiredActions() {
        return [
            {
                alias: 'CONFIGURE_TOTP',
                name: 'Configure OTP',
                providerId: 'CONFIGURE_TOTP',
                enabled: true,
                defaultAction: false,
                priority: 10,
                config: {}
            },
            {
                alias: 'terms_and_conditions',
                name: 'Terms and Conditions',
                providerId: 'terms_and_conditions',
                enabled: true,
                defaultAction: false,
                priority: 20,
                config: {}
            },
            {
                alias: 'UPDATE_PASSWORD',
                name: 'Update Password',
                providerId: 'UPDATE_PASSWORD',
                enabled: true,
                defaultAction: false,
                priority: 30,
                config: {}
            },
            {
                alias: 'UPDATE_PROFILE',
                name: 'Update Profile',
                providerId: 'UPDATE_PROFILE',
                enabled: true,
                defaultAction: false,
                priority: 40,
                config: {}
            },
            {
                alias: 'VERIFY_EMAIL',
                name: 'Verify Email',
                providerId: 'VERIFY_EMAIL',
                enabled: true,
                defaultAction: false,
                priority: 50,
                config: {}
            }
        ];
    }

    generateTechnologyStack(department) {
        const techStacks = {
            Frontend: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind'],
            Backend: ['Node.js', 'Python', 'Java', 'Go', 'C#', 'Ruby', 'Microservices'],
            DevOps: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Terraform', 'Jenkins', 'GitLab CI'],
            QA: ['Selenium', 'Jest', 'Cypress', 'Postman', 'JMeter', 'TestRail', 'Automation'],
            Mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'Xamarin'],
            Data: ['Python', 'SQL', 'MongoDB', 'PostgreSQL', 'Elasticsearch', 'Kafka', 'Spark'],
            Security: ['OWASP', 'Penetration Testing', 'Vulnerability Assessment', 'SIEM', 'Compliance'],
            Platform: ['AWS', 'Azure', 'GCP', 'Infrastructure', 'Monitoring', 'Logging', 'Observability']
        };

        const defaultTech = ['Git', 'Agile', 'Scrum', 'JIRA', 'Confluence'];
        const deptTech = techStacks[department] || ['General IT', 'Office Suite', 'Business Tools'];

        return this.randomChoices([...deptTech, ...defaultTech], Math.floor(Math.random() * 5) + 2);
    }

    generateGroupClientRoles() {
        const clientRoles = {};
        const clients = ['admin-console', 'account', 'realm-management', 'security-admin-console'];

        for (const client of clients) {
            if (Math.random() > 0.5) {
                clientRoles[client] = this.randomChoices(['view', 'manage', 'create', 'delete'], Math.floor(Math.random() * 3) + 1);
            }
        }

        return clientRoles;
    }

    generateSubGroupClientRoles(subDept) {
        const clientRoles = {};
        const roleMap = {
            Frontend: ['ui-designer', 'frontend-developer'],
            Backend: ['api-developer', 'database-admin'],
            DevOps: ['deployment-manager', 'infrastructure-admin'],
            QA: ['test-manager', 'automation-engineer'],
            Mobile: ['mobile-developer', 'app-publisher'],
            Data: ['data-analyst', 'ml-engineer'],
            Security: ['security-analyst', 'compliance-officer'],
            Platform: ['platform-engineer', 'site-reliability-engineer']
        };

        const roles = roleMap[subDept] || ['team-member'];
        if (Math.random() > 0.6) {
            clientRoles['account'] = roles;
        }

        return clientRoles;
    }

    assignUsersToGroups(users, groups) {
        console.log('👤 Assigning users to groups with role mappings...');

        const groupPaths = this.getAllGroupPaths(groups);

        for (const user of users) {
            const userDepartment = user.attributes.department?.[0];
            const userCompany = user.attributes.company?.[0];

            // Find matching groups based on department and company
            const matchingGroups = groupPaths.filter(group => {
                const groupDept = group.attributes.department?.[0];
                const groupCompany = group.attributes.company?.[0];
                return groupDept === userDepartment || groupCompany === userCompany;
            });

            if (matchingGroups.length > 0) {
                // Assign user to 1-3 matching groups
                const assignedGroups = this.randomChoices(matchingGroups, Math.floor(Math.random() * 3) + 1);

                if (!user.groups) user.groups = [];
                user.groups = assignedGroups.map(group => group.path);

                // Add group-specific attributes to user
                user.attributes.assignedGroups = assignedGroups.map(g => g.name);
                user.attributes.primaryGroup = [assignedGroups[0].name];

                // Add role mappings based on group membership
                if (!user.realmRoles) user.realmRoles = [];
                if (!user.clientRoles) user.clientRoles = {};

                for (const group of assignedGroups) {
                    if (group.realmRoles) {
                        user.realmRoles.push(...group.realmRoles);
                    }
                    if (group.clientRoles) {
                        for (const [client, roles] of Object.entries(group.clientRoles)) {
                            if (!user.clientRoles[client]) user.clientRoles[client] = [];
                            user.clientRoles[client].push(...roles);
                        }
                    }
                }

                // Remove duplicates
                user.realmRoles = [...new Set(user.realmRoles)];
                for (const client in user.clientRoles) {
                    user.clientRoles[client] = [...new Set(user.clientRoles[client])];
                }
            }
        }

        return users;
    }

    getAllGroupPaths(groups, allGroups = []) {
        for (const group of groups) {
            allGroups.push(group);
            if (group.subGroups && group.subGroups.length > 0) {
                this.getAllGroupPaths(group.subGroups, allGroups);
            }
        }
        return allGroups;
    }

    // Advanced Group Generation Helper Methods

    generateBaseGroupAttributes(department, company) {
        return {
            department: [department],
            company: [company],
            createdDate: [new Date().toISOString().split('T')[0]],
            lastModified: [new Date().toISOString()],
            status: [this.randomChoice(['Active', 'Inactive', 'Pending', 'Under Review'])],
            priority: [this.randomChoice(['High', 'Medium', 'Low', 'Critical'])],
            visibility: [this.randomChoice(['Public', 'Private', 'Restricted', 'Confidential'])],
            contactEmail: [`${department.toLowerCase()}@${company.toLowerCase()}.com`],
            phoneNumber: [this.generatePhoneNumber()],
            description: [`${department} group for ${company} organization`],
            tags: this.generateTags(department),
            customField1: [`Custom value for ${department}`],
            customField2: [`${Math.floor(Math.random() * 1000)}`],
            customField3: [this.randomChoice(['Option A', 'Option B', 'Option C'])]
        };
    }

    generateKPIMetrics(department) {
        const metricsByDept = {
            Engineering: ['Code Coverage', 'Bug Density', 'Deployment Frequency', 'Lead Time', 'MTTR'],
            Sales: ['Revenue Growth', 'Conversion Rate', 'Pipeline Value', 'Customer Acquisition Cost'],
            Marketing: ['Lead Generation', 'Brand Awareness', 'Campaign ROI', 'Customer Engagement'],
            HumanResources: ['Employee Satisfaction', 'Retention Rate', 'Time to Hire', 'Training Hours'],
            Finance: ['Revenue Recognition', 'Cash Flow', 'Budget Variance', 'Cost Control']
        };

        return metricsByDept[department] || ['Performance', 'Quality', 'Efficiency', 'Satisfaction'];
    }

    generateStakeholderList() {
        const stakeholders = [];
        for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
            stakeholders.push(`${this.randomChoice(FIRST_NAMES)} ${this.randomChoice(LAST_NAMES)} (${this.randomChoice(ORGANIZATIONAL_LEVELS)})`);
        }
        return stakeholders;
    }

    generateProjectDeliverables(projectType) {
        const deliverablesByType = {
            'Strategic': ['Business Plan', 'Market Analysis', 'ROI Study', 'Implementation Roadmap'],
            'Innovation': ['Prototype', 'Patent Application', 'Research Report', 'Proof of Concept'],
            'Digital Transformation': ['System Architecture', 'Migration Plan', 'Training Materials', 'Go-Live Plan'],
            'Operational': ['Process Documentation', 'SOP Manual', 'Training Program', 'Quality Metrics']
        };

        return deliverablesByType[projectType] || ['Requirements Document', 'Design Specification', 'Test Plan', 'User Manual'];
    }

    generateProjectMilestones() {
        return [
            'Project Kickoff',
            'Requirements Gathering Complete',
            'Design Phase Complete',
            'Development Phase Complete',
            'Testing Phase Complete',
            'User Acceptance Testing',
            'Go-Live',
            'Project Closure'
        ];
    }

    generateSuccessCriteria(projectType) {
        const criteriaByType = {
            'Strategic': ['ROI > 15%', 'Market Share Increase', 'Revenue Growth'],
            'Innovation': ['Patent Filed', 'Prototype Validated', 'Technology Transfer'],
            'Cost Reduction': ['Cost Savings Achieved', 'Process Efficiency Improved', 'Resource Optimization'],
            'Digital Transformation': ['System Performance', 'User Adoption Rate', 'Process Automation']
        };

        return criteriaByType[projectType] || ['On Time', 'On Budget', 'Quality Standards Met'];
    }

    generateTimezone(location) {
        const timezones = {
            'New York': 'EST (UTC-5)',
            'San Francisco': 'PST (UTC-8)',
            'London': 'GMT (UTC+0)',
            'Berlin': 'CET (UTC+1)',
            'Tokyo': 'JST (UTC+9)',
            'Sydney': 'AEST (UTC+10)',
            'Singapore': 'SGT (UTC+8)',
            'Toronto': 'EST (UTC-5)',
            'Paris': 'CET (UTC+1)',
            'Amsterdam': 'CET (UTC+1)'
        };

        return timezones[location] || 'UTC+0';
    }

    generateEmergencyContacts() {
        return [
            `Security: ${this.generatePhoneNumber()}`,
            `Fire Safety: ${this.generatePhoneNumber()}`,
            `Medical: ${this.generatePhoneNumber()}`,
            `IT Support: ${this.generatePhoneNumber()}`
        ];
    }

    generatePhoneNumber() {
        return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    }

    generateEscalationPath() {
        return [
            'Level 1: Team Lead',
            'Level 2: Department Manager',
            'Level 3: Director',
            'Level 4: VP',
            'Level 5: C-Level'
        ];
    }

    generateSecurityMetrics() {
        return [
            `Security Incidents: ${Math.floor(Math.random() * 10)}`,
            `Compliance Score: ${Math.floor(Math.random() * 20) + 80}%`,
            `Vulnerability Scan Results: ${Math.floor(Math.random() * 50)} issues`,
            `Training Completion: ${Math.floor(Math.random() * 10) + 90}%`
        ];
    }

    getRegulatoryBody(framework) {
        const bodies = {
            'SOX': 'SEC - Securities and Exchange Commission',
            'GDPR': 'European Data Protection Board',
            'HIPAA': 'HHS - Department of Health and Human Services',
            'PCI-DSS': 'PCI Security Standards Council',
            'ISO27001': 'International Organization for Standardization',
            'SOC2': 'AICPA - American Institute of CPAs',
            'NIST': 'National Institute of Standards and Technology',
            'CCPA': 'California Privacy Protection Agency'
        };

        return bodies[framework] || 'Regulatory Authority';
    }

    generateReportingRequirements(framework) {
        const requirements = {
            'SOX': 'Quarterly financial reporting to SEC',
            'GDPR': 'Data breach notification within 72 hours',
            'HIPAA': 'Annual risk assessment and breach reporting',
            'PCI-DSS': 'Quarterly vulnerability scans and annual assessment',
            'ISO27001': 'Annual management review and surveillance audits'
        };

        return requirements[framework] || 'Regular compliance reporting required';
    }

    generateTags(department) {
        const tagsByDept = {
            Engineering: ['tech', 'development', 'innovation', 'agile'],
            Marketing: ['brand', 'campaigns', 'digital', 'growth'],
            Sales: ['revenue', 'customers', 'deals', 'pipeline'],
            Finance: ['budget', 'accounting', 'audit', 'reporting'],
            HumanResources: ['people', 'talent', 'culture', 'benefits']
        };

        return tagsByDept[department] || ['general', 'business', 'operations'];
    }

    // Virtual Teams and Matrix Organization Groups
    generateVirtualTeams(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const teamName = `${this.randomChoice(PROJECT_NAMES)}-virtual-team`;
            const specialization = this.randomChoice(TEAM_SPECIALIZATIONS);

            const group = {
                id: this.generateId(),
                name: teamName.toLowerCase(),
                path: `/virtual-teams/${teamName.toLowerCase()}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Virtual', 'Multi-Company'),
                    groupType: ['Virtual Team'],
                    specialization: [specialization],
                    workingModel: [this.randomChoice(['Fully Remote', 'Hybrid', 'Flexible Hours', 'Asynchronous'])],
                    timeZoneSpread: [`${Math.floor(Math.random() * 12) + 1} hours`],
                    collaborationTools: this.generateCollaborationTools(),
                    meetingFrequency: [this.randomChoice(['Daily', 'Weekly', 'Bi-weekly', 'Monthly'])],
                    deliveryModel: [this.randomChoice(['Agile', 'Scrum', 'Kanban', 'Lean'])],
                    performanceMetrics: this.generateVirtualTeamMetrics(),
                    culturalDiversityIndex: [`${Math.floor(Math.random() * 40) + 60}%`],
                    languageRequirements: this.randomChoices(['English', 'Spanish', 'French', 'German', 'Japanese'], Math.floor(Math.random() * 3) + 1),
                    communicationProtocol: ['Slack for daily, Zoom for meetings, Email for formal'],
                    documentationStandard: ['Confluence Wiki', 'Shared Drive', 'Git Repository'],
                    knowledgeSharing: ['Weekly tech talks', 'Monthly retrospectives', 'Quarterly workshops']
                },
                realmRoles: this.generateVirtualTeamRoles(specialization),
                clientRoles: this.generateVirtualTeamClientRoles(),
                subGroups: []
            };

            groups.push(group);
        }

        return groups;
    }

    generateMatrixOrganizationGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const matrixType = this.randomChoice(['Product-Function', 'Geography-Function', 'Customer-Function']);
            const groupName = `matrix-${matrixType.toLowerCase().replace('-', '-')}-${i + 1}`;

            const group = {
                id: this.generateId(),
                name: groupName,
                path: `/matrix-organization/${groupName}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Matrix', 'Enterprise'),
                    groupType: ['Matrix Organization'],
                    matrixType: [matrixType],
                    primaryReporting: [this.randomChoice(DEPARTMENT_NAMES)],
                    secondaryReporting: [this.randomChoice(DEPARTMENT_NAMES)],
                    matrixStrength: [this.randomChoice(['Weak Matrix', 'Balanced Matrix', 'Strong Matrix'])],
                    conflictResolution: ['Escalation to common manager'],
                    communicationMatrix: ['Direct reporting + dotted line reporting'],
                    performanceEvaluation: ['Dual input from both reporting lines'],
                    budgetResponsibility: [this.randomChoice(['Primary', 'Secondary', 'Shared', 'Negotiated'])],
                    resourceAllocation: ['Shared resource pool with priority matrix'],
                    decisionAuthority: [this.randomChoice(['Primary Manager', 'Consensus', 'Senior Manager'])],
                    meetingStructure: ['Separate functional and project meetings'],
                    careerProgression: ['Dual pathway opportunities'],
                    skillDevelopment: ['Cross-functional skill building'],
                    workloadManagement: ['Resource planning with both dimensions']
                },
                realmRoles: this.generateMatrixRoles(),
                clientRoles: this.generateMatrixClientRoles(),
                subGroups: []
            };

            groups.push(group);
        }

        return groups;
    }

    generateTemporaryGroups(count, maxDepth) {
        const groups = [];

        for (let i = 0; i < count; i++) {
            const groupType = this.randomChoice(['Task Force', 'Tiger Team', 'Crisis Response', 'Special Committee']);
            const purpose = this.randomChoice(['Cost Reduction', 'Process Improvement', 'Crisis Management', 'Strategic Planning']);

            const group = {
                id: this.generateId(),
                name: `temp-${groupType.toLowerCase().replace(/\s+/g, '-')}-${purpose.toLowerCase().replace(/\s+/g, '-')}`,
                path: `/temporary/${groupType.toLowerCase().replace(/\s+/g, '-')}/${purpose.toLowerCase().replace(/\s+/g, '-')}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Temporary', 'Cross-Company'),
                    groupType: ['Temporary'],
                    temporaryGroupType: [groupType],
                    purpose: [purpose],
                    duration: [`${Math.floor(Math.random() * 12) + 1} months`],
                    startDate: [new Date().toISOString().split('T')[0]],
                    endDate: [new Date(Date.now() + (Math.floor(Math.random() * 365) + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]],
                    urgency: [this.randomChoice(['Low', 'Medium', 'High', 'Critical'])],
                    scope: [this.randomChoice(['Department', 'Division', 'Company', 'Enterprise'])],
                    mandate: [`Chartered by ${this.randomChoice(ORGANIZATIONAL_LEVELS)}`],
                    authority: [this.randomChoice(['Advisory', 'Decision Making', 'Implementation', 'Oversight'])],
                    reportingFrequency: [this.randomChoice(['Weekly', 'Bi-weekly', 'Monthly'])],
                    successCriteria: this.generateTemporaryGroupSuccessCriteria(purpose),
                    dissolutionCriteria: ['Objectives achieved or mandate expired'],
                    knowledgeTransfer: ['Documentation and handover to permanent teams'],
                    resourceCommitment: [`${Math.floor(Math.random() * 50) + 10}% FTE per member`]
                },
                realmRoles: this.generateTemporaryGroupRoles(groupType),
                clientRoles: this.generateTemporaryGroupClientRoles(),
                subGroups: []
            };

            groups.push(group);
        }

        return groups;
    }

    generateCentersOfExcellence(count, maxDepth) {
        const groups = [];
        const coeAreas = ['Data Analytics', 'Cloud Computing', 'Cybersecurity', 'AI/ML', 'DevOps', 'UX Design', 'Agile Coaching'];

        for (let i = 0; i < Math.min(count, coeAreas.length); i++) {
            const area = coeAreas[i];

            const group = {
                id: this.generateId(),
                name: `coe-${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                path: `/centers-of-excellence/${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                attributes: {
                    ...this.generateBaseGroupAttributes('Excellence', 'Enterprise'),
                    groupType: ['Center of Excellence'],
                    expertiseArea: [area],
                    maturityLevel: [this.randomChoice(['Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'])],
                    serviceOfferings: this.generateCOEServices(area),
                    communitySize: [`${Math.floor(Math.random() * 200) + 50} practitioners`],
                    knowledgeBase: [`${Math.floor(Math.random() * 500) + 100} articles`],
                    bestPractices: [`${Math.floor(Math.random() * 50) + 20} documented`],
                    trainingPrograms: [`${Math.floor(Math.random() * 10) + 5} courses`],
                    certificationPathway: [this.generateCertificationPath(area)],
                    governanceModel: ['Steering committee with cross-functional representation'],
                    fundingModel: [this.randomChoice(['Centrally Funded', 'Cost Recovery', 'Profit Center'])],
                    performanceMetrics: this.generateCOEMetrics(area),
                    communityEvents: ['Monthly meetups, Quarterly conferences, Annual summit'],
                    externalPartnerships: this.generateExternalPartnerships(area),
                    innovationProjects: [`${Math.floor(Math.random() * 20) + 5} active projects`],
                    industryRecognition: this.generateIndustryRecognition()
                },
                realmRoles: this.generateCOERoles(area),
                clientRoles: this.generateCOEClientRoles(),
                subGroups: this.generateCOESubGroups(area, maxDepth - 1, `/centers-of-excellence/${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
            };

            groups.push(group);
        }

        return groups;
    }

    // Executive and Special Groups
    generateExecutiveGroups() {
        return [
            {
                id: this.generateId(),
                name: 'executive-leadership-team',
                path: '/executive/leadership-team',
                attributes: {
                    groupType: ['Executive'],
                    level: ['C-Level'],
                    meetingFrequency: ['Weekly'],
                    decisionAuthority: ['Strategic'],
                    confidentialityLevel: ['Highest'],
                    boardReporting: ['Monthly'],
                    shareholderCommunications: ['Quarterly'],
                    regulatoryOversight: ['Full Compliance'],
                    successionPlanning: ['Active'],
                    executiveCompensation: ['Board Approved'],
                    performanceMetrics: ['Shareholder Value', 'Revenue Growth', 'Market Share'],
                    strategicInitiatives: ['Digital Transformation', 'Market Expansion', 'Cost Optimization']
                },
                realmRoles: ['ceo', 'cfo', 'cto', 'coo', 'chro', 'cmo', 'ciso'],
                clientRoles: { 'executive-dashboard': ['full-access'], 'board-portal': ['executive-view'] },
                subGroups: []
            }
        ];
    }

    generateEmergencyResponseGroups() {
        return [
            {
                id: this.generateId(),
                name: 'crisis-response-team',
                path: '/emergency/crisis-response',
                attributes: {
                    groupType: ['Emergency Response'],
                    activationTrigger: ['Level 3+ Incident'],
                    responseTime: ['15 minutes'],
                    availabilityRequirement: ['24/7'],
                    communicationChannel: ['Emergency Hotline', 'Mass Notification'],
                    escalationMatrix: ['Immediate to C-Level'],
                    mediaRelations: ['Designated spokesperson only'],
                    stakeholderNotification: ['Automated alerts'],
                    businessContinuity: ['Priority 1 systems'],
                    documentationRequired: ['Incident log', 'Timeline', 'Actions taken'],
                    postIncidentReview: ['Mandatory within 48 hours'],
                    trainingRequirement: ['Quarterly drills']
                },
                realmRoles: ['incident-commander', 'crisis-manager', 'communications-lead'],
                clientRoles: { 'emergency-portal': ['crisis-access'] },
                subGroups: []
            }
        ];
    }

    generateCustomerFacingGroups() {
        return [
            {
                id: this.generateId(),
                name: 'customer-advisory-board',
                path: '/customer/advisory-board',
                attributes: {
                    groupType: ['Customer Advisory'],
                    membershipTier: ['Strategic Customers'],
                    meetingFrequency: ['Quarterly'],
                    influence: ['Product Roadmap', 'Strategic Direction'],
                    nda: ['Required'],
                    feedback: ['Product Features', 'Market Trends', 'Competitive Intelligence'],
                    benefits: ['Early Access', 'Direct Influence', 'Networking'],
                    selection: ['Revenue Threshold', 'Strategic Importance', 'Innovation Partnership'],
                    duration: ['2 year terms'],
                    compensation: ['Credits', 'Discounts', 'Exclusive Access']
                },
                realmRoles: ['customer-advocate', 'product-manager', 'executive-sponsor'],
                clientRoles: { 'customer-portal': ['advisory-access'] },
                subGroups: []
            }
        ];
    }

    generateVendorManagementGroups() {
        return [
            {
                id: this.generateId(),
                name: 'vendor-management-office',
                path: '/procurement/vendor-management',
                attributes: {
                    groupType: ['Vendor Management'],
                    scope: ['Strategic Vendors'],
                    contractValue: ['$1M+ annually'],
                    riskAssessment: ['Quarterly'],
                    performanceReview: ['Monthly'],
                    complianceAudit: ['Annual'],
                    relationshipManagement: ['Executive Sponsor'],
                    negotiationAuthority: ['Up to $10M'],
                    approvalWorkflow: ['Multi-tier approval'],
                    disputeResolution: ['Mediation first'],
                    terminationRights: ['For cause with notice'],
                    businessContinuity: ['Backup vendor required']
                },
                realmRoles: ['vendor-manager', 'procurement-lead', 'contract-admin'],
                clientRoles: { 'vendor-portal': ['management-access'] },
                subGroups: []
            }
        ];
    }

    // Helper methods for generating complex attributes
    generateCollaborationTools() {
        return this.randomChoices([
            'Slack', 'Microsoft Teams', 'Zoom', 'Google Meet', 'Miro', 'Figma',
            'Confluence', 'Notion', 'Asana', 'Jira', 'GitHub', 'GitLab'
        ], Math.floor(Math.random() * 6) + 4);
    }

    generateVirtualTeamMetrics() {
        return [
            `Team Cohesion Score: ${Math.floor(Math.random() * 20) + 80}/100`,
            `Communication Effectiveness: ${Math.floor(Math.random() * 15) + 85}%`,
            `Delivery Performance: ${Math.floor(Math.random() * 10) + 90}%`,
            `Member Satisfaction: ${Math.floor(Math.random() * 20) + 80}%`
        ];
    }

    generateTemporaryGroupSuccessCriteria(purpose) {
        const criteriaByPurpose = {
            'Cost Reduction': ['Achieve 15% cost savings', 'Complete within 6 months', 'No service degradation'],
            'Process Improvement': ['Reduce cycle time by 25%', 'Improve quality metrics', 'High user adoption'],
            'Crisis Management': ['Restore operations', 'Prevent recurrence', 'Stakeholder communication'],
            'Strategic Planning': ['Complete strategic plan', 'Board approval', 'Implementation roadmap']
        };

        return criteriaByPurpose[purpose] || ['Achieve objectives', 'Stay within budget', 'Meet timeline'];
    }

    generateCOEServices(area) {
        const servicesByArea = {
            'Data Analytics': ['Consulting', 'Training', 'Platform Support', 'Best Practices'],
            'Cloud Computing': ['Architecture Review', 'Migration Support', 'Cost Optimization', 'Security Assessment'],
            'Cybersecurity': ['Risk Assessment', 'Incident Response', 'Security Training', 'Compliance Audit'],
            'AI/ML': ['Model Development', 'Algorithm Selection', 'Ethics Review', 'Performance Optimization']
        };

        return servicesByArea[area] || ['Consulting', 'Training', 'Support', 'Governance'];
    }

    generateCertificationPath(area) {
        const pathsByArea = {
            'Data Analytics': 'Foundation → Practitioner → Expert → Master',
            'Cloud Computing': 'Associate → Professional → Architect → Fellow',
            'Cybersecurity': 'Analyst → Specialist → Expert → CISO Track',
            'AI/ML': 'Beginner → Intermediate → Advanced → Research'
        };

        return pathsByArea[area] || 'Basic → Intermediate → Advanced → Expert';
    }

    generateCOEMetrics(area) {
        return [
            `Community Growth: ${Math.floor(Math.random() * 50) + 25}% YoY`,
            `Knowledge Utilization: ${Math.floor(Math.random() * 20) + 70}%`,
            `Training Completion: ${Math.floor(Math.random() * 15) + 85}%`,
            `Best Practice Adoption: ${Math.floor(Math.random() * 25) + 65}%`
        ];
    }

    generateExternalPartnerships(area) {
        const partnersByArea = {
            'Data Analytics': ['Tableau', 'Microsoft', 'Google', 'AWS'],
            'Cloud Computing': ['AWS', 'Azure', 'GCP', 'VMware'],
            'Cybersecurity': ['CrowdStrike', 'Palo Alto', 'Microsoft', 'Okta'],
            'AI/ML': ['OpenAI', 'Google', 'NVIDIA', 'Hugging Face']
        };

        return partnersByArea[area] || ['Industry Leaders', 'Technology Vendors', 'Consulting Firms'];
    }

    generateIndustryRecognition() {
        return this.randomChoices([
            'Gartner Recognition', 'Forrester Wave', 'Industry Awards', 'Speaking Engagements',
            'Published Research', 'Patent Applications', 'Industry Standards Contribution'
        ], Math.floor(Math.random() * 4) + 2);
    }

    // Role generation methods for different group types
    generateDepartmentalRoles(department) {
        // ...existing code...
    }

    generateVirtualTeamRoles(specialization) {
        return [`${specialization.toLowerCase().replace(/[^a-z]/g, '-')}-specialist`, 'virtual-team-member', 'remote-contributor'];
    }

    generateMatrixRoles() {
        return ['matrix-member', 'dual-reporter', 'cross-functional-contributor'];
    }

    generateTemporaryGroupRoles(groupType) {
        return [`${groupType.toLowerCase().replace(/\s+/g, '-')}-member`, 'temporary-contributor', 'special-assignment'];
    }

    generateCOERoles(area) {
        return [`${area.toLowerCase().replace(/[^a-z]/g, '-')}-expert`, 'coe-member', 'knowledge-contributor'];
    }

    generateSecurityRoles(clearanceLevel) {
        return [`${clearanceLevel.toLowerCase().replace(/\s+/g, '-')}-cleared`, 'security-cleared', 'authorized-personnel'];
    }

    generateComplianceRoles(framework) {
        return [`${framework.toLowerCase()}-specialist`, 'compliance-officer', 'audit-coordinator'];
    }

    generateProjectRoles() {
        return ['project-member', 'contributor', 'stakeholder'];
    }

    generateLocationRoles() {
        return ['office-staff', 'facility-user', 'location-member'];
    }

    generateCrossFunctionalRoles(departments) {
        const roles = ['cross-functional-member', 'project-contributor'];
        departments.forEach(dept => {
            roles.push(`${dept.toLowerCase()}-representative`);
        });
        return roles;
    }

    // Client role generation methods
    generateDepartmentalClientRoles(department) {
        return {
            'department-portal': [`${department.toLowerCase()}-access`],
            'admin-console': ['department-admin']
        };
    }

    generateVirtualTeamClientRoles() {
        return {
            'collaboration-platform': ['team-access'],
            'project-management': ['contributor']
        };
    }

    generateMatrixClientRoles() {
        return {
            'matrix-dashboard': ['dual-view'],
            'reporting-system': ['matrix-reporter']
        };
    }

    generateTemporaryGroupClientRoles() {
        return {
            'temporary-workspace': ['limited-access'],
            'project-portal': ['temporary-member']
        };
    }

    generateCOEClientRoles() {
        return {
            'knowledge-portal': ['expert-access'],
            'training-platform': ['instructor']
        };
    }

    generateSecurityClientRoles(clearanceLevel) {
        return {
            'security-portal': [`${clearanceLevel.toLowerCase().replace(/\s+/g, '-')}-access`],
            'compliance-system': ['security-user']
        };
    }

    generateComplianceClientRoles(framework) {
        return {
            'compliance-portal': [`${framework.toLowerCase()}-access`],
            'audit-system': ['compliance-user']
        };
    }

    generateProjectClientRoles() {
        return {
            'project-portal': ['member-access'],
            'collaboration-tools': ['project-user']
        };
    }

    generateLocationClientRoles() {
        return {
            'facility-system': ['location-access'],
            'office-portal': ['facility-user']
        };
    }

    // SubGroup generation methods (simplified for brevity - each would have detailed implementations)
    generateDepartmentalSubGroups(department, company, depth, parentPath) {
        // Implementation similar to existing generateSubGroups but with departmental focus
        return depth > 0 ? [] : []; // Simplified for now
    }

    generateCrossFunctionalSubGroups(projectName, departments, depth, parentPath) {
        // Implementation for cross-functional sub-teams
        return depth > 0 ? [] : [];
    }

    generateProjectSubGroups(projectName, company, depth, parentPath) {
        // Implementation for project workstreams and phases
        return depth > 0 ? [] : [];
    }

    generateLocationSubGroups(location, company, depth, parentPath) {
        // Implementation for location-based sub-groups (floors, departments, etc.)
        return depth > 0 ? [] : [];
    }

    generateSecuritySubGroups(clearanceLevel, company, depth, parentPath) {
        // Implementation for security sub-classifications
        return depth > 0 ? [] : [];
    }

    generateComplianceSubGroups(framework, company, depth, parentPath) {
        // Implementation for compliance sub-requirements
        return depth > 0 ? [] : [];
    }

    generateCOESubGroups(area, depth, parentPath) {
        // Implementation for COE working groups and committees
        return depth > 0 ? [] : [];
    }

    generateGenericGroups(count, maxDepth) {
        // Fallback implementation for any unhandled group types
        return [];
    }

    // ...existing code...
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
🚀 Keycloak Realm Complexifier

Usage: node realm-complexifier.js <input-realm.json> [output-file.json] [--config config.json]

Parameters:
  input-realm.json    - Path to existing realm JSON file
  output-file.json    - Output file path (optional, defaults to complex-<input-name>)
  --config config.json - Custom configuration file (optional)

Examples:
  node realm-complexifier.js test-samples/example-realm.json
  node realm-complexifier.js test-samples/example-realm.json complex-realm.json
  node realm-complexifier.js test-samples/example-realm.json --config my-config.json

The script will generate a highly complex Keycloak realm with:
- 50+ users with realistic attributes and credentials
- 15+ hierarchical groups with subgroups
- 25+ realm roles with composites
- 12+ OAuth2/OIDC clients with protocol mappers
- 5+ identity providers (OIDC, SAML, Social)
- 8+ custom authentication flows
- Advanced security policies and configurations
    `);
        process.exit(0);
    }

    const inputFile = args[0];
    let outputFile = args[1];
    let configFile = null;

    // Parse arguments
    const configIndex = args.indexOf('--config');
    if (configIndex !== -1 && configIndex + 1 < args.length) {
        configFile = args[configIndex + 1];
        if (!outputFile || outputFile === '--config') {
            outputFile = null;
        }
    }

    if (!outputFile) {
        const inputName = path.basename(inputFile, '.json');
        outputFile = `complex-${inputName}.json`;
    }

    // Load configuration
    let config = DEFAULT_CONFIG;
    if (configFile && fs.existsSync(configFile)) {
        try {
            const customConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            config = { ...DEFAULT_CONFIG, ...customConfig };
            console.log(`📋 Loaded custom configuration from ${configFile}`);
        } catch (error) {
            console.error(`❌ Error loading config file: ${error.message}`);
            process.exit(1);
        }
    }

    // Load input realm
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        process.exit(1);
    }

    let inputRealm;
    try {
        inputRealm = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        console.log(`📖 Loaded realm: ${inputRealm.realm || 'unnamed'}`);
    } catch (error) {
        console.error(`❌ Error parsing input file: ${error.message}`);
        process.exit(1);
    }

    // Complexify the realm
    const complexifier = new RealmComplexifier(config);
    const complexRealm = complexifier.complexifyRealm(inputRealm);

    // Save output
    try {
        fs.writeFileSync(outputFile, JSON.stringify(complexRealm, null, 2));
        console.log(`💾 Complex realm saved to: ${outputFile}`);
        console.log(`📊 File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
        console.error(`❌ Error saving output file: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { DEFAULT_CONFIG, RealmComplexifier };

