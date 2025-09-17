import React, { useState, useEffect } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pause,
  ExternalLink
} from "lucide-react";

interface SocialMediaProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  onAddActivity?: (action: string, section: string, details?: string) => void;
  onPendingPostsChange?: (count: number) => void;
}

interface SocialPost {
  id: string;
  platform: string;
  caption: string;
  imageUrl?: string;
  status: 'draft' | 'scheduled' | 'published' | 'paused';
  scheduledDate?: Date;
  publishedDate?: Date;
  createdBy: string;
  createdAt: Date;
}

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'];

export function SocialMedia({ user, currentProject, canEdit = true, onAddActivity, onPendingPostsChange }: SocialMediaProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [newPost, setNewPost] = useState({
    platform: '',
    caption: '',
    imageUrl: '',
    status: 'draft' as const,
    scheduledDate: ''
  });

  // Load posts from localStorage
  useEffect(() => {
    if (currentProject) {
      const savedPosts = localStorage.getItem(`social-posts-${currentProject.id}`);
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
          ...post,
          scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : undefined,
          publishedDate: post.publishedDate ? new Date(post.publishedDate) : undefined,
          createdAt: new Date(post.createdAt)
        }));
        setPosts(parsedPosts);
      }
    }
  }, [currentProject]);

  // Save posts to localStorage and update pending count
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(`social-posts-${currentProject.id}`, JSON.stringify(posts));
      
      // Count pending posts (draft + scheduled)
      const pendingCount = posts.filter(post => post.status === 'draft' || post.status === 'scheduled').length;
      if (onPendingPostsChange) {
        onPendingPostsChange(pendingCount);
      }
    }
  }, [posts, currentProject, onPendingPostsChange]);

  const handleCreatePost = () => {
    if (!newPost.platform || !newPost.caption) return;

    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform,
      caption: newPost.caption,
      imageUrl: newPost.imageUrl || undefined,
      status: newPost.status,
      scheduledDate: newPost.scheduledDate ? new Date(newPost.scheduledDate) : undefined,
      createdBy: user.name,
      createdAt: new Date()
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ platform: '', caption: '', imageUrl: '', status: 'draft', scheduledDate: '' });
    setIsCreateDialogOpen(false);

    if (onAddActivity) {
      onAddActivity('Create Post', 'Social Media', `Created ${newPost.platform} post`);
    }
  };

  const handleUpdatePost = (id: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updates } : post
    ));
    setEditingPost(null);

    if (onAddActivity) {
      onAddActivity('Update Post', 'Social Media', `Updated ${updates.platform || 'post'}`);
    }
  };

  const handleDeletePost = (id: string) => {
    const post = posts.find(p => p.id === id);
    setPosts(prev => prev.filter(post => post.id !== id));

    if (onAddActivity && post) {
      onAddActivity('Delete Post', 'Social Media', `Deleted ${post.platform} post`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Social Media</h1>
          <p className="text-foreground/70">
            Manage social media posts for {currentProject?.name || 'your organization'}
          </p>
        </div>
        {canEdit && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Create a new social media post for {currentProject?.name || 'your organization'}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newPost.platform} onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(platform => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={newPost.caption}
                    onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Write your post caption..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newPost.status} onValueChange={(value: any) => setNewPost(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newPost.status === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newPost.scheduledDate}
                      onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} disabled={!newPost.platform || !newPost.caption}>
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Social Media Account Links */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground">Social Media Accounts</CardTitle>
          <CardDescription>Quick access to your social media profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => window.open('https://facebook.com', '_blank')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">f</span>
              </div>
              <span className="text-sm font-medium">Facebook</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-pink-50 hover:border-pink-200"
              onClick={() => window.open('https://instagram.com', '_blank')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">📷</span>
              </div>
              <span className="text-sm font-medium">Instagram</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => window.open('https://linkedin.com', '_blank')}
            >
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">in</span>
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-200"
              onClick={() => window.open('https://business.google.com', '_blank')}
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-sm font-medium">Google Business</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Social Media Posts ({posts.length})
          </CardTitle>
          <CardDescription>
            Manage all your social media content in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Create your first social media post to get started.</p>
              {canEdit && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Created By</TableHead>
                  {canEdit && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.platform}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={post.caption}>
                        {post.caption}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.imageUrl ? (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                        </div>
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(post.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(post.status)}
                          {post.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.status === 'scheduled' && post.scheduledDate && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.scheduledDate)}
                          </div>
                        </div>
                      )}
                      {post.status === 'published' && post.publishedDate && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {formatDate(post.publishedDate)}
                          </div>
                        </div>
                      )}
                      {post.status === 'draft' && (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{post.createdBy}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPost(post)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Update the social media post details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-platform">Platform</Label>
                <Select value={editingPost.platform} onValueChange={(value) => setEditingPost(prev => prev ? { ...prev, platform: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, caption: e.target.value } : null)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editingPost.status} onValueChange={(value: any) => setEditingPost(prev => prev ? { ...prev, status: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdatePost(editingPost.id, editingPost)}>
                  Update Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
