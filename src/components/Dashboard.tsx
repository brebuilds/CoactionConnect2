import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Palette, 
  Share2, 
  Globe, 
  BookOpen, 
  MessageCircle,
  Users
} from 'lucide-react';
import { User, CurrentPage } from '../App';
import { ClientSettings } from './ClientSetup';
import { Project } from './ProjectManager';

interface DashboardProps {
  user: User;
  onPageChange: (page: CurrentPage) => void;
  clientSettings?: ClientSettings | null;
  currentProject?: Project;
}

export function Dashboard({ user, onPageChange, clientSettings, currentProject }: DashboardProps) {
  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';

  // Quick actions with consistent color scheme
  const quickActions = [
    { 
      icon: Palette, 
      title: "Branding Assets", 
      description: isAdmin ? "Manage logos, colors, fonts" : "View logos, colors, fonts",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'branding' as CurrentPage
    },
    { 
      icon: Share2, 
      title: "Social Media", 
      description: isAdmin ? "Posts & campaigns" : "View posts & campaigns",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'social' as CurrentPage
    },
    { 
      icon: Globe, 
      title: "Website", 
      description: isAdmin ? "Content & updates" : "View content & updates",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'website' as CurrentPage
    },
    { 
      icon: BookOpen, 
      title: "Knowledge Hub", 
      description: "Resources & guides",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'knowledge' as CurrentPage
    },
    { 
      icon: Users, 
      title: "Community", 
      description: isAdmin ? "Community mentions" : "View community mentions",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'community' as CurrentPage
    },
    { 
      icon: MessageCircle, 
      title: "Contact", 
      description: "Get support",
      color: "bg-primary/10 text-foreground border-primary/20",
      page: 'contact' as CurrentPage
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-primary-foreground/90 text-lg leading-relaxed">
            {isAdmin 
              ? `Managing ${currentProject?.name || clientSettings?.companyName || 'your organization'}'s digital presence. You have full access to edit content, manage branding, and oversee all platform activities.`
              : `Welcome to ${currentProject?.name || clientSettings?.companyName || 'your organization'}'s portal. Access resources, view content, and collaborate with your team.`
            }
          </p>
          {isAdmin && (
            <div className="mt-4">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Administrator Access
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-accent/20 shadow-sm bg-background">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isAdmin ? 'Quick Actions' : 'Quick Access'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Manage your most-used features' 
              : 'Access your most-used resources'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard 
                key={index}
                icon={action.icon} 
                title={action.title} 
                description={action.description}
                color={action.color}
                onClick={() => onPageChange(action.page)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

function QuickActionCard({ icon: Icon, title, description, color, onClick }: QuickActionCardProps) {
  return (
    <div 
      className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${color} hover:scale-105 active:scale-95`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold mb-1">{title}</h4>
      <p className="text-xs text-foreground/80">{description}</p>
    </div>
  );
}