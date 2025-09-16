import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
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
}: SidebarProps) {
  const navigationItems = getNavigationItems(user.role, currentProject);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-sedona/30 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-sedona/30">
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
        <div className="mt-3">
          <p className="text-xs text-granite/60 uppercase tracking-wider">
            {clientSettings?.companyName
              ? clientSettings.companyName
              : "Client Dashboard"}
          </p>
        </div>
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
                onClick={() => !item.disabled && onPageChange(item.id)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium flex-1 text-left">
                  {item.label}
                </span>
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
        <div className="p-3 bg-secondary/50 rounded-lg border border-accent/20">
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
