
import React from "react";
import { 
  Database, 
  Users, 
  Shield, 
  Settings, 
  Key, 
  Workflow, 
  Globe,
  Lock,
  UserCheck,
  Layers
} from "lucide-react";

export const getResourceTypeConfig = (type: string) => {
  const configs = {
    realm: { 
      icon: React.createElement(Database, { className: "w-5 h-5" }), 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    roles: { 
      icon: React.createElement(Shield, { className: "w-5 h-5" }), 
      color: 'text-purple-700', 
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
    groups: { 
      icon: React.createElement(Users, { className: "w-5 h-5" }), 
      color: 'text-green-700', 
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-200'
    },
    users: { 
      icon: React.createElement(UserCheck, { className: "w-5 h-5" }), 
      color: 'text-orange-700', 
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200'
    },
    clients: { 
      icon: React.createElement(Settings, { className: "w-5 h-5" }), 
      color: 'text-cyan-700', 
      bgColor: 'bg-cyan-50 hover:bg-cyan-100',
      borderColor: 'border-cyan-200'
    },
    scopes: { 
      icon: React.createElement(Layers, { className: "w-5 h-5" }), 
      color: 'text-pink-700', 
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      borderColor: 'border-pink-200'
    },
    flows: { 
      icon: React.createElement(Workflow, { className: "w-5 h-5" }), 
      color: 'text-indigo-700', 
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      borderColor: 'border-indigo-200'
    },
    identity_providers: { 
      icon: React.createElement(Globe, { className: "w-5 h-5" }), 
      color: 'text-yellow-700', 
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    mappers: { 
      icon: React.createElement(Key, { className: "w-5 h-5" }), 
      color: 'text-teal-700', 
      bgColor: 'bg-teal-50 hover:bg-teal-100',
      borderColor: 'border-teal-200'
    },
    group_memberships: { 
      icon: React.createElement(Users, { className: "w-5 h-5" }), 
      color: 'text-lime-700', 
      bgColor: 'bg-lime-50 hover:bg-lime-100',
      borderColor: 'border-lime-200'
    },
    role_mappings: { 
      icon: React.createElement(Shield, { className: "w-5 h-5" }), 
      color: 'text-violet-700', 
      bgColor: 'bg-violet-50 hover:bg-violet-100',
      borderColor: 'border-violet-200'
    },
    client_roles: { 
      icon: React.createElement(Lock, { className: "w-5 h-5" }), 
      color: 'text-rose-700', 
      bgColor: 'bg-rose-50 hover:bg-rose-100',
      borderColor: 'border-rose-200'
    },
    executors: { 
      icon: React.createElement(Workflow, { className: "w-5 h-5" }), 
      color: 'text-amber-700', 
      bgColor: 'bg-amber-50 hover:bg-amber-100',
      borderColor: 'border-amber-200'
    }
  };
  
  return configs[type as keyof typeof configs] || { 
    icon: React.createElement(Settings, { className: "w-5 h-5" }), 
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    borderColor: 'border-gray-200'
  };
};
