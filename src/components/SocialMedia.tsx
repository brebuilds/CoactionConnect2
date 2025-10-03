import React, { useState, useEffect } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { GraphicTemplateService } from "../airtable/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
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
  ExternalLink,
  TrendingUp,
  Users,
  Heart,
  FileText,
  Video,
  Layout,
  Image as ImageIconSolid,
  Zap,
  BookOpen,
  Palette,
  BarChart3,
  Target,
  Smile,
  ShoppingBag,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Download,
  Link as LinkIcon
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
  pillar?: string;
  postType?: string;
  goal?: string;
}

interface ContentPillar {
  id: string;
  name: string;
  icon: any;
  color: string;
  recommended: number;
  actual: number;
}

interface GeneratedContent {
  caption: string;
  hashtags: string[];
}

interface GraphicTemplate {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  dimensions?: string;
  tags?: string[];
}

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'];
const POST_TYPES = ['Reel', 'Carousel', 'Static Post', 'Story', 'Ad'];
const GOALS = ['Engagement', 'Sales', 'Awareness', 'Testimonials', 'Education'];
const TONES = ['Playful', 'Professional', 'Bold', 'Minimal', 'Compassionate', 'Inspiring'];
const TEMPLATE_CATEGORIES = ['All', 'Social Posts', 'Stories', 'Quotes', 'Announcements', 'Testimonials', 'Events', 'Health Tips', 'Promotions'];

export function SocialMedia({ user, currentProject, canEdit = true, onAddActivity, onPendingPostsChange }: SocialMediaProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [newPost, setNewPost] = useState({
    platform: '',
    caption: '',
    imageUrl: '',
    status: 'draft' as const,
    scheduledDate: '',
    pillar: '',
    postType: '',
    goal: ''
  });

  // Content Generation Agent state
  const [agentForm, setAgentForm] = useState({
    postType: '',
    goal: '',
    tone: '',
    prompt: ''
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Content Pillars for Strategy Section
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([
    { id: 'educational', name: 'Educational', icon: GraduationCap, color: 'bg-blue-500', recommended: 40, actual: 32 },
    { id: 'community', name: 'Community', icon: MessageCircle, color: 'bg-green-500', recommended: 30, actual: 27 },
    { id: 'promotional', name: 'Promotional', icon: ShoppingBag, color: 'bg-purple-500', recommended: 20, actual: 31 },
    { id: 'personality', name: 'Personality/Fun', icon: Smile, color: 'bg-orange-500', recommended: 10, actual: 10 }
  ]);

  // KPI Data
  const [kpiData, setKpiData] = useState({
    engagementRate: '4.2%',
    topPostType: 'Carousel',
    followerGrowth: '+12%'
  });

  // Graphic Templates state
  const [graphicTemplates, setGraphicTemplates] = useState<GraphicTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GraphicTemplate | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Social Posts',
    imageUrl: '',
    dimensions: '',
    tags: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load posts and templates
  useEffect(() => {
    if (currentProject) {
      // Load posts from localStorage (keeping existing behavior)
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

      // Load graphic templates from Airtable
      loadTemplatesFromAirtable();

      // Set up polling for 2-way sync (check for updates every 30 seconds)
      const syncInterval = setInterval(() => {
        loadTemplatesFromAirtable();
      }, 30000); // 30 seconds

      // Cleanup interval on unmount
      return () => clearInterval(syncInterval);
    }
  }, [currentProject]);

  // Load templates from Airtable
  const loadTemplatesFromAirtable = async () => {
    if (!currentProject) return;

    try {
      const templates = await GraphicTemplateService.getTemplates(currentProject.id);
      setGraphicTemplates(templates);
    } catch (error) {
      console.error('Error loading templates from Airtable:', error);
      // Fallback to localStorage
      const savedTemplates = localStorage.getItem(`graphic-templates-${currentProject.id}`);
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates).map((template: any) => ({
          ...template,
          uploadedAt: new Date(template.uploadedAt)
        }));
        setGraphicTemplates(parsedTemplates);
      }
    }
  };

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

  // Note: Graphic templates are now saved to Airtable automatically on upload/delete
  // No need for localStorage syncing

  const handleGenerateContent = () => {
    if (!agentForm.postType || !agentForm.goal || !agentForm.prompt) return;

    setIsGenerating(true);

    // Simulate AI generation (in production, this would call an actual AI API)
    setTimeout(() => {
      const templates = {
        Engagement: [
          `🏥 ${agentForm.prompt}\n\nWhat's your experience with healthcare? Share your story in the comments! 👇`,
          `We're passionate about ${agentForm.prompt}. Join the conversation and let us know your thoughts! 💙`,
          `Did you know? ${agentForm.prompt}\n\nDouble tap if you found this helpful! ❤️`
        ],
        Sales: [
          `${agentForm.prompt}\n\n📞 Call us today to learn more about our services.\n🔗 Visit the link in bio to schedule an appointment.`,
          `Transform your health journey! ${agentForm.prompt}\n\n✨ Book your consultation now - limited spots available!`,
          `Special offer: ${agentForm.prompt}\n\nDon't miss out! Contact us today.`
        ],
        Awareness: [
          `Raising awareness about ${agentForm.prompt}\n\nTogether, we can make a difference in our community's health. 🌟`,
          `${agentForm.prompt}\n\nEducation is the first step to better health. Learn more at our Knowledge Hub.`,
          `Important health information: ${agentForm.prompt}\n\nShare to help spread awareness! 🔄`
        ],
        Testimonials: [
          `"${agentForm.prompt}"\n\nYour trust means everything to us. Thank you for sharing your journey! 💙`,
          `Patient success story: ${agentForm.prompt}\n\nWe're honored to be part of your healthcare journey.`,
          `Real stories, real results: ${agentForm.prompt}\n\n#PatientCare #HealthcareExcellence`
        ],
        Education: [
          `📚 Health Education: ${agentForm.prompt}\n\nKnowledge is power when it comes to your health!`,
          `Learn about ${agentForm.prompt}\n\nOur experts break down what you need to know. 🩺`,
          `Medical insight: ${agentForm.prompt}\n\nStay informed, stay healthy! 💪`
        ]
      };

      const hashtagSets = {
        Engagement: ['#HealthcareCommunity', '#PatientFirst', '#WellnessJourney'],
        Sales: ['#HealthcareServices', '#BookNow', '#QualityCare'],
        Awareness: ['#HealthAwareness', '#CommunityHealth', '#Prevention'],
        Testimonials: ['#PatientStories', '#RealResults', '#TrustedCare'],
        Education: ['#HealthEducation', '#MedicalKnowledge', '#HealthTips']
      };

      const goalTemplates = templates[agentForm.goal as keyof typeof templates] || templates.Awareness;
      const caption = goalTemplates[Math.floor(Math.random() * goalTemplates.length)];
      const hashtags = hashtagSets[agentForm.goal as keyof typeof hashtagSets] || hashtagSets.Awareness;

      setGeneratedContent({ caption, hashtags });
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveGeneratedContent = () => {
    if (!generatedContent) return;

    const post: SocialPost = {
      id: Date.now().toString(),
      platform: 'Instagram', // Default platform
      caption: generatedContent.caption + '\n\n' + generatedContent.hashtags.join(' '),
      status: 'draft',
      createdBy: user.name,
      createdAt: new Date(),
      pillar: agentForm.goal,
      postType: agentForm.postType,
      goal: agentForm.goal
    };

    setPosts(prev => [post, ...prev]);
    setGeneratedContent(null);
    setAgentForm({ postType: '', goal: '', tone: '', prompt: '' });

    if (onAddActivity) {
      onAddActivity('Generate Content', 'Social Media', `Generated ${agentForm.postType} via AI Agent`);
    }
  };

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
      createdAt: new Date(),
      pillar: newPost.pillar,
      postType: newPost.postType,
      goal: newPost.goal
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ platform: '', caption: '', imageUrl: '', status: 'draft', scheduledDate: '', pillar: '', postType: '', goal: '' });
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

  // Upload image to imgBB (free image hosting)
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    // Using imgBB's free API (no key required for basic usage)
    // For production, get a free API key at https://api.imgbb.com/
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY || ''; // Optional
    const url = apiKey
      ? `https://api.imgbb.com/1/upload?key=${apiKey}`
      : `https://api.imgbb.com/1/upload`;

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      return data.data.url; // Returns the direct image URL
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle file drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    // Validate file size (max 32MB for imgBB)
    if (file.size > 32 * 1024 * 1024) {
      alert('File size must be less than 32MB');
      return;
    }

    setUploadedFile(file);

    // Auto-detect dimensions
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        setUploadForm(prev => ({
          ...prev,
          dimensions: `${img.width}x${img.height}`,
          name: prev.name || file.name.replace(/\.[^/.]+$/, '') // Use filename as default name
        }));
      };
    };
    reader.readAsDataURL(file);

    // Upload the image immediately
    try {
      const imageUrl = await uploadImageToImgBB(file);
      setUploadForm(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      setUploadedFile(null);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleUploadTemplate = async () => {
    if (!uploadForm.name || !uploadForm.imageUrl || !currentProject) return;

    const templateData = {
      name: uploadForm.name,
      category: uploadForm.category,
      imageUrl: uploadForm.imageUrl,
      uploadedBy: user.name,
      dimensions: uploadForm.dimensions || undefined,
      tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : undefined
    };

    try {
      // Save to Airtable
      const airtableId = await GraphicTemplateService.saveTemplate(templateData, currentProject.id);

      // Add to local state with Airtable ID
      const template: GraphicTemplate = {
        id: airtableId,
        ...templateData,
        uploadedAt: new Date()
      };

      setGraphicTemplates(prev => [template, ...prev]);

      // Reset form and file state
      setUploadForm({ name: '', category: 'Social Posts', imageUrl: '', dimensions: '', tags: '' });
      setUploadedFile(null);
      setIsUploadDialogOpen(false);

      if (onAddActivity) {
        onAddActivity('Upload Template', 'Social Media', `Uploaded ${uploadForm.name} to Airtable`);
      }

      // Trigger a refresh to ensure 2-way sync
      setTimeout(() => loadTemplatesFromAirtable(), 1000);
    } catch (error) {
      console.error('Error uploading template to Airtable:', error);
      alert('Failed to upload template to Airtable. Please check your API configuration.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = graphicTemplates.find(t => t.id === id);

    try {
      // Delete from Airtable
      await GraphicTemplateService.deleteTemplate(id);

      // Remove from local state
      setGraphicTemplates(prev => prev.filter(t => t.id !== id));

      if (onAddActivity && template) {
        onAddActivity('Delete Template', 'Social Media', `Deleted ${template.name} from Airtable`);
      }
    } catch (error) {
      console.error('Error deleting template from Airtable:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const filteredTemplates = selectedCategory === 'All'
    ? graphicTemplates
    : graphicTemplates.filter(t => t.category === selectedCategory);

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
      {/* 1. HERO BANNER / QUICK OVERVIEW */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Social Media Command Center</h1>
            </div>
            <p className="text-primary-foreground/90 text-lg leading-relaxed max-w-2xl">
              Plan, generate, and manage content for {currentProject?.name || 'your organization'}. Access templates, strategy, and tools in one place.
            </p>
          </div>
          {canEdit && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-white text-primary hover:bg-white/90 shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Create Post
            </Button>
          )}
        </div>

        {/* KPI Snapshot Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <TrendingUp className="w-8 h-8" />
            <div>
              <div className="text-sm text-primary-foreground/80">Last 30 Days</div>
              <div className="text-2xl font-bold">Engagement Rate</div>
              <div className="text-xl font-semibold">{kpiData.engagementRate}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Heart className="w-8 h-8" />
            <div>
              <div className="text-sm text-primary-foreground/80">Top Performing</div>
              <div className="text-2xl font-bold">Post Type</div>
              <div className="text-xl font-semibold">{kpiData.topPostType}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <Users className="w-8 h-8" />
            <div>
              <div className="text-sm text-primary-foreground/80">Last 30 Days</div>
              <div className="text-2xl font-bold">Follower Growth</div>
              <div className="text-xl font-semibold">{kpiData.followerGrowth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STRATEGY & PILLARS SECTION */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Content Strategy & Pillars</CardTitle>
                <CardDescription>Brand voice and posting priorities at a glance</CardDescription>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              View Full Strategy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contentPillars.map((pillar) => {
              const Icon = pillar.icon;
              const difference = pillar.actual - pillar.recommended;
              const isOnTarget = Math.abs(difference) <= 5;

              return (
                <div key={pillar.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${pillar.color} rounded-lg flex items-center justify-center text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{pillar.name}</div>
                        <div className="text-sm text-foreground/70">
                          Goal: {pillar.recommended}% • Actual: {pillar.actual}%
                          {isOnTarget ? (
                            <span className="text-green-600 ml-2">✓ On target</span>
                          ) : difference > 0 ? (
                            <span className="text-orange-600 ml-2">↑ {Math.abs(difference)}% over</span>
                          ) : (
                            <span className="text-blue-600 ml-2">↓ {Math.abs(difference)}% under</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={isOnTarget ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {isOnTarget ? 'Balanced' : 'Adjust'}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="flex gap-2 items-center">
                      {/* Recommended marker */}
                      <div className="flex-1 relative">
                        <Progress value={pillar.actual} className="h-3" />
                        <div
                          className="absolute top-0 h-3 w-1 bg-gray-800 rounded"
                          style={{ left: `${pillar.recommended}%` }}
                          title={`Target: ${pillar.recommended}%`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-12 text-right">{pillar.actual}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. CONTENT GENERATION AGENT */}
      <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground text-xl">Social Media Agent – Generate Content</CardTitle>
              <CardDescription>AI-powered content creation aligned with your brand strategy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-post-type" className="text-foreground font-medium">Post Type</Label>
                <Select value={agentForm.postType} onValueChange={(value) => setAgentForm(prev => ({ ...prev, postType: value }))}>
                  <SelectTrigger id="agent-post-type" className="mt-1">
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'Reel' && <Video className="w-4 h-4 inline mr-2" />}
                        {type === 'Carousel' && <Layout className="w-4 h-4 inline mr-2" />}
                        {type === 'Static Post' && <ImageIconSolid className="w-4 h-4 inline mr-2" />}
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agent-goal" className="text-foreground font-medium">Goal</Label>
                <Select value={agentForm.goal} onValueChange={(value) => setAgentForm(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger id="agent-goal" className="mt-1">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map(goal => (
                      <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agent-tone" className="text-foreground font-medium">Tone</Label>
                <Select value={agentForm.tone} onValueChange={(value) => setAgentForm(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger id="agent-tone" className="mt-1">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(tone => (
                      <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agent-prompt" className="text-foreground font-medium">Idea Prompt</Label>
                <Textarea
                  id="agent-prompt"
                  value={agentForm.prompt}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Describe your content idea... (e.g., 'our new cardiology department' or 'tips for heart health')"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={!agentForm.postType || !agentForm.goal || !agentForm.prompt || isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>

            {/* Output Preview */}
            <div className="bg-background border border-accent/20 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Preview
              </h4>
              {generatedContent ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-foreground/70">Caption</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-foreground whitespace-pre-wrap">{generatedContent.caption}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground/70">Hashtags</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, idx) => (
                        <Badge key={idx} className="bg-primary/10 text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveGeneratedContent}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save to Content Library
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/50">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Fill out the form and click "Generate Content" to see AI-powered suggestions</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. TEMPLATES HUB */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Layout className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-foreground">Templates Library</CardTitle>
              <CardDescription>Ready-to-use templates for every post type</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { type: 'Reels Templates', icon: Video, color: 'from-red-500 to-pink-500', link: '#' },
              { type: 'Carousel Templates', icon: Layout, color: 'from-blue-500 to-cyan-500', link: '#' },
              { type: 'Story Templates', icon: ImageIconSolid, color: 'from-purple-500 to-indigo-500', link: '#' },
              { type: 'Graphic Templates', icon: Palette, color: 'from-green-500 to-emerald-500', link: '#' },
              { type: 'Ad Templates', icon: Target, color: 'from-orange-500 to-amber-500', link: '#' }
            ].map((template, idx) => {
              const Icon = template.icon;
              return (
                <button
                  key={idx}
                  onClick={() => window.open(template.link, '_blank')}
                  className={`p-6 rounded-xl bg-gradient-to-br ${template.color} text-white hover:scale-105 transition-transform shadow-lg group`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold text-center">{template.type}</h4>
                  <ExternalLink className="w-4 h-4 mx-auto mt-2 opacity-70" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* GRAPHIC TEMPLATES GALLERY */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <ImageIconSolid className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Graphic Templates Gallery</CardTitle>
                <CardDescription>Your collection of {graphicTemplates.length} brand-aligned social media graphics</CardDescription>
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Upload Template
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-accent/20">
            {TEMPLATE_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-primary text-primary-foreground' : ''}
              >
                {category}
                {category !== 'All' && (
                  <Badge variant="secondary" className="ml-2 bg-white/20">
                    {graphicTemplates.filter(t => t.category === category).length}
                  </Badge>
                )}
                {category === 'All' && (
                  <Badge variant="secondary" className="ml-2 bg-white/20">
                    {graphicTemplates.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-accent/20 rounded-lg">
              <ImageIconSolid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-6">
                {selectedCategory === 'All'
                  ? 'Upload your first graphic template to get started'
                  : `No templates in the "${selectedCategory}" category`}
              </p>
              {canEdit && selectedCategory === 'All' && (
                <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Your First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative bg-gray-50 rounded-lg overflow-hidden border border-accent/20 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Template Image */}
                  <div
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {template.imageUrl ? (
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <ImageIconSolid className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-foreground truncate mb-1">
                      {template.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-foreground/60">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      {template.dimensions && (
                        <span>{template.dimensions}</span>
                      )}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(template.imageUrl, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 shadow-md text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. CONTENT CALENDAR / LIBRARY */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Content Calendar & Library ({posts.length})</CardTitle>
                <CardDescription>Upcoming posts and content history</CardDescription>
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Post
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts in your calendar yet</h3>
              <p className="text-gray-500 mb-6">Create your first post or use the AI Agent to generate content</p>
              {canEdit && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
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

      {/* 6. QUICK LINKS / RESOURCES */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-foreground">Quick Links & Resources</CardTitle>
              <CardDescription>Navigate to key sections and external tools</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => window.location.href = '#branding'}
            >
              <Palette className="w-6 h-6 text-primary" />
              <span className="font-medium text-sm">Brand Assets</span>
              <span className="text-xs text-foreground/60">Logos, Colors, Fonts</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => window.location.href = '#knowledge'}
            >
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-medium text-sm">Knowledge Hub</span>
              <span className="text-xs text-foreground/60">Guidelines & Docs</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => window.location.href = '#insights'}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="font-medium text-sm">Analytics</span>
              <span className="text-xs text-foreground/60">Insights Dashboard</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => window.open('https://drive.google.com', '_blank')}
            >
              <Download className="w-6 h-6 text-primary" />
              <span className="font-medium text-sm">Asset Library</span>
              <span className="text-xs text-foreground/60">Google Drive</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 7. SOCIAL MEDIA ACCOUNTS */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-foreground">Social Media Accounts</CardTitle>
              <CardDescription>Direct access to {currentProject?.name || 'your'} social platforms</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => window.open(currentProject?.id === 'tgmc' ? 'https://facebook.com/texasgeneral' : 'https://facebook.com', '_blank')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">f</span>
              </div>
              <span className="text-sm font-medium">Facebook</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-pink-50 hover:border-pink-300 transition-all"
              onClick={() => window.open(currentProject?.id === 'tgmc' ? 'https://instagram.com/texasgeneral' : 'https://instagram.com', '_blank')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">📷</span>
              </div>
              <span className="text-sm font-medium">Instagram</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
              onClick={() => window.open(currentProject?.id === 'tgmc' ? 'https://linkedin.com/company/texasgeneral' : 'https://linkedin.com', '_blank')}
            >
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">in</span>
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-all"
              onClick={() => window.open('https://business.google.com', '_blank')}
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-sm font-medium">Google Business</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pillar">Content Pillar</Label>
                <Select value={newPost.pillar} onValueChange={(value) => setNewPost(prev => ({ ...prev, pillar: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentPillars.map(pillar => (
                      <SelectItem key={pillar.id} value={pillar.name}>{pillar.name}</SelectItem>
                    ))}
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
                    {POST_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={!newPost.platform || !newPost.caption}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Template Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Graphic Template</DialogTitle>
            <DialogDescription>
              Drag & drop your template or fill in the details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-foreground">Uploading to cloud...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60">{uploadProgress}%</p>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                  <p className="font-semibold text-green-700">File uploaded successfully!</p>
                  <p className="text-sm text-foreground/70">{uploadedFile.name}</p>
                  {uploadForm.imageUrl && (
                    <img
                      src={uploadForm.imageUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded border border-gray-200"
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setUploadForm(prev => ({ ...prev, imageUrl: '', dimensions: '' }));
                    }}
                  >
                    Upload Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Download className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">Drop your image here</p>
                    <p className="text-sm text-foreground/60">or click to browse</p>
                  </div>
                  <p className="text-xs text-foreground/50">
                    Supports: PNG, JPG, GIF, WebP • Max 32MB
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Health Tip Square Post"
              />
            </div>

            <div>
              <Label htmlFor="template-category">Category *</Label>
              <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.filter(c => c !== 'All').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="template-dimensions">Dimensions {uploadForm.dimensions && '(Auto-detected)'}</Label>
                <Input
                  id="template-dimensions"
                  value={uploadForm.dimensions}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="1080x1080"
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="template-tags">Tags (optional)</Label>
                <Input
                  id="template-tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="health, wellness, blue"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setUploadedFile(null);
                  setUploadForm({ name: '', category: 'Social Posts', imageUrl: '', dimensions: '', tags: '' });
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadTemplate}
                disabled={!uploadForm.name || !uploadForm.imageUrl || isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save to Airtable
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Uploaded by {selectedTemplate.uploadedBy} • {selectedTemplate.uploadedAt.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <img
                  src={selectedTemplate.imageUrl}
                  alt={selectedTemplate.name}
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-foreground/70">Category</Label>
                  <p className="font-medium">{selectedTemplate.category}</p>
                </div>
                {selectedTemplate.dimensions && (
                  <div>
                    <Label className="text-foreground/70">Dimensions</Label>
                    <p className="font-medium">{selectedTemplate.dimensions}</p>
                  </div>
                )}
              </div>

              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <Label className="text-foreground/70">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
                <Button onClick={() => window.open(selectedTemplate.imageUrl, '_blank')} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
