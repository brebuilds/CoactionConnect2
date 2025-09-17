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
import { useSyncStatus } from './utils/sync';
import { CheckCircle, AlertCircle, CloudOff } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';
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
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const syncStatus = useSyncStatus();

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

  // Auto-logout after inactivity
  useEffect(() => {
    if (!user) return; // Only set up auto-logout if user is logged in

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      setShowLogoutWarning(false);
      setLogoutCountdown(0);

      // Set warning timer (28 minutes)
      warningTimer = setTimeout(() => {
        setShowLogoutWarning(true);
        setLogoutCountdown(120); // 2 minutes countdown
        
        // Start countdown
        countdownInterval = setInterval(() => {
          setLogoutCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set final logout timer (30 minutes)
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup function
    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user]);

  const checkExistingSession = () => {
    try {
      const savedUser = localStorage.getItem('coaction-auth-user');
      const savedProjectId = localStorage.getItem('coaction-current-project');
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Update the name to just "Bre" if it's the Super Admin with old name
        if (user.role === 'SuperAdmin' && (user.name === 'Bre Williams' || user.name === 'Coaction Admin')) {
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
    const blockedForCoaction: Record<CurrentPage, boolean> = {
      dashboard: false,
      branding: false,
      social: currentProject.id === 'coaction',
      website: currentProject.id === 'coaction',
      knowledge: false,
      contact: false,
      community: currentProject.id === 'coaction',
      insights: currentProject.id === 'coaction',
      settings: false,
    } as const;

    if (blockedForCoaction[currentPage]) {
      // Graceful block: show notice and redirect to Dashboard content
      return (
        <>
          <Alert className="border-accent/20 bg-accent/5 mb-4">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-foreground">
              Section unavailable for Coaction Group
            </AlertDescription>
          </Alert>
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
        </>
      );
    }
    
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
    <div className="min-h-screen bg-background relative">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        clientSettings={clientSettings}
        pendingPostsCount={pendingPostsCount}
        currentProject={currentProject}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={`min-h-screen transition-all duration-300 px-4 md:px-6 ${isSidebarCollapsed ? 'md:ml-24' : 'md:ml-80'} bg-gray-50`}>
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Project Selector Header */}
        <div className="bg-background border-b border-accent/20 px-4 md:px-8 py-4 mt-16 md:mt-0">
          <div className="flex items-center justify-between">
            <ProjectSelector
              currentProjectId={currentProjectId}
              userRole={user.role}
              onProjectChange={handleProjectChange}
            />
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-foreground/70">
                  Welcome back, <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <div className="text-xs mt-1 flex items-center justify-end gap-1">
                  {syncStatus.level === 'synced' && (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-foreground/60">Saved to cloud</span>
                    </>
                  )}
                  {syncStatus.level === 'local-only' && (
                    <>
                      <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-foreground/60">Saved locally</span>
                    </>
                  )}
                  {syncStatus.level === 'error' && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-foreground/60">Save error</span>
                    </>
                  )}
                  {syncStatus.level === 'idle' && (
                    <span className="text-foreground/60">All changes saved</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8">
          {/* Back Button - only show when not on dashboard */}
          {currentPage !== 'dashboard' && (
            <div className="mb-6">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center text-foreground/70 hover:text-foreground transition-colors duration-200 group"
              >
                <svg 
                  className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          )}
          {renderCurrentPage()}
        </div>
      </div>

      {/* Auto-logout Warning Dialog */}
      {showLogoutWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-accent/20 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">Session Timeout Warning</h3>
            </div>
            <p className="text-foreground/70 mb-4">
              You have been inactive for 28 minutes. Your session will expire in:
            </p>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-orange-500">
                {Math.floor(logoutCountdown / 60)}:{(logoutCountdown % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-foreground/60 mt-1">minutes:seconds</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLogoutWarning(false);
                  setLogoutCountdown(0);
                  // Reset the timer by triggering a fake activity event
                  document.dispatchEvent(new Event('mousedown'));
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
