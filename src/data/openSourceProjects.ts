
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
  }
];
