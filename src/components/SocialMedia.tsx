import React, { useState, useEffect } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Share2,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Clock,
  TrendingUp,
  Users,
  Heart,
  MessageCircle
} from "lucide-react";
import { VisualCalendar } from "./VisualCalendar";

interface SocialMediaProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  canManageBranding?: boolean;
}

interface SocialPost {
  id: string;
  title: string;
  platform: string;
  content: string;
  imageUrl?: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  pillar: string;
  postType: string;
  createdBy: string;
}

interface SocialAnalytics {
  totalFollowers: number;
  totalPosts: number;
  avgEngagement: number;
  totalReach: number;
  platformBreakdown: Array<{
    platform: string;
    followers: number;
    engagement: number;
  }>;
  topPosts: Array<{
    id: string;
    content: string;
    platform: string;
    engagement: number;
    reach: number;
  }>;
}

export function SocialMedia({ user, currentProject, canEdit = true, canManageBranding = true }: SocialMediaProps) {
  const isAdmin = user.role === 'SuperAdmin';
  const canEditSocial = canEdit && canManageBranding;

  // State for posts
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [analytics, setAnalytics] = useState<SocialAnalytics>({
    totalFollowers: 0,
    totalPosts: 0,
    avgEngagement: 0,
    totalReach: 0,
    platformBreakdown: [],
    topPosts: []
  });

  // Load project-specific data
  useEffect(() => {
    if (currentProject) {
      loadSocialData();
    }
  }, [currentProject]);

  const loadSocialData = async () => {
    // Simulate loading social media data
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        title: 'Welcome to ZRMC',
        platform: 'Facebook',
        content: 'Excited to share our vision for the future of healthcare in our community!',
        scheduledDate: new Date(),
        status: 'published',
        pillar: 'Community',
        postType: 'Announcement',
        createdBy: 'Admin'
      },
      {
        id: '2',
        title: 'Construction Update',
        platform: 'Instagram',
        content: 'Progress continues on our new medical facility. Here\'s what\'s happening this week!',
        imageUrl: 'https://via.placeholder.com/400x300',
        scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
        status: 'scheduled',
        pillar: 'Progress',
        postType: 'Update',
        createdBy: 'Admin'
      }
    ];

    const mockAnalytics: SocialAnalytics = {
      totalFollowers: 1250,
      totalPosts: 45,
      avgEngagement: 8.5,
      totalReach: 15600,
      platformBreakdown: [
        { platform: 'Facebook', followers: 650, engagement: 12.3 },
        { platform: 'Instagram', followers: 400, engagement: 15.7 },
        { platform: 'Twitter', followers: 200, engagement: 6.2 }
      ],
      topPosts: [
        {
          id: '1',
          content: 'Welcome to ZRMC',
          platform: 'Facebook',
          engagement: 45,
          reach: 1200
        },
        {
          id: '2',
          content: 'Construction Update',
          platform: 'Instagram',
          engagement: 38,
          reach: 950
        }
      ]
    };

    setPosts(mockPosts);
    setAnalytics(mockAnalytics);
  };

  const handleAddPost = (post: Omit<SocialPost, 'id'>) => {
    const newPost: SocialPost = {
      ...post,
      id: Date.now().toString(),
      createdBy: user.name || 'User'
    };
    setPosts(prev => [...prev, newPost]);
  };

  const handleUpdatePost = (id: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updates } : post
    ));
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Social Media</h1>
          <p className="text-foreground/70">
            Manage your social media presence and content calendar
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Content Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Content Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <VisualCalendar
            posts={posts}
            onAddPost={handleAddPost}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            canEdit={canEditSocial}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70">Total Followers</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalFollowers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70">Total Posts</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalPosts}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70">Avg Engagement</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.avgEngagement}%</p>
                  </div>
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70">Total Reach</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalReach.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Breakdown */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Platform Performance</CardTitle>
              <CardDescription>Engagement and follower metrics by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platformBreakdown.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{platform.platform}</p>
                        <p className="text-sm text-foreground/70">{platform.followers.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{platform.engagement}%</p>
                      <p className="text-sm text-foreground/70">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Top Performing Posts</CardTitle>
              <CardDescription>Your most engaging content this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{post.content}</p>
                        <p className="text-sm text-foreground/70">{post.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{post.engagement}</p>
                      <p className="text-sm text-foreground/70">engagements</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Social Media Accounts</CardTitle>
              <CardDescription>Connect your social media accounts for posting and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Facebook</p>
                      <p className="text-sm text-foreground/70">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">ig</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Instagram</p>
                      <p className="text-sm text-foreground/70">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">t</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Twitter</p>
                      <p className="text-sm text-foreground/70">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Posting Preferences</CardTitle>
              <CardDescription>Configure your default posting settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Auto-schedule posts</p>
                    <p className="text-sm text-foreground/70">Automatically schedule posts at optimal times</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Content approval workflow</p>
                    <p className="text-sm text-foreground/70">Require approval before posting</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}