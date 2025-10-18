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
  Loader2,
  Upload,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Newspaper,
  Radio,
  Tv
} from 'lucide-react';
import { User } from '../App';
import { Project } from './ProjectManager';
// Placeholder images - replace with actual assets
const exampleImage1 = 'https://via.placeholder.com/400x300';
const exampleImage2 = 'https://via.placeholder.com/400x300';

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
  source?: 'facebook' | 'twitter' | 'instagram' | 'reddit' | 'news' | 'forum';
  keywords?: string[];
  relevance_score?: number;
}

interface CommunityMetrics {
  totalMentions: number;
  platformBreakdown: Array<{
    platform: string;
    mentions: number;
  }>;
  trendingTopics: Array<{
    topic: string;
    mentions: number;
    growth: number;
  }>;
}

interface ScraperConfig {
  id: string;
  name: string;
  platform: string;
  keywords: string[];
  status: 'active' | 'paused' | 'error';
  lastRun: Date;
  nextRun: Date;
  totalPosts: number;
}

export function Community({ user, currentProject }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    totalMentions: 0,
    platformBreakdown: [],
    trendingTopics: []
  });
  const [scrapers, setScrapers] = useState<ScraperConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Load community data from n8n scrapers
  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to n8n webhook
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data based on project
      const projectPosts = getProjectSamplePosts(currentProject);
      const projectMetrics = getProjectMetrics(currentProject);
      const projectScrapers = getProjectScrapers(currentProject);
      
      setPosts(projectPosts);
      setMetrics(projectMetrics);
      setScrapers(projectScrapers);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get project-specific metrics
  const getProjectMetrics = (project?: Project): CommunityMetrics => {
    if (!project) return metrics;
    
    switch (project.id) {
      case 'zrmc':
        return {
          totalMentions: 247,
          platformBreakdown: [
            { platform: 'Facebook', mentions: 156 },
            { platform: 'Twitter', mentions: 45 },
            { platform: 'Reddit', mentions: 32 },
            { platform: 'News', mentions: 14 }
          ],
          trendingTopics: [
            { topic: 'Construction Progress', mentions: 89, growth: 15 },
            { topic: 'Job Opportunities', mentions: 67, growth: 8 },
            { topic: 'Traffic Impact', mentions: 45, growth: -5 },
            { topic: 'Healthcare Access', mentions: 34, growth: 12 }
          ]
        };
      case 'tgmc':
        return {
          totalMentions: 189,
          platformBreakdown: [
            { platform: 'Facebook', mentions: 98 },
            { platform: 'Twitter', mentions: 34 },
            { platform: 'Reddit', mentions: 28 },
            { platform: 'News', mentions: 29 }
          ],
          trendingTopics: [
            { topic: 'Emergency Services', mentions: 56, growth: 22 },
            { topic: 'Specialist Care', mentions: 43, growth: 18 },
            { topic: 'Community Health', mentions: 38, growth: 8 }
          ]
        };
      default:
        return metrics;
    }
  };

  // Get project-specific scrapers
  const getProjectScrapers = (project?: Project): ScraperConfig[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'zrmc':
        return [
          {
            id: '1',
            name: 'ZRMC Facebook Monitor',
            platform: 'Facebook',
            keywords: ['Zion Regional', 'ZRMC', 'Hurricane hospital', 'medical center'],
            status: 'active',
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
            totalPosts: 156
          },
          {
            id: '2',
            name: 'ZRMC Reddit Monitor',
            platform: 'Reddit',
            keywords: ['Zion Regional', 'Hurricane', 'hospital construction'],
            status: 'active',
            lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            nextRun: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
            totalPosts: 32
          }
        ];
      case 'tgmc':
        return [
          {
            id: '1',
            name: 'TGMC Facebook Monitor',
            platform: 'Facebook',
            keywords: ['Texas General', 'TGMC', 'medical center', 'healthcare'],
            status: 'active',
            lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            nextRun: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
            totalPosts: 98
          }
        ];
      default:
        return [];
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    if (currentProject) {
      loadCommunityData();
    }
  }, [currentProject]);

  // Webhook endpoint for n8n to send data
  const handleWebhookData = async (data: any) => {
    try {
      console.log('Received webhook data:', data);
      
      // Process the incoming data from n8n
      if (data.posts && Array.isArray(data.posts)) {
        const newPosts = data.posts.map((post: any) => ({
          id: post.id || Math.random().toString(36).substr(2, 9),
          author: post.author || 'Unknown',
          platform: post.platform || data.platform || 'Unknown',
          date: post.date || new Date().toISOString(),
          content: post.content || '',
          engagement: {
            likes: post.engagement?.likes || 0,
            comments: post.engagement?.comments || 0,
            shares: post.engagement?.shares || 0
          },
          location: post.location,
          sentiment: 'neutral' as const,
          url: post.url,
          source: post.source || data.platform?.toLowerCase(),
          keywords: post.keywords || [],
          relevance_score: post.relevance_score || 0.5
        }));

        // Add new posts to existing posts
        setPosts(prev => [...newPosts, ...prev]);
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalMentions: prev.totalMentions + newPosts.length
        }));

        console.log(`Added ${newPosts.length} new posts from ${data.platform}`);
      }
    } catch (error) {
      console.error('Error processing webhook data:', error);
    }
  };

  // Expose webhook handler globally for n8n
  React.useEffect(() => {
    (window as any).handleCommunityWebhook = handleWebhookData;
    return () => {
      delete (window as any).handleCommunityWebhook;
    };
  }, []);

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

  const isAdmin = user.role === 'SuperAdmin';
  
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
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-primary/60 mx-auto mb-6" />
            <h3 className="text-2xl text-foreground mb-4">Coming Soon</h3>
            <p className="text-foreground/70 text-lg leading-relaxed">
              This page will search and display where TGMC is mentioned across public social media so we can keep up with community response.
            </p>
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

      {/* Community Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Mentions</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalMentions}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Active Scrapers</p>
                <p className="text-2xl font-bold text-foreground">{scrapers.filter(s => s.status === 'active').length}</p>
              </div>
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Platforms Monitored</p>
                <p className="text-2xl font-bold text-foreground">{metrics.platformBreakdown.length}</p>
              </div>
              <Newspaper className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* n8n Scraper Status */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-primary" />
            Social Media Scrapers (n8n)
          </CardTitle>
          <CardDescription>Automated monitoring of social media platforms and community discussions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scrapers.map((scraper) => (
              <div key={scraper.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-accent/20">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    scraper.status === 'active' ? 'bg-green-500' : 
                    scraper.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-foreground">{scraper.name}</h4>
                    <p className="text-sm text-foreground/70">
                      {scraper.platform} • {scraper.keywords.length} keywords • {scraper.totalPosts} posts
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-foreground/60">
                        Last run: {scraper.lastRun.toLocaleString()}
                      </span>
                      <span className="text-xs text-foreground/60">
                        Next: {scraper.nextRun.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={scraper.status === 'active' ? 'default' : 'secondary'}>
                    {scraper.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Trending Topics
          </CardTitle>
          <CardDescription>Most discussed topics in the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{topic.topic}</p>
                    <p className="text-sm text-foreground/70">{topic.mentions} mentions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    topic.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {topic.growth > 0 ? '+' : ''}{topic.growth}%
                  </span>
                  {topic.growth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl text-foreground">Community Posts</h2>
          <p className="text-foreground/70">Latest mentions and discussions about {currentProject?.name || 'the organization'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-foreground/60" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-background border-accent/20"
            />
          </div>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-32 bg-background border-accent/20">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Reddit">Reddit</SelectItem>
              <SelectItem value="News">News</SelectItem>
            </SelectContent>
          </Select>
          
          
          <Button 
            variant="outline" 
            onClick={loadCommunityData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Add Post Section */}
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