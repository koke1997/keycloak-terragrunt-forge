/**
 * Central list of available open source projects for the ProjectSelector UI.
 * Add as many projects here as you like!
 */
export interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  techStack: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'web-app' | 'api' | 'full-stack' | 'mobile' | 'desktop';
  estimatedHours: string;
  learningObjectives: string[];
  roles: string[];
}

export const openSourceProjects: OpenSourceProject[] = [
  {
    id: 'react-todo',
    name: 'Advanced Todo App',
    description: 'Feature-rich todo application with real-time sync, drag-and-drop, and team collaboration',
    githubUrl: 'https://github.com/example/react-todo-advanced',
    techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Framer Motion'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '15-25 hours',
    learningObjectives: ['State management', 'Real-time updates', 'Authentication', 'UI animations'],
    roles: ['developer', 'designer', 'customer']
  },
  {
    id: 'expense-tracker',
    name: 'Personal Finance Tracker',
    description: 'Comprehensive expense tracking with budgets, categories, and financial insights',
    githubUrl: 'https://github.com/example/expense-tracker',
    techStack: ['React', 'TypeScript', 'Chart.js', 'Supabase', 'PWA'],
    complexity: 'Advanced',
    category: 'full-stack',
    estimatedHours: '30-45 hours',
    learningObjectives: ['Data visualization', 'Complex state', 'PWA features', 'Financial calculations'],
    roles: ['developer', 'customer', 'security']
  },
  {
    id: 'blog-platform',
    name: 'Modern Blog Platform',
    description: 'Multi-author blog platform with rich text editor, comments, and SEO optimization',
    githubUrl: 'https://github.com/example/blog-platform',
    techStack: ['React', 'TypeScript', 'TinyMCE', 'Supabase', 'React Query'],
    complexity: 'Advanced',
    category: 'full-stack',
    estimatedHours: '40-60 hours',
    learningObjectives: ['Rich text editing', 'SEO optimization', 'Multi-user systems', 'Content management'],
    roles: ['developer', 'designer', 'customer', 'seo']
  },
  {
    id: 'task-manager',
    name: 'Team Task Manager',
    description: 'Kanban-style task management with team collaboration and time tracking',
    githubUrl: 'https://github.com/example/task-manager',
    techStack: ['React', 'TypeScript', 'DnD Kit', 'Supabase', 'WebSockets'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '20-35 hours',
    learningObjectives: ['Drag and drop', 'Real-time collaboration', 'Project management', 'Time tracking'],
    roles: ['developer', 'designer', 'manager', 'customer']
  },
  {
    id: 'recipe-app',
    name: 'Recipe Collection App',
    description: 'Recipe management with meal planning, shopping lists, and nutritional info',
    githubUrl: 'https://github.com/example/recipe-app',
    techStack: ['React', 'TypeScript', 'Supabase', 'PWA', 'Camera API'],
    complexity: 'Beginner',
    category: 'web-app',
    estimatedHours: '10-20 hours',
    learningObjectives: ['CRUD operations', 'Image handling', 'PWA basics', 'Local storage'],
    roles: ['developer', 'customer']
  },
  // -- Add as many as you want below! Here are some additional sample projects for demonstration --
  {
    id: 'portfolio-site',
    name: 'Personal Portfolio Site',
    description: 'A beautiful personal site to showcase projects, skills, and work history.',
    githubUrl: 'https://github.com/example/portfolio-site',
    techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    complexity: 'Beginner',
    category: 'web-app',
    estimatedHours: '8-15 hours',
    learningObjectives: ['Static generation', 'Routing', 'Styling'],
    roles: ['designer', 'developer']
  },
  {
    id: 'chat-app',
    name: 'Real-time Chat Application',
    description: 'Modern chat app with typing indicators, media messages, and group chat.',
    githubUrl: 'https://github.com/example/chat-app',
    techStack: ['React', 'TypeScript', 'Socket.IO', 'Supabase', 'Tailwind CSS'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '20-30 hours',
    learningObjectives: ['WebSockets', 'Authentication', 'Media uploads', 'Notifications'],
    roles: ['developer', 'security', 'customer']
  },
  {
    id: 'ecommerce-platform',
    name: 'E-commerce Platform',
    description: 'Complete online store solution with cart, payments, and admin dashboard.',
    githubUrl: 'https://github.com/example/ecommerce',
    techStack: ['React', 'TypeScript', 'Stripe', 'Supabase', 'Tailwind CSS'],
    complexity: 'Advanced',
    category: 'full-stack',
    estimatedHours: '50-75 hours',
    learningObjectives: ['Payments integration', 'Order management', 'Role-based access'],
    roles: ['developer', 'designer', 'security', 'customer', 'manager']
  },
  // Added from "awesome lists" and modern open source inspirations
  {
    id: 'github-explorer',
    name: 'GitHub Repo Explorer',
    description: 'Visualize and analyze GitHub repositories, contributors, and issues with charts and AI summaries.',
    githubUrl: 'https://github.com/benbalter/github-repo-explorer',
    techStack: ['React', 'TypeScript', 'GitHub API', 'Recharts', 'Vercel'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '12-20 hours',
    learningObjectives: [
      'API consumption',
      'OAuth integration',
      'Data visualization',
      'Repository analytics'
    ],
    roles: ['developer', 'data analyst', 'product manager']
  },
  {
    id: 'ml-playground',
    name: 'ML Playground',
    description: 'Experiment with machine learning models (Hugging Face, llama.cpp, ONNX) in the browser with widgets for text and vision.',
    githubUrl: 'https://github.com/huggingface/ml-playground',
    techStack: ['React', 'TypeScript', 'Hugging Face', 'onnxruntime-web', 'Web Workers'],
    complexity: 'Advanced',
    category: 'web-app',
    estimatedHours: '30-60 hours',
    learningObjectives: [
      'Model inference',
      'Web workers',
      'Hugging Face API',
      'Interactive UI'
    ],
    roles: ['machine learning engineer', 'developer', 'researcher']
  },
  {
    id: 'oss-crm',
    name: 'Open Source CRM',
    description: 'Lightweight CRM with user auth, Kanban board, and system for tracking leads and communications.',
    githubUrl: 'https://github.com/awesome-crm/oss-crm',
    techStack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    complexity: 'Intermediate',
    category: 'full-stack',
    estimatedHours: '18-26 hours',
    learningObjectives: [
      'User authentication',
      'CRUD features',
      'Kanban UI',
      'Real-time updates'
    ],
    roles: ['product manager', 'customer success', 'developer']
  },
  {
    id: 'openapi-doc-tool',
    name: 'OpenAPI Doc Generator',
    description: 'Generate beautiful, interactive documentation for APIs from OpenAPI/Swagger files.',
    githubUrl: 'https://github.com/Redocly/redoc',
    techStack: ['React', 'TypeScript', 'Swagger', 'Markdown', 'Docker'],
    complexity: 'Beginner',
    category: 'web-app',
    estimatedHours: '8-14 hours',
    learningObjectives: [
      'Parsing schemas',
      'Markdown rendering',
      'Documentation UX'
    ],
    roles: ['developer', 'technical writer', 'designer']
  },
  {
    id: 'data-viz-dashboard',
    name: 'Data Visualization Dashboard',
    description: 'Drag and drop dashboard for uploading datasets (CSV/JSON) and building interactive charts.',
    githubUrl: 'https://github.com/keen/dashboards',
    techStack: ['React', 'TypeScript', 'Recharts', 'PapaParse'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '15-22 hours',
    learningObjectives: [
      'File uploads',
      'Dynamic charting',
      'Drag-and-drop UX'
    ],
    roles: ['data analyst', 'developer', 'UX designer']
  },
  {
    id: 'free-chatgpt-ui',
    name: 'Free ChatGPT UI',
    description: 'Open-source chat UI supporting multiple LLMs (OpenAI, Hugging Face, llama.cpp) with local or cloud endpoints.',
    githubUrl: 'https://github.com/lobehub/lobe-chat',
    techStack: ['React', 'TypeScript', 'Socket.IO', 'Hugging Face', 'llama.cpp'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '10-18 hours',
    learningObjectives: [
      'LLM integration',
      'Socket connections',
      'Local model/remote API switching'
    ],
    roles: ['AI practitioner', 'developer', 'student']
  },
  {
    id: 'open-resume',
    name: 'Open Resume Generator',
    description: 'Modern resume/CV builder that exports PDFs, integrates with GitHub and automates formatting.',
    githubUrl: 'https://github.com/open-resume/open-resume',
    techStack: ['React', 'TypeScript', 'PDF', 'Tailwind CSS'],
    complexity: 'Beginner',
    category: 'web-app',
    estimatedHours: '5-10 hours',
    learningObjectives: [
      'PDF generation',
      'User customization',
      'GitHub OAuth'
    ],
    roles: ['designer', 'developer', 'job seeker']
  },
  {
    id: 'openkanban',
    name: 'Open Kanban Board',
    description: 'A Trello-like Kanban board app with real-time updates, team sharing, and advanced UX.',
    githubUrl: 'https://github.com/openkanban/openkanban',
    techStack: ['React', 'TypeScript', 'Socket.IO', 'Tailwind CSS', 'Supabase'],
    complexity: 'Intermediate',
    category: 'web-app',
    estimatedHours: '15-24 hours',
    learningObjectives: [
      'Real-time sync',
      'Board UI patterns',
      'User collaboration'
    ],
    roles: ['product manager', 'developer', 'designer']
  }
];
