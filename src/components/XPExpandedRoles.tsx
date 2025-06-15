
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Code2, 
  TestTube, 
  Palette, 
  Database, 
  Shield, 
  Cpu,
  Globe,
  BarChart,
  Headphones,
  Smartphone,
  Cloud,
  GitBranch,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Settings,
  Eye,
  Lock,
  Layers,
  Network,
  FileText,
  Workflow,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Wrench,
  Monitor,
  HardDrive,
  Cog,
  PieChart,
  Search,
  Bot,
  Rocket,
  Timer,
  CheckSquare,
  AlertTriangle,
  Gamepad2,
  Camera,
  Mic,
  Video,
  Radio,
  Wifi,
  Server,
  Share2
} from "lucide-react";

export interface XPRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  responsibilities: string[];
  aiPrompt: string;
  color: string;
  specialization: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
  keySkills: string[];
  toolsUsed: string[];
  aiTrainingTopics?: string[];
  bestPractices?: string[];
}

export const expandedXPRoles: XPRole[] = [
  // Core XP Roles
  {
    id: 'customer',
    name: 'Product Owner/Customer',
    description: 'Defines requirements, priorities, and accepts deliverables',
    icon: <Users className="w-4 h-4" />,
    responsibilities: [
      'Define user stories and acceptance criteria',
      'Set feature priorities and business value',
      'Accept completed deliverables',
      'Provide continuous feedback',
      'Manage stakeholder communication'
    ],
    aiPrompt: 'You are an experienced product owner focused on maximizing business value and user satisfaction. You understand user needs deeply and can articulate clear requirements.',
    color: 'bg-blue-100 text-blue-800',
    specialization: 'Product Management',
    experienceLevel: 'senior',
    keySkills: ['Product Strategy', 'User Research', 'Stakeholder Management', 'Agile Planning'],
    toolsUsed: ['JIRA', 'Confluence', 'Figma', 'Analytics Tools'],
    aiTrainingTopics: ['Product Strategy', 'Market Analysis', 'User Experience', 'Business Metrics'],
    bestPractices: ['User-Centered Design', 'Agile Product Management', 'Data-Driven Decisions']
  },
  {
    id: 'developer',
    name: 'Full-Stack Developer',
    description: 'Implements features across the entire technology stack',
    icon: <Code2 className="w-4 h-4" />,
    responsibilities: [
      'Write clean, maintainable code',
      'Implement user stories',
      'Perform code reviews',
      'Refactor and optimize existing code',
      'Collaborate on technical decisions'
    ],
    aiPrompt: 'You are a senior full-stack developer with expertise in modern web technologies. You write clean, efficient code and follow best practices.',
    color: 'bg-green-100 text-green-800',
    specialization: 'Software Development',
    experienceLevel: 'senior',
    keySkills: ['React', 'TypeScript', 'Node.js', 'Databases', 'API Design'],
    toolsUsed: ['VS Code', 'Git', 'Docker', 'Testing Frameworks'],
    aiTrainingTopics: ['Clean Code', 'Design Patterns', 'Modern Frameworks', 'Testing Strategies'],
    bestPractices: ['SOLID Principles', 'Test-Driven Development', 'Code Reviews']
  },
  {
    id: 'tester',
    name: 'QA Engineer',
    description: 'Ensures quality through comprehensive testing strategies',
    icon: <TestTube className="w-4 h-4" />,
    responsibilities: [
      'Design comprehensive test strategies',
      'Write automated test cases',
      'Perform manual testing',
      'Find and report bugs',
      'Validate user acceptance criteria'
    ],
    aiPrompt: 'You are a meticulous QA engineer focused on finding edge cases and ensuring robust, reliable software through comprehensive testing.',
    color: 'bg-red-100 text-red-800',
    specialization: 'Quality Assurance',
    experienceLevel: 'mid',
    keySkills: ['Test Automation', 'Manual Testing', 'Bug Tracking', 'Performance Testing'],
    toolsUsed: ['Selenium', 'Jest', 'Cypress', 'Postman', 'Bug Tracking Tools'],
    aiTrainingTopics: ['Testing Methodologies', 'Automation Frameworks', 'Performance Testing', 'Security Testing'],
    bestPractices: ['Shift-Left Testing', 'Risk-Based Testing', 'Continuous Testing']
  },
  {
    id: 'designer',
    name: 'UX/UI Designer',
    description: 'Creates intuitive user experiences and beautiful interfaces',
    icon: <Palette className="w-4 h-4" />,
    responsibilities: [
      'Design user interfaces and experiences',
      'Create wireframes and prototypes',
      'Ensure design consistency',
      'Conduct user research',
      'Maintain design systems'
    ],
    aiPrompt: 'You are a creative UX/UI designer focused on user-centered design, accessibility, and creating delightful user experiences.',
    color: 'bg-purple-100 text-purple-800',
    specialization: 'User Experience Design',
    experienceLevel: 'mid',
    keySkills: ['UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    toolsUsed: ['Figma', 'Adobe Creative Suite', 'Sketch', 'InVision'],
    aiTrainingTopics: ['Design Thinking', 'User Psychology', 'Accessibility Standards', 'Design Systems'],
    bestPractices: ['User-Centered Design', 'Design System Consistency', 'Inclusive Design']
  },

  // Advanced Technical Specialists
  {
    id: 'architect',
    name: 'Solution Architect',
    description: 'Designs scalable system architecture and technical patterns',
    icon: <Database className="w-4 h-4" />,
    responsibilities: [
      'Design system architecture',
      'Make technology decisions',
      'Ensure scalability and performance',
      'Define technical standards',
      'Guide technical implementation'
    ],
    aiPrompt: 'You are a seasoned solution architect focused on building scalable, maintainable systems with modern architectural patterns.',
    color: 'bg-orange-100 text-orange-800',
    specialization: 'System Architecture',
    experienceLevel: 'expert',
    keySkills: ['System Design', 'Microservices', 'Cloud Architecture', 'Performance Optimization'],
    toolsUsed: ['AWS/Azure', 'Kubernetes', 'Architecture Tools', 'Monitoring Systems'],
    aiTrainingTopics: ['Architecture Patterns', 'Scalability Principles', 'Cloud Native Design', 'Distributed Systems'],
    bestPractices: ['Domain-Driven Design', 'Microservices Architecture', 'Event-Driven Architecture']
  },
  {
    id: 'security',
    name: 'Security Engineer',
    description: 'Ensures application security and compliance',
    icon: <Shield className="w-4 h-4" />,
    responsibilities: [
      'Perform security reviews and audits',
      'Identify vulnerabilities',
      'Implement security best practices',
      'Ensure compliance requirements',
      'Monitor security threats'
    ],
    aiPrompt: 'You are a security expert focused on identifying and mitigating security risks while maintaining usability and performance.',
    color: 'bg-yellow-100 text-yellow-800',
    specialization: 'Cybersecurity',
    experienceLevel: 'senior',
    keySkills: ['Security Auditing', 'Penetration Testing', 'Compliance', 'Threat Analysis'],
    toolsUsed: ['Security Scanners', 'OWASP Tools', 'Vulnerability Databases'],
    aiTrainingTopics: ['OWASP Top 10', 'Security Frameworks', 'Compliance Standards', 'Threat Modeling'],
    bestPractices: ['Zero Trust Security', 'Security by Design', 'Defense in Depth']
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Manages deployment, infrastructure, and CI/CD processes',
    icon: <Cloud className="w-4 h-4" />,
    responsibilities: [
      'Set up CI/CD pipelines',
      'Manage infrastructure as code',
      'Monitor system performance',
      'Automate deployment processes',
      'Ensure system reliability'
    ],
    aiPrompt: 'You are a DevOps engineer focused on automation, reliability, and efficient deployment processes using modern cloud technologies.',
    color: 'bg-cyan-100 text-cyan-800',
    specialization: 'Infrastructure & Deployment',
    experienceLevel: 'senior',
    keySkills: ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Cloud Platforms'],
    toolsUsed: ['Jenkins', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring Tools'],
    aiTrainingTopics: ['Container Orchestration', 'Infrastructure as Code', 'Monitoring & Observability', 'GitOps'],
    bestPractices: ['Infrastructure as Code', 'Continuous Deployment', 'Monitoring & Alerting']
  },

  // Specialized Domain Experts
  {
    id: 'frontend-specialist',
    name: 'Frontend Architect',
    description: 'Expert in modern frontend technologies and user interfaces',
    icon: <Smartphone className="w-4 h-4" />,
    responsibilities: [
      'Develop responsive user interfaces',
      'Optimize frontend performance',
      'Implement modern UI patterns',
      'Ensure cross-browser compatibility',
      'Lead frontend technology decisions'
    ],
    aiPrompt: 'You are a frontend architect with deep expertise in React, TypeScript, and modern web technologies, focused on creating performant, accessible UIs.',
    color: 'bg-pink-100 text-pink-800',
    specialization: 'Frontend Architecture',
    experienceLevel: 'expert',
    keySkills: ['React', 'TypeScript', 'CSS-in-JS', 'Performance Optimization', 'Accessibility'],
    toolsUsed: ['React', 'Next.js', 'Tailwind CSS', 'Webpack', 'Browser DevTools'],
    aiTrainingTopics: ['Modern React Patterns', 'Performance Optimization', 'Web Standards', 'Accessibility'],
    bestPractices: ['Component-Driven Development', 'Progressive Enhancement', 'Performance First']
  },
  {
    id: 'backend-specialist',
    name: 'Backend Architect',
    description: 'Expert in server-side development and API design',
    icon: <Cpu className="w-4 h-4" />,
    responsibilities: [
      'Design and implement APIs',
      'Optimize database performance',
      'Handle server-side logic',
      'Implement authentication & authorization',
      'Ensure data integrity and security'
    ],
    aiPrompt: 'You are a backend architect with expertise in API design, database optimization, and server-side technologies, focused on building robust, scalable backends.',
    color: 'bg-indigo-100 text-indigo-800',
    specialization: 'Backend Architecture',
    experienceLevel: 'expert',
    keySkills: ['API Design', 'Database Design', 'Authentication', 'Caching', 'Microservices'],
    toolsUsed: ['Node.js', 'PostgreSQL', 'Redis', 'API Tools', 'Server Monitoring'],
    aiTrainingTopics: ['API Design Patterns', 'Database Optimization', 'Caching Strategies', 'Security Patterns'],
    bestPractices: ['RESTful API Design', 'Database Normalization', 'Secure Authentication']
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Analyzes data patterns and builds predictive models',
    icon: <BarChart className="w-4 h-4" />,
    responsibilities: [
      'Analyze user behavior patterns',
      'Build machine learning models',
      'Create data dashboards',
      'Identify optimization opportunities',
      'Provide data-driven insights'
    ],
    aiPrompt: 'You are a data scientist focused on extracting actionable insights from data and building predictive models to drive product decisions.',
    color: 'bg-emerald-100 text-emerald-800',
    specialization: 'Data Science & Analytics',
    experienceLevel: 'senior',
    keySkills: ['Machine Learning', 'Statistical Analysis', 'Data Visualization', 'Python/R', 'SQL'],
    toolsUsed: ['Python', 'Jupyter', 'TensorFlow', 'Pandas', 'Tableau'],
    aiTrainingTopics: ['Machine Learning Algorithms', 'Statistical Methods', 'Data Engineering', 'Model Deployment'],
    bestPractices: ['Data-Driven Decision Making', 'Model Validation', 'Ethical AI']
  },

  // New Advanced Roles
  {
    id: 'ai-engineer',
    name: 'AI/ML Engineer',
    description: 'Develops and deploys AI/ML solutions and models',
    icon: <Bot className="w-4 h-4" />,
    responsibilities: [
      'Design ML architectures',
      'Train and fine-tune models',
      'Deploy ML models to production',
      'Monitor model performance',
      'Optimize inference pipelines'
    ],
    aiPrompt: 'You are an AI/ML engineer specializing in developing, training, and deploying machine learning models at scale.',
    color: 'bg-violet-100 text-violet-800',
    specialization: 'Artificial Intelligence',
    experienceLevel: 'expert',
    keySkills: ['Deep Learning', 'MLOps', 'Model Deployment', 'LLMs', 'Computer Vision'],
    toolsUsed: ['PyTorch', 'MLflow', 'Kubernetes', 'CUDA', 'Hugging Face'],
    aiTrainingTopics: ['Neural Networks', 'Transformer Architecture', 'MLOps Practices', 'Model Optimization'],
    bestPractices: ['Model Versioning', 'A/B Testing for ML', 'Responsible AI']
  },
  {
    id: 'blockchain-developer',
    name: 'Blockchain Developer',
    description: 'Develops decentralized applications and smart contracts',
    icon: <Network className="w-4 h-4" />,
    responsibilities: [
      'Write smart contracts',
      'Develop dApps',
      'Implement blockchain protocols',
      'Ensure security and gas optimization',
      'Integrate with DeFi protocols'
    ],
    aiPrompt: 'You are a blockchain developer with expertise in smart contracts, DeFi, and decentralized applications.',
    color: 'bg-amber-100 text-amber-800',
    specialization: 'Blockchain Technology',
    experienceLevel: 'senior',
    keySkills: ['Solidity', 'Web3', 'Smart Contracts', 'DeFi', 'Ethereum'],
    toolsUsed: ['Hardhat', 'Truffle', 'MetaMask', 'Remix', 'OpenZeppelin'],
    aiTrainingTopics: ['Smart Contract Security', 'DeFi Protocols', 'Consensus Mechanisms', 'Gas Optimization'],
    bestPractices: ['Security Audits', 'Gas Optimization', 'Decentralization Principles']
  },
  {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    description: 'Develops native and cross-platform mobile applications',
    icon: <Smartphone className="w-4 h-4" />,
    responsibilities: [
      'Develop mobile applications',
      'Optimize for mobile performance',
      'Implement platform-specific features',
      'Handle offline functionality',
      'Ensure mobile UX best practices'
    ],
    aiPrompt: 'You are a mobile developer specializing in creating high-performance native and cross-platform mobile applications.',
    color: 'bg-rose-100 text-rose-800',
    specialization: 'Mobile Development',
    experienceLevel: 'senior',
    keySkills: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile UX'],
    toolsUsed: ['Xcode', 'Android Studio', 'React Native', 'Flutter', 'Firebase'],
    aiTrainingTopics: ['Mobile Performance', 'Platform Guidelines', 'Mobile Security', 'Offline Storage'],
    bestPractices: ['Platform Consistency', 'Performance Optimization', 'Mobile-First Design']
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    description: 'Creates interactive gaming experiences and engines',
    icon: <Gamepad2 className="w-4 h-4" />,
    responsibilities: [
      'Develop game mechanics',
      'Optimize game performance',
      'Implement graphics and audio',
      'Create multiplayer systems',
      'Handle game state management'
    ],
    aiPrompt: 'You are a game developer focused on creating engaging, performant gaming experiences with smooth gameplay mechanics.',
    color: 'bg-lime-100 text-lime-800',
    specialization: 'Game Development',
    experienceLevel: 'senior',
    keySkills: ['Unity', 'Unreal Engine', 'C#', 'Graphics Programming', 'Game Physics'],
    toolsUsed: ['Unity', 'Unreal Engine', 'Blender', 'Git LFS', 'Game Analytics'],
    aiTrainingTopics: ['Game Engine Architecture', 'Graphics Programming', 'Game AI', 'Multiplayer Networking'],
    bestPractices: ['Optimized Rendering', 'Modular Game Architecture', 'Player Experience Focus']
  },
  {
    id: 'compliance-officer',
    name: 'Compliance Officer',
    description: 'Ensures adherence to regulations and industry standards',
    icon: <CheckSquare className="w-4 h-4" />,
    responsibilities: [
      'Review regulatory requirements',
      'Ensure GDPR/CCPA compliance',
      'Implement audit trails',
      'Monitor compliance metrics',
      'Handle compliance documentation'
    ],
    aiPrompt: 'You are a compliance officer with expertise in data protection regulations, industry standards, and risk management.',
    color: 'bg-slate-100 text-slate-800',
    specialization: 'Regulatory Compliance',
    experienceLevel: 'senior',
    keySkills: ['GDPR', 'SOX', 'HIPAA', 'Risk Assessment', 'Audit Management'],
    toolsUsed: ['Compliance Software', 'Audit Tools', 'Risk Management Platforms'],
    aiTrainingTopics: ['Data Protection Laws', 'Industry Regulations', 'Risk Management', 'Audit Procedures'],
    bestPractices: ['Privacy by Design', 'Continuous Monitoring', 'Documentation Standards']
  },
  {
    id: 'api-specialist',
    name: 'API Specialist',
    description: 'Designs and manages enterprise API ecosystems',
    icon: <Share2 className="w-4 h-4" />,
    responsibilities: [
      'Design RESTful and GraphQL APIs',
      'Implement API versioning strategies',
      'Manage API documentation',
      'Monitor API performance',
      'Handle API security and rate limiting'
    ],
    aiPrompt: 'You are an API specialist focused on creating well-designed, secure, and scalable API ecosystems.',
    color: 'bg-teal-100 text-teal-800',
    specialization: 'API Architecture',
    experienceLevel: 'senior',
    keySkills: ['REST', 'GraphQL', 'API Gateway', 'OpenAPI', 'Microservices'],
    toolsUsed: ['Swagger', 'Postman', 'Kong', 'Apollo', 'API Management Tools'],
    aiTrainingTopics: ['API Design Patterns', 'GraphQL Best Practices', 'API Security', 'Microservices Communication'],
    bestPractices: ['API-First Design', 'Versioning Strategy', 'Comprehensive Documentation']
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    description: 'Designs cloud-native solutions and migration strategies',
    icon: <Cloud className="w-4 h-4" />,
    responsibilities: [
      'Design cloud architecture',
      'Plan cloud migrations',
      'Optimize cloud costs',
      'Ensure cloud security',
      'Implement disaster recovery'
    ],
    aiPrompt: 'You are a cloud architect specializing in designing scalable, secure, and cost-effective cloud solutions.',
    color: 'bg-sky-100 text-sky-800',
    specialization: 'Cloud Architecture',
    experienceLevel: 'expert',
    keySkills: ['AWS', 'Azure', 'GCP', 'Serverless', 'Container Orchestration'],
    toolsUsed: ['Terraform', 'CloudFormation', 'Kubernetes', 'Docker', 'Cloud Monitoring'],
    aiTrainingTopics: ['Cloud Native Patterns', 'Serverless Architecture', 'Multi-Cloud Strategy', 'Cost Optimization'],
    bestPractices: ['Well-Architected Framework', 'Cloud Security', 'Cost Management']
  },
  {
    id: 'site-reliability-engineer',
    name: 'Site Reliability Engineer',
    description: 'Ensures system reliability, availability, and performance',
    icon: <Monitor className="w-4 h-4" />,
    responsibilities: [
      'Monitor system reliability',
      'Implement SLO/SLI frameworks',
      'Handle incident response',
      'Automate operational tasks',
      'Capacity planning and scaling'
    ],
    aiPrompt: 'You are an SRE focused on maintaining high system reliability through automation, monitoring, and proactive engineering.',
    color: 'bg-orange-100 text-orange-800',
    specialization: 'Site Reliability Engineering',
    experienceLevel: 'expert',
    keySkills: ['Monitoring', 'Incident Response', 'Automation', 'SLO/SLI', 'Chaos Engineering'],
    toolsUsed: ['Prometheus', 'Grafana', 'PagerDuty', 'Ansible', 'Chaos Monkey'],
    aiTrainingTopics: ['Reliability Engineering', 'Observability', 'Incident Management', 'Automation Strategies'],
    bestPractices: ['Error Budget Management', 'Blameless Postmortems', 'Automation First']
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    description: 'Creates comprehensive technical documentation and guides',
    icon: <FileText className="w-4 h-4" />,
    responsibilities: [
      'Write technical documentation',
      'Create API documentation',
      'Develop user guides',
      'Maintain knowledge bases',
      'Ensure documentation quality'
    ],
    aiPrompt: 'You are a technical writer specializing in creating clear, comprehensive documentation that helps developers and users succeed.',
    color: 'bg-gray-100 text-gray-800',
    specialization: 'Technical Communication',
    experienceLevel: 'mid',
    keySkills: ['Technical Writing', 'Documentation Tools', 'Information Architecture', 'User Experience'],
    toolsUsed: ['GitBook', 'Confluence', 'Markdown', 'Swagger', 'Documentation Generators'],
    aiTrainingTopics: ['Documentation Best Practices', 'Information Architecture', 'User-Centered Writing', 'API Documentation'],
    bestPractices: ['User-Focused Content', 'Consistent Style', 'Living Documentation']
  },
  {
    id: 'automation-engineer',
    name: 'Automation Engineer',
    description: 'Develops automated workflows and testing frameworks',
    icon: <Workflow className="w-4 h-4" />,
    responsibilities: [
      'Design automation frameworks',
      'Implement test automation',
      'Create workflow automations',
      'Optimize CI/CD pipelines',
      'Reduce manual processes'
    ],
    aiPrompt: 'You are an automation engineer focused on eliminating manual work through intelligent automation and robust testing frameworks.',
    color: 'bg-blue-100 text-blue-800',
    specialization: 'Process Automation',
    experienceLevel: 'senior',
    keySkills: ['Test Automation', 'Workflow Automation', 'CI/CD', 'Scripting', 'Process Optimization'],
    toolsUsed: ['Selenium', 'Puppeteer', 'Jenkins', 'GitHub Actions', 'Zapier'],
    aiTrainingTopics: ['Automation Frameworks', 'Test Strategy', 'Workflow Design', 'Process Optimization'],
    bestPractices: ['Maintainable Automation', 'Comprehensive Testing', 'Continuous Improvement']
  }
];

interface XPExpandedRolesProps {
  selectedRoles: string[];
  onRoleToggle: (roleId: string) => void;
  onRoleInfo: (role: XPRole) => void;
}

export function XPExpandedRoles({ selectedRoles, onRoleToggle, onRoleInfo }: XPExpandedRolesProps) {
  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const rolesByCategory = {
    'Core XP Roles': expandedXPRoles.slice(0, 4),
    'Technical Architects': expandedXPRoles.slice(4, 7),
    'Domain Specialists': expandedXPRoles.slice(7, 10),
    'Advanced Technologies': expandedXPRoles.slice(10, 14),
    'Compliance & Quality': expandedXPRoles.slice(14, 16),
    'Infrastructure & Operations': expandedXPRoles.slice(16, 19),
    'Communication & Process': expandedXPRoles.slice(19)
  };

  return (
    <div className="space-y-6">
      {Object.entries(rolesByCategory).map(([category, roles]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRoles.includes(role.id) 
                    ? 'border-purple-500 shadow-lg bg-purple-50' 
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {role.icon}
                      <span>{role.name}</span>
                    </div>
                    <Badge className={getExperienceBadgeColor(role.experienceLevel)}>
                      {role.experienceLevel}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Specialization:</p>
                      <Badge variant="outline" className="text-xs">{role.specialization}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.keySkills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {role.keySkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.keySkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant={selectedRoles.includes(role.id) ? "default" : "outline"}
                        onClick={() => onRoleToggle(role.id)}
                        className="flex-1 text-xs"
                      >
                        {selectedRoles.includes(role.id) ? 'Active' : 'Add Role'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRoleInfo(role)}
                        className="text-xs"
                      >
                        Info
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
