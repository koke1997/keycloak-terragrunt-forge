
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
  Settings
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
    toolsUsed: ['JIRA', 'Confluence', 'Figma', 'Analytics Tools']
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
    toolsUsed: ['VS Code', 'Git', 'Docker', 'Testing Frameworks']
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
    toolsUsed: ['Selenium', 'Jest', 'Cypress', 'Postman', 'Bug Tracking Tools']
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
    toolsUsed: ['Figma', 'Adobe Creative Suite', 'Sketch', 'InVision']
  },

  // Specialized Technical Roles
  {
    id: 'architect',
    name: 'Technical Architect',
    description: 'Designs scalable system architecture and technical patterns',
    icon: <Database className="w-4 h-4" />,
    responsibilities: [
      'Design system architecture',
      'Make technology decisions',
      'Ensure scalability and performance',
      'Define technical standards',
      'Guide technical implementation'
    ],
    aiPrompt: 'You are a seasoned technical architect focused on building scalable, maintainable systems with modern architectural patterns.',
    color: 'bg-orange-100 text-orange-800',
    specialization: 'System Architecture',
    experienceLevel: 'expert',
    keySkills: ['System Design', 'Microservices', 'Cloud Architecture', 'Performance Optimization'],
    toolsUsed: ['AWS/Azure', 'Kubernetes', 'Architecture Tools', 'Monitoring Systems']
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
    toolsUsed: ['Security Scanners', 'OWASP Tools', 'Vulnerability Databases']
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
    toolsUsed: ['Jenkins', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring Tools']
  },

  // Specialized Domain Roles
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'Expert in modern frontend technologies and user interfaces',
    icon: <Smartphone className="w-4 h-4" />,
    responsibilities: [
      'Develop responsive user interfaces',
      'Optimize frontend performance',
      'Implement modern UI patterns',
      'Ensure cross-browser compatibility',
      'Focus on user experience details'
    ],
    aiPrompt: 'You are a frontend specialist with deep expertise in React, TypeScript, and modern web technologies, focused on creating performant, accessible UIs.',
    color: 'bg-pink-100 text-pink-800',
    specialization: 'Frontend Development',
    experienceLevel: 'senior',
    keySkills: ['React', 'TypeScript', 'CSS-in-JS', 'Performance Optimization', 'Accessibility'],
    toolsUsed: ['React', 'Next.js', 'Tailwind CSS', 'Webpack', 'Browser DevTools']
  },
  {
    id: 'backend-specialist',
    name: 'Backend Specialist',
    description: 'Expert in server-side development and API design',
    icon: <Cpu className="w-4 h-4" />,
    responsibilities: [
      'Design and implement APIs',
      'Optimize database performance',
      'Handle server-side logic',
      'Implement authentication & authorization',
      'Ensure data integrity and security'
    ],
    aiPrompt: 'You are a backend specialist with expertise in API design, database optimization, and server-side technologies, focused on building robust, scalable backends.',
    color: 'bg-indigo-100 text-indigo-800',
    specialization: 'Backend Development',
    experienceLevel: 'senior',
    keySkills: ['API Design', 'Database Design', 'Authentication', 'Caching', 'Microservices'],
    toolsUsed: ['Node.js', 'PostgreSQL', 'Redis', 'API Tools', 'Server Monitoring']
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes user behavior and application metrics',
    icon: <BarChart className="w-4 h-4" />,
    responsibilities: [
      'Analyze user behavior patterns',
      'Create data dashboards',
      'Identify optimization opportunities',
      'Track key performance metrics',
      'Provide data-driven insights'
    ],
    aiPrompt: 'You are a data analyst focused on extracting actionable insights from user data to drive product decisions and improvements.',
    color: 'bg-emerald-100 text-emerald-800',
    specialization: 'Data Analysis',
    experienceLevel: 'mid',
    keySkills: ['Data Analysis', 'SQL', 'Statistics', 'Data Visualization', 'A/B Testing'],
    toolsUsed: ['Analytics Tools', 'SQL', 'Python/R', 'Dashboard Tools', 'A/B Testing Platforms']
  },
  {
    id: 'performance-engineer',
    name: 'Performance Engineer',
    description: 'Optimizes application performance and scalability',
    icon: <Zap className="w-4 h-4" />,
    responsibilities: [
      'Profile application performance',
      'Identify bottlenecks',
      'Optimize critical code paths',
      'Design performance tests',
      'Monitor production performance'
    ],
    aiPrompt: 'You are a performance engineer focused on making applications fast, efficient, and scalable through systematic optimization.',
    color: 'bg-yellow-100 text-yellow-800',
    specialization: 'Performance Optimization',
    experienceLevel: 'senior',
    keySkills: ['Performance Profiling', 'Optimization Techniques', 'Load Testing', 'Caching Strategies'],
    toolsUsed: ['Profiling Tools', 'Load Testing Tools', 'APM Tools', 'Browser DevTools']
  },

  // Business & Strategy Roles
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    description: 'Bridges business requirements with technical implementation',
    icon: <Target className="w-4 h-4" />,
    responsibilities: [
      'Analyze business requirements',
      'Document functional specifications',
      'Facilitate stakeholder communication',
      'Validate business rules',
      'Support user acceptance testing'
    ],
    aiPrompt: 'You are a business analyst who excels at understanding complex business needs and translating them into clear technical requirements.',
    color: 'bg-teal-100 text-teal-800',
    specialization: 'Business Analysis',
    experienceLevel: 'mid',
    keySkills: ['Requirements Analysis', 'Process Modeling', 'Stakeholder Management', 'Documentation'],
    toolsUsed: ['Requirements Tools', 'Process Modeling Tools', 'Documentation Platforms']
  },
  {
    id: 'scrum-master',
    name: 'Scrum Master',
    description: 'Facilitates agile processes and removes team impediments',
    icon: <Settings className="w-4 h-4" />,
    responsibilities: [
      'Facilitate scrum ceremonies',
      'Remove team impediments',
      'Coach team on agile practices',
      'Track team metrics',
      'Ensure process improvement'
    ],
    aiPrompt: 'You are an experienced Scrum Master focused on enabling team productivity, removing obstacles, and fostering continuous improvement.',
    color: 'bg-slate-100 text-slate-800',
    specialization: 'Agile Coaching',
    experienceLevel: 'mid',
    keySkills: ['Scrum Framework', 'Facilitation', 'Coaching', 'Conflict Resolution', 'Metrics'],
    toolsUsed: ['Agile Tools', 'Collaboration Platforms', 'Metrics Dashboards']
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
    'Technical Specialists': expandedXPRoles.slice(4, 7),
    'Domain Experts': expandedXPRoles.slice(7, 10),
    'Business & Process': expandedXPRoles.slice(10)
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
