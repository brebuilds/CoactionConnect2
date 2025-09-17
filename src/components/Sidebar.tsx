import React, { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  LayoutDashboard,
  Palette,
  Share2,
  Globe,
  BookOpen,
  MessageCircle,
  LogOut,
  Shield,
  Users,
  TrendingUp,
  Settings,
  User as UserIcon,
  Key,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CurrentPage, User } from "../App";
import { ClientSettings } from "./ClientSetup";
import { Project } from "./ProjectManager";

interface SidebarProps {
  currentPage: CurrentPage;
  onPageChange: (page: CurrentPage) => void;
  user: User;
  onLogout: () => void;
  clientSettings?: ClientSettings;
  pendingPostsCount?: number;
  currentProject?: Project;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const getNavigationItems = (userRole: string, project?: Project) => {
  const baseItems = [
    {
      id: "dashboard" as CurrentPage,
      label: "Dashboard",
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      id: "branding" as CurrentPage,
      label: "Branding Assets",
      icon: Palette,
      disabled: false,
    },
    {
      id: "social" as CurrentPage,
      label: "Social Media",
      icon: Share2,
      disabled: project?.id === 'coaction',
    },
    {
      id: "website" as CurrentPage,
      label: "Website",
      icon: Globe,
      disabled: project?.id === 'coaction',
    },
    {
      id: "insights" as CurrentPage,
      label: "Insights",
      icon: TrendingUp,
      disabled: project?.id === 'coaction',
    },
    {
      id: "knowledge" as CurrentPage,
      label: "Knowledge Hub",
      icon: BookOpen,
      disabled: false,
    },
    {
      id: "community" as CurrentPage,
      label: "Community",
      icon: Users,
      disabled: project?.id === 'coaction',
    },
    {
      id: "contact" as CurrentPage,
      label: "Contact",
      icon: MessageCircle,
      disabled: false,
    },
  ];

  // Add settings for SuperAdmin users only (Bre)
  if (userRole === "SuperAdmin") {
    baseItems.push({
      id: "settings" as CurrentPage,
      label: "Settings/API",
      icon: Settings,
      disabled: false,
    });
  } else {
    // Add disabled settings for all other users
    baseItems.push({
      id: "settings" as CurrentPage,
      label: "Settings/API",
      icon: Settings,
      disabled: true,
    });
  }

  return baseItems;
};

export function Sidebar({
  currentPage,
  onPageChange,
  user,
  onLogout,
  clientSettings,
  pendingPostsCount = 0,
  currentProject,
  isMobileMenuOpen = false,
  onMobileMenuClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigationItems = getNavigationItems(user.role, currentProject);

  const handlePageChange = (page: CurrentPage) => {
    onPageChange(page);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };
  
  // Profile dialog state
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    newName: user.name,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleProfileUpdate = () => {
    setProfileError('');
    setProfileSuccess('');

    // Validate old password (simplified - in real app, this would verify against stored hash)
    const validPasswords = {
      'bre': 'breiscool',
      'coaction': 'gleniscool',
      'zrmc': 'zrmciscool',
      'tgmc': 'tgmciscool'
    };

    const username = user.name.toLowerCase();
    if (validPasswords[username] !== profileForm.oldPassword) {
      setProfileError('Current password is incorrect');
      return;
    }

    // Validate new password
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileError('New passwords do not match');
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      setProfileError('New password must be at least 6 characters');
      return;
    }

    // Update user info (simplified - in real app, this would update database)
    if (profileForm.newName !== user.name) {
      // Update name in localStorage
      const updatedUser = { ...user, name: profileForm.newName };
      localStorage.setItem('coaction-auth-user', JSON.stringify(updatedUser));
      setProfileSuccess('Name updated successfully! Please refresh to see changes.');
    }

    if (profileForm.newPassword) {
      setProfileSuccess('Password updated successfully!');
    }

    // Reset form
    setProfileForm({
      newName: profileForm.newName,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-sedona/30 flex flex-col shadow-sm z-20 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-6 border-b border-sedona/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {clientSettings?.logo ? (
              <img
                src={clientSettings.logo}
                alt={clientSettings.companyName || "Company Logo"}
                className="h-28 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  No Logo
                </span>
              </div>
            )}
          </div>
          
          {/* Collapse/Expand Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1 rounded hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="mt-3">
            <p className="text-xs text-granite/60 uppercase tracking-wider">
              {clientSettings?.companyName
                ? clientSettings.companyName
                : "Client Dashboard"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <div key={item.id} className="relative">
              <Button
                variant="ghost"
                disabled={item.disabled}
                className={`w-full justify-start h-11 px-3 transition-all duration-200 ${
                  item.disabled
                    ? "text-foreground/40 cursor-not-allowed opacity-50"
                    : isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    : "text-granite hover:bg-secondary hover:text-primary"
                }`}
                onClick={() => !item.disabled && handlePageChange(item.id)}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium flex-1 text-left ml-3">
                    {item.label}
                  </span>
                )}
                {/* Disabled indicator */}
                {item.disabled && (
                  <span className="text-foreground/40 text-xs ml-2">✕</span>
                )}
                {/* Notification dot for Social Media tab */}
                {item.id === "social" &&
                  pendingPostsCount > 0 && !item.disabled && (
                    <div className="relative ml-2">
                      <Badge className="bg-accent text-accent-foreground text-xs h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center">
                        {pendingPostsCount}
                      </Badge>
                    </div>
                  )}
              </Button>
            </div>
          );
        })}
      </nav>

      <Separator className="bg-sedona/30" />

      {/* User Info & Logout */}
      <div className="p-4 space-y-4">
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogTrigger asChild>
            <div className="p-3 bg-secondary/50 rounded-lg border border-accent/20 cursor-pointer hover:bg-secondary/70 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-granite font-medium truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-granite/60">
                      {user.role}
                    </p>
                    {(user.role === "Admin" ||
                      user.role === "SuperAdmin") && (
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 text-red-600 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-granite/40" />
              </div>

              {currentProject && (
                <div className="mt-2 pt-2 border-t border-accent/20">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          currentProject.colors.primary,
                      }}
                    />
                    <span className="text-xs text-granite/70 truncate">
                      {currentProject.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Edit Profile
              </DialogTitle>
              <DialogDescription>
                Update your name and password. You must verify your current password to make changes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">Display Name</Label>
                <Input
                  id="newName"
                  value={profileForm.newName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newName: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={profileForm.oldPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password (optional)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              
              {profileForm.newPassword && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              )}
              
              {profileError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {profileError}
                </div>
              )}
              
              {profileSuccess && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  {profileSuccess}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProfileUpdate}>
                  Update Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          className="w-full justify-start text-granite/70 hover:bg-secondary hover:text-granite h-9"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
