import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { BrandingAssets } from './components/BrandingAssets';
import { SocialMedia } from './components/SocialMedia';
import { Website } from './components/Website';
import { KnowledgeHub } from './components/KnowledgeHub';
import { Contact } from './components/Contact';
import { Community } from './components/Community';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { ClientSetup, ClientSettings } from './components/ClientSetup';
import { ProjectSelector } from './components/ProjectSelector';
import { 
  ProjectId, 
  UserRole, 
  Project,
  PROJECTS, 
  getAccessibleProjects, 
  getProjectById,
  projectToClientSettings,
  authenticateUser,
  canUserEdit,
  canUserManageBranding,
  canUserUploadKnowledge,
  canUserComment,
  canUserSendMessages
} from './components/ProjectManager';
import coactionLogo from 'figma:asset/6f68df0a2432de248c6e8d63876eaa4f24e121dd.png';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  projectId?: ProjectId;
};

export type CurrentPage = 'dashboard' | 'branding' | 'social' | 'website' | 'knowledge' | 'contact' | 'community' | 'insights' | 'settings';

export type AdminActivity = {
  id: string;
  action: string;
  section: string;
  timestamp: Date;
  details?: string;
};

export type AdminBulletin = {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  isActive: boolean;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<ProjectId>('coaction');
  const [loading, setLoading] = useState(true);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);

  // Get current project and convert to client settings
  const currentProject = getProjectById(currentProjectId);
  const clientSettings = projectToClientSettings(currentProject);
  
  const [needsSetup, setNeedsSetup] = useState(false);

  // Check for existing session and initialize project settings
  useEffect(() => {
    checkExistingSession();
    initializeProjectSettings();
  }, []);

  // Apply theme when project changes
  useEffect(() => {
    applyThemeColors(currentProject.colors);
  }, [currentProjectId, currentProject.colors]);

  const checkExistingSession = () => {
    try {
      const savedUser = localStorage.getItem('coaction-auth-user');
      const savedProjectId = localStorage.getItem('coaction-current-project');
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Update the name to just "Bre" if it's the Super Admin with old name
        if (user.role === 'SuperAdmin' && user.name === 'Bre Williams') {
          user.name = 'Bre';
          localStorage.setItem('coaction-auth-user', JSON.stringify(user));
        }
        setUser(user);
        
        // Set project based on user's saved project or default access
        if (savedProjectId && getAccessibleProjects(user.role).includes(savedProjectId as ProjectId)) {
          setCurrentProjectId(savedProjectId as ProjectId);
        } else if (user.projectId) {
          setCurrentProjectId(user.projectId);
        } else {
          // Default to first accessible project
          const accessibleProjects = getAccessibleProjects(user.role);
          if (accessibleProjects.length > 0) {
            setCurrentProjectId(accessibleProjects[0]);
          }
        }
      }
    } catch (error) {
      console.log('Error checking existing session:', error);
      localStorage.removeItem('coaction-auth-user');
      localStorage.removeItem('coaction-current-project');
    } finally {
      setLoading(false);
    }
  };

  const initializeProjectSettings = () => {
    try {
      // Apply default project theme
      applyThemeColors(currentProject.colors);
    } catch (error) {
      console.log('Error initializing project settings:', error);
      // Fallback to default Coaction settings
      applyThemeColors(PROJECTS.coaction.colors);
    }
  };

  const applyThemeColors = (colors: ClientSettings['colors']) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-foreground', colors.text);
    root.style.setProperty('--color-background', colors.background);
    
    // Update additional CSS variables for consistency
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--foreground', colors.text);
    root.style.setProperty('--background', colors.background);
  };



  const handleSetupComplete = (settings: ClientSettings) => {
    setNeedsSetup(false);
    // Note: In the new system, project settings are managed centrally
    // This callback is maintained for backward compatibility
  };

  const handleProjectChange = (newProjectId: ProjectId) => {
    setCurrentProjectId(newProjectId);
    localStorage.setItem('coaction-current-project', newProjectId);
    
    // Reset to dashboard when switching projects
    setCurrentPage('dashboard');
  };



  const handleLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Use the new authentication system
    const authResult = authenticateUser(username, password);
    
    if (authResult.success && authResult.user) {
      setUser(authResult.user);
      localStorage.setItem('coaction-auth-user', JSON.stringify(authResult.user));
      
      // Set initial project based on user's access
      const accessibleProjects = getAccessibleProjects(authResult.user.role);
      if (authResult.user.projectId && accessibleProjects.includes(authResult.user.projectId)) {
        setCurrentProjectId(authResult.user.projectId);
        localStorage.setItem('coaction-current-project', authResult.user.projectId);
      } else if (accessibleProjects.length > 0) {
        setCurrentProjectId(accessibleProjects[0]);
        localStorage.setItem('coaction-current-project', accessibleProjects[0]);
      }
      
      return { success: true };
    }

    return { 
      success: false, 
      error: authResult.error || 'Authentication failed.' 
    };
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setCurrentProjectId('coaction'); // Reset to default project
    localStorage.removeItem('coaction-auth-user');
    localStorage.removeItem('coaction-current-project');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-primary mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show setup if needed and no user is logged in
  if (needsSetup && !user) {
    return <ClientSetup onSetupComplete={handleSetupComplete} />;
  }

  // Show login if no user
  if (!user) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        companyName={clientSettings.companyName}
        companyLogo={clientSettings.logo}
      />
    );
  }

  const renderCurrentPage = () => {
    const canEdit = canUserEdit(user.role, currentProjectId);
    const canManageBranding = canUserManageBranding(user.role, currentProjectId);
    const canUploadKnowledge = canUserUploadKnowledge(user.role, currentProjectId);
    const canComment = canUserComment(user.role, currentProjectId);
    const canSendMessages = canUserSendMessages(user.role, currentProjectId);
    
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onPageChange={setCurrentPage} 
            clientSettings={clientSettings}
            currentProject={currentProject}
            canEdit={canEdit}
            canManageBranding={canManageBranding}
            canUploadKnowledge={canUploadKnowledge}
            canComment={canComment}
            canSendMessages={canSendMessages}
          />
        );
      case 'branding':
        return <BrandingAssets user={user} currentProject={currentProject} canEdit={canEdit} canManageBranding={canManageBranding} />;
      case 'social':
        return <SocialMedia user={user} currentProject={currentProject} onPendingPostsChange={setPendingPostsCount} canEdit={canEdit} />;
      case 'website':
        return <Website user={user} currentProject={currentProject} canEdit={canEdit} />;
      case 'knowledge':
        return <KnowledgeHub user={user} currentProject={currentProject} canEdit={canEdit} canUploadKnowledge={canUploadKnowledge} canComment={canComment} />;
      case 'contact':
        return <Contact user={user} currentProject={currentProject} canEdit={canEdit} canSendMessages={canSendMessages} />;
      case 'community':
        return <Community user={user} currentProject={currentProject} canEdit={canEdit} canComment={canComment} canSendMessages={canSendMessages} />;
      case 'insights':
        return <Insights user={user} currentProject={currentProject} canEdit={canEdit} />;
      case 'settings':
        return <Settings user={user} currentProject={currentProject} canEdit={canEdit} />;
      default:
        return (
          <Dashboard 
            user={user} 
            onPageChange={setCurrentPage} 
            clientSettings={clientSettings}
            currentProject={currentProject}
            canEdit={canEdit}
            canManageBranding={canManageBranding}
            canUploadKnowledge={canUploadKnowledge}
            canComment={canComment}
            canSendMessages={canSendMessages}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        clientSettings={clientSettings}
        pendingPostsCount={pendingPostsCount}
        currentProject={currentProject}
      />
      <div className="flex-1 ml-64">
        {/* Project Selector Header */}
        <div className="bg-background border-b border-accent/20 px-8 py-4">
          <div className="flex items-center justify-between">
            <ProjectSelector
              currentProjectId={currentProjectId}
              userRole={user.role}
              onProjectChange={handleProjectChange}
            />
            <div className="flex items-center space-x-4">
              <div className="text-sm text-foreground/70">
                Welcome back, <span className="font-medium text-foreground">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}