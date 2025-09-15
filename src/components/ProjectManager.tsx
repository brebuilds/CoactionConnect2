import React from 'react';
import { ClientSettings } from './ClientSetup';

export type ProjectId = 'coaction' | 'zrmc' | 'tgmc';

export type UserRole = 'SuperAdmin' | 'CoactionViewer' | 'ZRMCClient' | 'TGMCClient';

export type ProjectAccess = {
  canView: boolean;
  canEdit: boolean;
  canManageUsers: boolean;
  canManageBranding: boolean;
  canUploadKnowledge: boolean;
  canComment: boolean;
  canSendMessages: boolean;
};

export type Project = {
  id: ProjectId;
  name: string;
  description: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  credentials: {
    admin: {
      username: string;
      password: string;
      name: string;
      email: string;
    };
    team: {
      username: string;
      password: string;
      name: string;
      email: string;
    };
  };
};

// Project configurations
export const PROJECTS: Record<ProjectId, Project> = {
  coaction: {
    id: 'coaction',
    name: 'Coaction Group',
    description: 'The Single Source Advantage',
    logo: '/CC-Main-Logo.png',
    colors: {
      primary: '#1c5f9a',    // Coaction blue
      secondary: '#FFFFFF',  // Coaction white
      accent: '#c9741c',     // Coaction orange
      text: '#2e496c',       // Coaction navy
      background: '#FFFFFF'  // Coaction white
    },
    credentials: {
      admin: {
        username: 'admin',
        password: 'CoactionAdmin2024!',
        name: 'Coaction Administrator',
        email: 'admin@coaction.com'
      },
      team: {
        username: 'coaction',
        password: 'CoactionTeam2024!',
        name: 'Coaction Team Member',
        email: 'team@coaction.com'
      }
    }
  },
  zrmc: {
    id: 'zrmc',
    name: 'Zion Regional Medical Center',
    description: 'Healthcare excellence and community wellness initiatives',
    logo: '/ZRMC-Main-Logo.png',
    colors: {
      primary: '#9BB1BB',    // ZRMC blue (sidebar)
      secondary: '#F7F7F7',  // ZRMC main background
      accent: '#8F8781',     // ZRMC brown (accents)
      text: '#403F48',       // ZRMC dark
      background: '#F7F7F7'  // ZRMC main background
    },
    credentials: {
      admin: {
        username: 'zrmc-admin',
        password: 'ZrmcAdmin2024!',
        name: 'ZRMC Administrator',
        email: 'admin@zionregional.com'
      },
      team: {
        username: 'zrmc-team',
        password: 'ZrmcTeam2024!',
        name: 'ZRMC Team Member',
        email: 'team@zionregional.com'
      }
    }
  },
  tgmc: {
    id: 'tgmc',
    name: 'Texas General Medical Center',
    description: 'Premier healthcare services and medical innovation',
    logo: '/TGMC-Main-Logo.png',
    colors: {
      primary: '#0281AB',    // TGMC blue
      secondary: '#C5E4EF',  // TGMC light blue
      accent: '#545454',     // TGMC gray
      text: '#023a5c',       // TGMC navy
      background: '#F7F7F7'  // TGMC white
    },
    credentials: {
      admin: {
        username: 'tgmc-admin',
        password: 'TgmcAdmin2024!',
        name: 'TGMC Administrator',
        email: 'admin@texasgeneral.com'
      },
      team: {
        username: 'tgmc-team',
        password: 'TgmcTeam2024!',
        name: 'TGMC Team Member',
        email: 'team@texasgeneral.com'
      }
    }
  }
};

// Role-based project access matrix
export const PROJECT_ACCESS: Record<UserRole, Record<ProjectId, ProjectAccess>> = {
  SuperAdmin: {
    coaction: { canView: true, canEdit: true, canManageUsers: true, canManageBranding: true, canUploadKnowledge: true, canComment: true, canSendMessages: true },
    zrmc: { canView: true, canEdit: true, canManageUsers: true, canManageBranding: true, canUploadKnowledge: true, canComment: true, canSendMessages: true },
    tgmc: { canView: true, canEdit: true, canManageUsers: true, canManageBranding: true, canUploadKnowledge: true, canComment: true, canSendMessages: true }
  },
  CoactionViewer: {
    coaction: { canView: true, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: true, canComment: true, canSendMessages: true },
    zrmc: { canView: true, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: true, canComment: true, canSendMessages: true },
    tgmc: { canView: true, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: true, canComment: true, canSendMessages: true }
  },
  ZRMCClient: {
    coaction: { canView: false, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: false, canComment: false, canSendMessages: false },
    zrmc: { canView: true, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: true, canComment: true, canSendMessages: true },
    tgmc: { canView: false, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: false, canComment: false, canSendMessages: false }
  },
  TGMCClient: {
    coaction: { canView: false, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: false, canComment: false, canSendMessages: false },
    zrmc: { canView: false, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: false, canComment: false, canSendMessages: false },
    tgmc: { canView: true, canEdit: false, canManageUsers: false, canManageBranding: false, canUploadKnowledge: true, canComment: true, canSendMessages: true }
  }
};

// Utility functions
export const getAccessibleProjects = (userRole: UserRole): ProjectId[] => {
  return Object.keys(PROJECT_ACCESS[userRole]).filter(
    projectId => PROJECT_ACCESS[userRole][projectId as ProjectId].canView
  ) as ProjectId[];
};

export const hasProjectAccess = (userRole: UserRole, projectId: ProjectId, permission: keyof ProjectAccess): boolean => {
  return PROJECT_ACCESS[userRole]?.[projectId]?.[permission] || false;
};

// Utility function to check if user can edit current project
export const canUserEdit = (userRole: UserRole, projectId: ProjectId): boolean => {
  return hasProjectAccess(userRole, projectId, 'canEdit');
};

// Utility function to check if user can manage branding
export const canUserManageBranding = (userRole: UserRole, projectId: ProjectId): boolean => {
  return hasProjectAccess(userRole, projectId, 'canManageBranding');
};

// Utility function to check if user can upload to knowledge hub
export const canUserUploadKnowledge = (userRole: UserRole, projectId: ProjectId): boolean => {
  return hasProjectAccess(userRole, projectId, 'canUploadKnowledge');
};

// Utility function to check if user can comment
export const canUserComment = (userRole: UserRole, projectId: ProjectId): boolean => {
  return hasProjectAccess(userRole, projectId, 'canComment');
};

// Utility function to check if user can send messages
export const canUserSendMessages = (userRole: UserRole, projectId: ProjectId): boolean => {
  return hasProjectAccess(userRole, projectId, 'canSendMessages');
};

export const getProjectById = (projectId: ProjectId): Project => {
  // Check if there's an updated project in localStorage
  const savedProject = localStorage.getItem(`project-${projectId}`);
  if (savedProject) {
    try {
      const parsedProject = JSON.parse(savedProject);
      return { ...PROJECTS[projectId], ...parsedProject };
    } catch (error) {
      console.error('Error parsing saved project:', error);
    }
  }
  
  return PROJECTS[projectId];
};

export const getAllProjects = (): Project[] => {
  return Object.values(PROJECTS);
};

// Convert Project to ClientSettings for backward compatibility
export const projectToClientSettings = (project: Project): ClientSettings => {
  return {
    companyName: `${project.name} Portal`,
    companyDescription: project.description,
    logo: project.logo || '/CC-Main-Logo.png',
    colors: project.colors,
    adminCredentials: project.credentials.admin,
    advisorCredentials: project.credentials.team
  };
};

// User authentication for multi-project system
export const authenticateUser = (username: string, password: string): { 
  success: boolean; 
  user?: { 
    id: string; 
    email: string; 
    name: string; 
    role: UserRole;
    projectId?: ProjectId; 
  }; 
  error?: string; 
} => {
  
  // Super Admin credentials (Bre) - Full editing permissions across all projects
  if (username === 'bre' && password === '1Lampshade!') {
    return {
      success: true,
      user: {
        id: 'super-admin-001',
        email: 'bre@brebuilds.com',
        name: 'Bre',
        role: 'SuperAdmin'
      }
    };
  }

  // Coaction Viewer credentials - View all projects, download assets, but no editing
  if (username === 'coaction' && password === 'gleniscool') {
    return {
      success: true,
      user: {
        id: 'coaction-viewer-001',
        email: 'viewer@coaction.com',
        name: 'Coaction Viewer',
        role: 'CoactionViewer'
      }
    };
  }

  // ZRMC Client credentials - Only ZRMC view/client view
  if (username === 'zrmc' && password === 'hurricaneheals') {
    return {
      success: true,
      user: {
        id: 'zrmc-client-001',
        email: 'zionregionalmedicalcenter@gmail.com',
        name: 'ZRMC Team',
        role: 'ZRMCClient',
        projectId: 'zrmc'
      }
    };
  }

  // TGMC Client credentials - Only TGMC view/client view
  if (username === 'tgmc' && password === 'hernameisrio') {
    return {
      success: true,
      user: {
        id: 'tgmc-client-001',
        email: 'texasgeneralmedicalcenter@gmail.com',
        name: 'TGMC Team',
        role: 'TGMCClient',
        projectId: 'tgmc'
      }
    };
  }

  return {
    success: false,
    error: 'Invalid username or password. Please check your credentials.'
  };
};

export default {
  PROJECTS,
  PROJECT_ACCESS,
  getAccessibleProjects,
  hasProjectAccess,
  canUserEdit,
  canUserManageBranding,
  canUserUploadKnowledge,
  canUserComment,
  canUserSendMessages,
  getProjectById,
  getAllProjects,
  projectToClientSettings,
  authenticateUser
};