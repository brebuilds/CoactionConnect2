import React, { useState, useEffect } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
import { GraphicGenerator } from "./GraphicGenerator";
import { SocialService } from "../airtable/services";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    platform: '',
    content: '',
    imageUrl: '',
    scheduledDate: '',
    pillar: '',
    postType: ''
  });
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
    setIsLoading(true);
    try {
      if (currentProject) {
        // Load posts from Airtable
        const airtablePosts = await SocialService.getPosts(currentProject.id);
        
        // Convert Airtable format to component format
        const formattedPosts: SocialPost[] = airtablePosts.map((post: any) => ({
          id: post.id,
          title: post.content?.substring(0, 50) || 'Untitled Post',
          platform: post.platforms?.[0] || 'Unknown',
          content: post.content || '',
          imageUrl: post.image_url,
          scheduledDate: new Date(post.scheduled_date || post.publish_date || new Date()),
          status: post.status || 'draft',
          pillar: post.pillar || 'General',
          postType: post.post_type || 'Post',
          createdBy: post.created_by || 'Unknown'
        }));

        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Failed to load social media data:', error);
      // Fallback to empty state
      setPosts([]);
    } finally {
      setIsLoading(false);
    }

    // Analytics remain as placeholders for now
    const placeholderAnalytics: SocialAnalytics = {
      totalFollowers: 0,
      totalPosts: 0,
      avgEngagement: 0,
      totalReach: 0,
      platformBreakdown: [],
      topPosts: []
    };

    setAnalytics(placeholderAnalytics);
  };

  const handleCreatePost = async () => {
    if (!newPost.content || !newPost.platform || !newPost.scheduledDate) return;

    const postData = {
      title: newPost.title || newPost.content.substring(0, 50),
      platform: newPost.platform,
      content: newPost.content,
      imageUrl: newPost.imageUrl || undefined,
      scheduledDate: new Date(newPost.scheduledDate),
      status: 'scheduled' as const,
      pillar: newPost.pillar || 'General',
      postType: newPost.postType || 'Post',
      createdBy: user.name || 'User'
    };

    await handleAddPost(postData);
    
    // Reset form
    setNewPost({
      title: '',
      platform: '',
      content: '',
      imageUrl: '',
      scheduledDate: '',
      pillar: '',
      postType: ''
    });
    setIsCreateDialogOpen(false);
  };

  const handleAddPost = async (post: Omit<SocialPost, 'id'>) => {
    try {
      if (currentProject) {
        // Save to Airtable
        const airtablePost = {
          content: post.content,
          platforms: [post.platform],
          status: post.status,
          scheduled_date: post.scheduledDate.toISOString(),
          publish_date: post.status === 'published' ? new Date().toISOString() : null,
          created_by: user.name || 'User',
          approved_by: null,
          pillar: post.pillar,
          post_type: post.postType,
          image_url: post.imageUrl
        };

        const newPostId = await SocialService.savePost(airtablePost, currentProject.id);
        
        // Add to local state
        const newPost: SocialPost = {
          ...post,
          id: newPostId,
          createdBy: user.name || 'User'
        };
        setPosts(prev => [...prev, newPost]);
      }
    } catch (error) {
      console.error('Failed to save post to Airtable:', error);
      // Still add to local state as fallback
      const newPost: SocialPost = {
        ...post,
        id: Date.now().toString(),
        createdBy: user.name || 'User'
      };
      setPosts(prev => [...prev, newPost]);
    }
  };

  const handleUpdatePost = async (id: string, updates: Partial<SocialPost>) => {
    try {
      if (currentProject) {
        // Update in Airtable
        const airtableUpdates: any = {};
        if (updates.content) airtableUpdates.content = updates.content;
        if (updates.status) airtableUpdates.status = updates.status;
        if (updates.scheduledDate) airtableUpdates.scheduled_date = updates.scheduledDate.toISOString();
        if (updates.platform) airtableUpdates.platforms = [updates.platform];
        if (updates.pillar) airtableUpdates.pillar = updates.pillar;
        if (updates.postType) airtableUpdates.post_type = updates.postType;
        if (updates.imageUrl) airtableUpdates.image_url = updates.imageUrl;

        await SocialService.updatePost(id, airtableUpdates);
      }
    } catch (error) {
      console.error('Failed to update post in Airtable:', error);
    }

    // Update local state
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updates } : post
    ));
  };

  const handleDeletePost = async (id: string) => {
    try {
      if (currentProject) {
        // Delete from Airtable
        await SocialService.deletePost(id);
      }
    } catch (error) {
      console.error('Failed to delete post from Airtable:', error);
    }

    // Update local state
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
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
            onClick={loadSocialData}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-transparent p-0 h-auto">
          <TabsTrigger value="calendar" className="px-6 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
            CALENDAR
          </TabsTrigger>
          <TabsTrigger value="content" className="px-6 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
            CONTENT
          </TabsTrigger>
          <TabsTrigger value="generator" className="px-6 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
            GRAPHICS
          </TabsTrigger>
          <TabsTrigger value="analytics" className="px-6 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
            INSIGHTS
          </TabsTrigger>
          <TabsTrigger value="settings" className="px-6 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
            SETTINGS
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

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Content Table Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Content Management</h2>
              <p className="text-foreground/70">Manage your social media posts and content</p>
            </div>
            {canEditSocial && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            )}
          </div>

          <Card className="border-accent/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Post</th>
                      <th className="text-left p-4 font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 font-medium text-gray-600">Pillar</th>
                      <th className="text-left p-4 font-medium text-gray-600">Graphic (etc)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Loading posts from Airtable...
                          </div>
                        </td>
                      </tr>
                    ) : posts.length > 0 ? (
                      posts.map((post) => (
                        <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                              <div>
                                <div className="font-medium text-gray-900">{post.title}</div>
                                <div className="text-sm text-gray-500">{post.content.substring(0, 60)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {post.scheduledDate.toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">
                              {post.pillar}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {post.imageUrl ? (
                              <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-400">No graphic</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No posts scheduled yet. Create your first post to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graphic Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <GraphicGenerator
            user={user}
            currentProject={currentProject}
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
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalFollowers > 0 ? analytics.totalFollowers.toLocaleString() : '--'}
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalPosts > 0 ? analytics.totalPosts : '--'}
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.avgEngagement > 0 ? `${analytics.avgEngagement}%` : '--'}
                    </p>
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
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalReach > 0 ? analytics.totalReach.toLocaleString() : '--'}
                    </p>
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
              {analytics.platformBreakdown.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No platform data available</p>
                  <p className="text-sm text-gray-400">Connect your social media accounts to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Top Performing Posts</CardTitle>
              <CardDescription>Your most engaging content this month</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topPosts.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No posts data available</p>
                  <p className="text-sm text-gray-400">Create and publish posts to see performance metrics</p>
                </div>
              )}
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

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Post</DialogTitle>
            <DialogDescription>
              Create and schedule a new social media post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Post Title (Optional)</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={newPost.platform} onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newPost.scheduledDate}
                  onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pillar">Pillar</Label>
                <Select value={newPost.pillar} onValueChange={(value) => setNewPost(prev => ({ ...prev, pillar: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Progress">Progress</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postType">Post Type</Label>
                <Select value={newPost.postType} onValueChange={(value) => setNewPost(prev => ({ ...prev, postType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Update">Update</SelectItem>
                    <SelectItem value="Tip">Tip</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Post">Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePost} 
                disabled={!newPost.content || !newPost.platform || !newPost.scheduledDate}
              >
                Schedule Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}