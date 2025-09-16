import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share, 
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { User } from '../App';
import { Project } from './ProjectManager';
import exampleImage1 from 'figma:asset/1d7d98b877bb8b9b75bbb67c4d8b8ddbc03b2b29.png';
import exampleImage2 from 'figma:asset/474136808ccf4c364621067d93c828350a78519f.png';

interface CommunityProps {
  user: User;
  currentProject?: Project;
}

interface CommunityPost {
  id: string;
  author: string;
  platform: string;
  date: string;
  content: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  location?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  screenshot?: string;
  url?: string;
}

export function Community({ user, currentProject }: CommunityProps) {

  // Project-specific sample data
  const getProjectSamplePosts = (project?: Project): CommunityPost[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          {
            id: '1',
            author: 'Sarah Mitchell',
            platform: 'LinkedIn',
            date: '2 days ago',
            content: 'Just attended the Coaction Group networking event. Incredible insights on strategic partnerships and how collaboration is reshaping business landscapes. Looking forward to exploring partnership opportunities!',
            engagement: { likes: 45, comments: 12, shares: 8 },
            location: 'Charlotte, NC',
            sentiment: 'positive'
          },
          {
            id: '2',
            author: 'Business Leaders Forum',
            platform: 'Facebook',
            date: '5 days ago',
            content: 'Coaction Group continues to set the standard for strategic business partnerships. Their collaborative approach is exactly what our industry needs.',
            engagement: { likes: 78, comments: 23, shares: 15 },
            sentiment: 'positive'
          }
        ];
      case 'zrmc':
        return [
          {
            id: '1',
            author: 'Hailey Duncan',
            platform: 'Facebook',
            date: '24 June at 21:32',
            content: 'Zion Regional Medical Center coming soon posted on fence across from Walmart in Hurricane...... You mean we ain\'t gonna have to drive to St George for a full fledged hospital anymore... I didn\'t notice if it was IHC or not.',
            engagement: { likes: 71, comments: 58, shares: 5 },
            location: 'Hurricane, UT',
            sentiment: 'positive',
            screenshot: exampleImage1,
            url: 'https://facebook.com/example1'
          },
          {
            id: '2',
            author: 'Kellie Monson',
            platform: 'Facebook',
            date: '25 June at 19:55',
            content: 'Did I hear or does anyone know if there is gonna be a new hospital across from Walmart in SR9? In Hurricane',
            engagement: { likes: 7, comments: 16, shares: 0 },
            location: 'Hurricane, UT',
            sentiment: 'neutral',
            screenshot: exampleImage2,
            url: 'https://facebook.com/example2'
          }
        ];
      case 'tgmc':
        // TGMC handled separately in component
        return [];
      default:
        return [];
    }
  };

  const [posts, setPosts] = useState<CommunityPost[]>(getProjectSamplePosts(currentProject));

  const [isAddingPost, setIsAddingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    author: '',
    platform: '',
    content: '',
    location: '',
    url: '',
    sentiment: 'positive' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
  
  // Initialize project-specific posts when project changes
  React.useEffect(() => {
    if (currentProject) {
      const savedPosts = localStorage.getItem(`community-posts-${currentProject.id}`);
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(getProjectSamplePosts(currentProject));
      }
    }
  }, [currentProject]);

  // Save posts to localStorage when posts change
  React.useEffect(() => {
    if (currentProject && posts.length > 0) {
      localStorage.setItem(`community-posts-${currentProject.id}`, JSON.stringify(posts));
    }
  }, [posts, currentProject]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleAddPost = async () => {
    if (!newPost.author || !newPost.content || !newPost.platform) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const post: CommunityPost = {
        id: Date.now().toString(),
        author: newPost.author,
        platform: newPost.platform,
        date: new Date().toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        content: newPost.content,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        location: newPost.location || undefined,
        sentiment: newPost.sentiment,
        url: newPost.url || undefined
      };

      setPosts(prev => [post, ...prev]);
      setNewPost({
        author: '',
        platform: '',
        content: '',
        location: '',
        url: '',
        sentiment: 'positive'
      });
      setIsAddingPost(false);
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Show coming soon message for TGMC
  if (currentProject?.id === 'tgmc') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground shadow-lg">
          <div className="max-w-3xl">
            <h1 className="text-3xl mb-2 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Community Mentions
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              Track community engagement and social media mentions
            </p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <Card className="border-accent/20 shadow-sm bg-background">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-primary/60 mx-auto mb-6" />
            <h3 className="text-2xl text-foreground mb-4">Community Monitoring Coming Soon</h3>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
              This page will search and display where TGMC is mentioned across public social media 
              so we can keep up with community response.
            </p>
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground/60">
                Features will include: Social media monitoring, sentiment analysis, 
                engagement tracking, and community response management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-3xl mb-2 flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Community Mentions
          </h1>
          <p className="text-primary-foreground/90 leading-relaxed">
            Track and showcase community discussions, social media mentions, and public sentiment about {currentProject?.name || 'the organization'} across various platforms.
          </p>
        </div>
      </div>



      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl text-foreground">Community Posts</h2>
          <p className="text-foreground/70">Latest mentions and discussions about {currentProject?.name || 'the organization'}</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddingPost} onOpenChange={setIsAddingPost}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Community Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Community Mention</DialogTitle>
                <DialogDescription>
                  Add a new community post or social media mention about {currentProject?.name || 'the organization'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {submitStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Community post added successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-foreground/70">Author Name</label>
                    <Input
                      placeholder="Community member name"
                      value={newPost.author}
                      onChange={(e) => setNewPost(prev => ({ ...prev, author: e.target.value }))}
                      className="bg-background border-accent/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-foreground/70">Platform</label>
                    <Select value={newPost.platform} onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}>
                      <SelectTrigger className="bg-background border-accent/20">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Google Reviews">Google Reviews</SelectItem>
                        <SelectItem value="Local Forum">Local Forum</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-foreground/70">Post Content</label>
                  <Textarea
                    placeholder={`What did they say about ${currentProject?.name || 'the organization'}?`}
                    className="min-h-24 bg-background border-accent/20"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-foreground/70">Location (Optional)</label>
                    <Input
                      placeholder="e.g., Hurricane, UT"
                      value={newPost.location}
                      onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-background border-accent/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-foreground/70">Sentiment</label>
                    <Select value={newPost.sentiment} onValueChange={(value: any) => setNewPost(prev => ({ ...prev, sentiment: value }))}>
                      <SelectTrigger className="bg-background border-accent/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-foreground/70">Source URL (Optional)</label>
                  <Input
                    placeholder="Link to original post"
                    value={newPost.url}
                    onChange={(e) => setNewPost(prev => ({ ...prev, url: e.target.value }))}
                    className="bg-background border-accent/20"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingPost(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddPost}
                    disabled={isSubmitting || !newPost.author || !newPost.content || !newPost.platform}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Post'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Community Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="border-accent/20 shadow-sm bg-background hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-foreground">{post.author}</p>
                        <div className="flex items-center space-x-1 text-foreground/60">
                          {getPlatformIcon(post.platform)}
                          <span className="text-sm">{post.platform}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-foreground/60 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getSentimentColor(post.sentiment)}>
                      {post.sentiment === 'positive' ? '👍' : post.sentiment === 'negative' ? '👎' : '➖'}
                    </Badge>
                    {post.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="pl-13">
                  <p className="text-foreground leading-relaxed">{post.content}</p>
                  
                  {/* Screenshot if available */}
                  {post.screenshot && (
                    <div className="mt-4">
                      <img 
                        src={post.screenshot} 
                        alt="Social media post screenshot"
                        className="rounded-lg border border-accent/30 max-w-md"
                      />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-accent/30">
                    <div className="flex items-center space-x-1 text-foreground/60">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-foreground/60">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-foreground/60">
                      <Share className="w-4 h-4" />
                      <span className="text-sm">{post.engagement.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for No Posts */}
      {posts.length === 0 && (
        <Card className="border-accent/20 shadow-sm bg-background">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No Community Posts Yet</h3>
            <p className="text-foreground/60 mb-6">
              Start showcasing community mentions and discussions about {currentProject?.name || 'the organization'}
            </p>
            {isAdmin && (
              <Button onClick={() => setIsAddingPost(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add First Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}