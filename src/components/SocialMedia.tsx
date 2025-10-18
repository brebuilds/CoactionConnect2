import React, { useState, useEffect, useRef, useCallback } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { GraphicTemplateService, ContentBankService } from "../airtable/services";
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
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Link as LinkIcon,
  Type,
  Move,
  RotateCcw,
  Save,
  Eye,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight
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

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  maxWidth?: number;
  maxHeight?: number;
}

interface TemplateEditor {
  isOpen: boolean;
  template: GraphicTemplate | null;
  textOverlays: TextOverlay[];
  selectedOverlay: string | null;
  canvasSize: { width: number; height: number };
}

interface ContentItem {
  id: string;
  title: string;
  text: string;
  category: string;
  tags: string[];
  type: 'caption' | 'post' | 'hashtag' | 'quote';
  platform: string;
  tone: string;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
}

interface ContentBank {
  isOpen: boolean;
  selectedContent: ContentItem | null;
  filters: {
    category: string;
    type: string;
    platform: string;
  };
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  lastSync?: Date;
}

interface SocialConnections {
  isOpen: boolean;
  accounts: SocialAccount[];
  isConnecting: boolean;
}

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'];
const POST_TYPES = ['Reel', 'Carousel', 'Static Post', 'Story', 'Ad'];
const GOALS = ['Engagement', 'Sales', 'Awareness', 'Testimonials', 'Education'];
const TONES = ['Playful', 'Professional', 'Bold', 'Minimal', 'Compassionate', 'Inspiring'];
const TEMPLATE_CATEGORIES = ['All', 'Social Posts', 'Stories', 'Quotes', 'Announcements', 'Testimonials', 'Events', 'Health Tips', 'Promotions'];

// Font options for text overlay
const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS', 'Courier New'
];

const FONT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
];

// Content Bank constants
const CONTENT_TYPES = ['caption', 'post', 'hashtag', 'quote'];
const CONTENT_CATEGORIES = ['Health Tips', 'Announcements', 'Testimonials', 'Educational', 'Promotional', 'Community', 'Events', 'General'];
const CONTENT_TONES = ['Professional', 'Friendly', 'Inspiring', 'Educational', 'Promotional', 'Casual'];

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

  // Template Editor state
  const [templateEditor, setTemplateEditor] = useState<TemplateEditor>({
    isOpen: false,
    template: null,
    textOverlays: [],
    selectedOverlay: null,
    canvasSize: { width: 800, height: 800 }
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Content Bank state
  const [contentBank, setContentBank] = useState<ContentBank>({
    isOpen: false,
    selectedContent: null,
    filters: { category: '', type: '', platform: '' }
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isContentBankLoading, setIsContentBankLoading] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    text: '',
    category: '',
    type: 'caption' as const,
    platform: '',
    tone: '',
    tags: ''
  });
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);

  // Social Media Connections state
  const [socialConnections, setSocialConnections] = useState<SocialConnections>({
    isOpen: false,
    accounts: [
      { id: 'facebook', platform: 'Facebook', username: 'Not Connected', isConnected: false },
      { id: 'instagram', platform: 'Instagram', username: 'Not Connected', isConnected: false },
      { id: 'twitter', platform: 'Twitter', username: 'Not Connected', isConnected: false },
      { id: 'linkedin', platform: 'LinkedIn', username: 'Not Connected', isConnected: false }
    ],
    isConnecting: false
  });

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

      // Load content bank
      loadContentBank();

      // Set up polling for 2-way sync (check for updates every 30 seconds)
      const syncInterval = setInterval(() => {
        loadTemplatesFromAirtable();
        loadContentBank();
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

  // Load content bank from Airtable
  const loadContentBank = async () => {
    if (!currentProject) return;

    setIsContentBankLoading(true);
    try {
      const content = await ContentBankService.getContent(currentProject.id, contentBank.filters);
      setContentItems(content);
    } catch (error) {
      console.error('Error loading content bank from Airtable:', error);
      // Fallback to localStorage
      const savedContent = localStorage.getItem(`content-bank-${currentProject.id}`);
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setContentItems(parsedContent);
      }
    } finally {
      setIsContentBankLoading(false);
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

  // AI-powered caption optimization for different platforms
  const optimizeCaptionForPlatform = (caption: string, platform: string): string => {
    const optimizations = {
      'Instagram': {
        maxLength: 2200,
        hashtagCount: 30,
        emojiUsage: 'high',
        lineBreaks: true
      },
      'Facebook': {
        maxLength: 63206,
        hashtagCount: 5,
        emojiUsage: 'medium',
        lineBreaks: true
      },
      'Twitter': {
        maxLength: 280,
        hashtagCount: 3,
        emojiUsage: 'low',
        lineBreaks: false
      },
      'LinkedIn': {
        maxLength: 3000,
        hashtagCount: 5,
        emojiUsage: 'low',
        lineBreaks: true
      },
      'TikTok': {
        maxLength: 300,
        hashtagCount: 5,
        emojiUsage: 'high',
        lineBreaks: false
      },
      'YouTube': {
        maxLength: 5000,
        hashtagCount: 15,
        emojiUsage: 'medium',
        lineBreaks: true
      }
    };

    const config = optimizations[platform as keyof typeof optimizations] || optimizations.Instagram;
    let optimizedCaption = caption;

    // Truncate if too long
    if (optimizedCaption.length > config.maxLength) {
      optimizedCaption = optimizedCaption.substring(0, config.maxLength - 3) + '...';
    }

    // Add platform-specific optimizations
    if (platform === 'Instagram' && !optimizedCaption.includes('#')) {
      optimizedCaption += '\n\n#healthcare #wellness #community';
    }

    if (platform === 'Twitter' && optimizedCaption.length > 200) {
      optimizedCaption = optimizedCaption.substring(0, 200) + '...';
    }

    return optimizedCaption;
  };

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

  const handlePublishPost = async (post: SocialPost) => {
    try {
      // Simulate posting to social media platforms
      const results = await Promise.allSettled(
        [post.platform].map(async (platform: string) => {
          // In a real app, this would call the actual social media APIs
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          // Simulate success/failure
          const success = Math.random() > 0.1; // 90% success rate
          
          if (success) {
            return { platform, status: 'success', message: `Posted to ${platform}` };
          } else {
            throw new Error(`Failed to post to ${platform}`);
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        // Update post status
        setPosts(prev => prev.map(p => 
          p.id === post.id 
            ? { ...p, status: 'published' as const, publishedDate: new Date() }
            : p
        ));

        if (onAddActivity) {
          onAddActivity('Publish Post', 'Social Media', `Published ${post.platform} post`);
        }

        alert(`Successfully posted to ${successful} platform(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      } else {
        alert('Failed to post to any platforms. Please check your API connections.');
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish post. Please try again.');
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

  // Canvas drawing functions
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateEditor.template) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw text overlays
      templateEditor.textOverlays.forEach(overlay => {
        drawTextOverlay(ctx, overlay);
      });
    };
    img.src = templateEditor.template.imageUrl;
  }, [templateEditor.template, templateEditor.textOverlays]);

  const drawTextOverlay = (ctx: CanvasRenderingContext2D, overlay: TextOverlay) => {
    ctx.save();
    
    // Set text properties
    ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
    ctx.fillStyle = overlay.color;
    ctx.textAlign = overlay.textAlign;
    ctx.textBaseline = 'top';
    
    // Draw text
    const lines = overlay.text.split('\n');
    let y = overlay.y;
    
    lines.forEach(line => {
      ctx.fillText(line, overlay.x, y);
      y += overlay.fontSize * 1.2; // Line height
    });
    
    // Draw selection border if selected
    if (templateEditor.selectedOverlay === overlay.id) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(overlay.x - 5, overlay.y - 5, overlay.maxWidth || 200, overlay.maxHeight || overlay.fontSize * 1.5);
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  };

  // Template editor functions
  const openTemplateEditor = (template: GraphicTemplate) => {
    setTemplateEditor({
      isOpen: true,
      template,
      textOverlays: [],
      selectedOverlay: null,
      canvasSize: { width: 800, height: 800 }
    });
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'Your text here',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      maxWidth: 200,
      maxHeight: 100
    };

    setTemplateEditor(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newOverlay],
      selectedOverlay: newOverlay.id
    }));
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTemplateEditor(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    }));
  };

  const deleteTextOverlay = (id: string) => {
    setTemplateEditor(prev => ({
      ...prev,
      textOverlays: prev.textOverlays.filter(overlay => overlay.id !== id),
      selectedOverlay: prev.selectedOverlay === id ? null : prev.selectedOverlay
    }));
  };

  const selectTextOverlay = (id: string) => {
    setTemplateEditor(prev => ({
      ...prev,
      selectedOverlay: id
    }));
  };

  // Canvas mouse events
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!templateEditor.selectedOverlay) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragOffset({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !templateEditor.selectedOverlay) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragOffset.x;
    const deltaY = y - dragOffset.y;

    const selectedOverlay = templateEditor.textOverlays.find(o => o.id === templateEditor.selectedOverlay);
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, {
        x: Math.max(0, Math.min(canvas.width - (selectedOverlay.maxWidth || 200), selectedOverlay.x + deltaX)),
        y: Math.max(0, Math.min(canvas.height - (selectedOverlay.maxHeight || 100), selectedOverlay.y + deltaY))
      });
    }

    setDragOffset({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked overlay
    const clickedOverlay = templateEditor.textOverlays.find(overlay => {
      return x >= overlay.x && x <= overlay.x + (overlay.maxWidth || 200) &&
             y >= overlay.y && y <= overlay.y + (overlay.maxHeight || 100);
    });

    if (clickedOverlay) {
      selectTextOverlay(clickedOverlay.id);
    } else {
      selectTextOverlay('');
    }
  };

  // Export generated image
  const exportGeneratedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `generated-${templateEditor.template?.name || 'template'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Redraw canvas when overlays change
  useEffect(() => {
    if (templateEditor.isOpen) {
      drawCanvas();
    }
  }, [templateEditor.textOverlays, templateEditor.selectedOverlay, drawCanvas]);

  // Content Bank functions
  const openContentBank = () => {
    setContentBank(prev => ({ ...prev, isOpen: true }));
    loadContentBank();
  };

  const selectContent = (content: ContentItem) => {
    setContentBank(prev => ({ ...prev, selectedContent: content }));
  };

  const useContentInPost = (content: ContentItem) => {
    // Update the new post form with selected content
    setNewPost(prev => ({
      ...prev,
      caption: content.text,
      platform: content.platform || prev.platform
    }));
    
    // Update usage count in Airtable
    ContentBankService.updateUsage(content.id);
    
    // Close content bank
    setContentBank(prev => ({ ...prev, isOpen: false, selectedContent: null }));
    
    // Open create post dialog
    setIsCreateDialogOpen(true);
  };

  const addContentToBank = async () => {
    if (!newContent.title || !newContent.text || !currentProject) return;

    const contentData = {
      title: newContent.title,
      text: newContent.text,
      category: newContent.category,
      type: newContent.type,
      platform: newContent.platform,
      tone: newContent.tone,
      tags: newContent.tags ? newContent.tags.split(',').map(t => t.trim()) : [],
      createdBy: user.name
    };

    try {
      const contentId = await ContentBankService.saveContent(contentData, currentProject.id);
      
      // Add to local state
      const newContentItem: ContentItem = {
        id: contentId,
        ...contentData,
        usageCount: 0,
        createdAt: new Date()
      };
      
      setContentItems(prev => [newContentItem, ...prev]);
      setNewContent({ title: '', text: '', category: '', type: 'caption', platform: '', tone: '', tags: '' });
      setIsAddContentDialogOpen(false);

      if (onAddActivity) {
        onAddActivity('Add Content', 'Content Bank', `Added "${newContent.title}" to content bank`);
      }
    } catch (error) {
      console.error('Error adding content to bank:', error);
      alert('Failed to add content. Please try again.');
    }
  };

  const filterContent = (filters: { category?: string; type?: string; platform?: string }) => {
    setContentBank(prev => ({ ...prev, filters }));
    loadContentBank();
  };

  // Social Media Connection functions
  const openSocialConnections = () => {
    setSocialConnections(prev => ({ ...prev, isOpen: true }));
  };

  const connectSocialAccount = async (platform: string) => {
    setSocialConnections(prev => ({ ...prev, isConnecting: true }));
    
    // Simulate OAuth connection (in production, this would use actual OAuth flows)
    setTimeout(() => {
      setSocialConnections(prev => ({
        ...prev,
        accounts: prev.accounts.map(account => 
          account.platform === platform 
            ? { ...account, isConnected: true, username: `@${platform.toLowerCase()}user`, lastSync: new Date() }
            : account
        ),
        isConnecting: false
      }));
    }, 2000);
  };

  const disconnectSocialAccount = (platform: string) => {
    setSocialConnections(prev => ({
      ...prev,
      accounts: prev.accounts.map(account => 
        account.platform === platform 
          ? { ...account, isConnected: false, username: 'Not Connected', lastSync: undefined }
          : account
      )
    }));
  };

  // Enhanced post creation with AI optimization
  const handleCreatePostWithOptimization = () => {
    if (!newPost.platform || !newPost.caption) return;

    // Optimize caption for the selected platform
    const optimizedCaption = optimizeCaptionForPlatform(newPost.caption, newPost.platform);

    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform,
      caption: optimizedCaption,
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
      onAddActivity('Create Post', 'Social Media', `Created optimized ${newPost.platform} post`);
    }
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
            <div className="flex gap-3">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-white text-primary hover:bg-white/90 shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Create Post
              </Button>
              <Button
                onClick={openContentBank}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Content Bank
              </Button>
            </div>
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

      {/* CONTENT BANK SECTION */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Content Bank</CardTitle>
                <CardDescription>Pre-written captions, posts, and content for quick use</CardDescription>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button onClick={() => setIsAddContentDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Content
                </Button>
                <Button onClick={openContentBank} variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Browse All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contentItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No content in your bank yet</h3>
              <p className="text-gray-500 mb-6">Add pre-written captions, posts, and content for quick access</p>
              {canEdit && (
                <Button onClick={() => setIsAddContentDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Content
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentItems.slice(0, 6).map((content) => (
                <div
                  key={content.id}
                  className="p-4 border border-accent/20 rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => selectContent(content)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">{content.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {content.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/70 mb-3 line-clamp-3">{content.text}</p>
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span>{content.category}</span>
                    <span>Used {content.usageCount} times</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {contentItems.length > 6 && (
            <div className="text-center mt-6">
              <Button onClick={openContentBank} variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                View All {contentItems.length} Content Items
              </Button>
            </div>
          )}
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
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-blue-50 shadow-md text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTemplateEditor(template);
                      }}
                      title="Edit with Text"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(template.imageUrl, '_blank');
                      }}
                      title="Download"
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
                        title="Delete"
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
                          {post.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePublishPost(post)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Publish
                            </Button>
                          )}
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

      {/* 7. SOCIAL MEDIA CONNECTIONS */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Social Media Connections</CardTitle>
                <CardDescription>Connect your social accounts for automated posting</CardDescription>
              </div>
            </div>
            <Button onClick={openSocialConnections} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Manage Connections
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {socialConnections.accounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg text-center transition-all ${
                  account.isConnected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white text-xl font-bold"
                     style={{
                       backgroundColor: account.platform === 'Facebook' ? '#1877F2' :
                                       account.platform === 'Instagram' ? '#E4405F' :
                                       account.platform === 'Twitter' ? '#1DA1F2' :
                                       account.platform === 'LinkedIn' ? '#0077B5' : '#6B7280'
                     }}>
                  {account.platform.charAt(0)}
                </div>
                <h4 className="font-semibold text-sm mb-1">{account.platform}</h4>
                <p className="text-xs text-gray-600 mb-2">{account.username}</p>
                <Badge variant={account.isConnected ? 'default' : 'secondary'} className="text-xs">
                  {account.isConnected ? 'Connected' : 'Not Connected'}
                </Badge>
                {account.lastSync && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last sync: {account.lastSync.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 8. SOCIAL MEDIA ACCOUNTS */}
      <Card className="border-accent/20 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-foreground">Quick Access to Social Platforms</CardTitle>
              <CardDescription>Direct links to your social media accounts</CardDescription>
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="caption">Caption</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openContentBank}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Use Content Bank
                </Button>
              </div>
              <Textarea
                id="caption"
                value={newPost.caption}
                onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Write your post caption or select from content bank..."
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
              <Button onClick={handleCreatePostWithOptimization} disabled={!newPost.platform || !newPost.caption}>
                <Plus className="w-4 h-4 mr-2" />
                Create Optimized Post
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

      {/* Content Bank Dialog */}
      <Dialog open={contentBank.isOpen} onOpenChange={(open) => setContentBank(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Bank - {contentItems.length} Items
            </DialogTitle>
            <DialogDescription>
              Browse and select from your pre-written content library
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-[70vh]">
            {/* Filters */}
            <div className="flex gap-4 mb-6 pb-4 border-b border-accent/20">
              <div className="flex-1">
                <Label>Category</Label>
                <Select 
                  value={contentBank.filters.category} 
                  onValueChange={(value) => filterContent({ ...contentBank.filters, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CONTENT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label>Content Type</Label>
                <Select 
                  value={contentBank.filters.type} 
                  onValueChange={(value) => filterContent({ ...contentBank.filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label>Platform</Label>
                <Select 
                  value={contentBank.filters.platform} 
                  onValueChange={(value) => filterContent({ ...contentBank.filters, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Platforms</SelectItem>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto">
              {isContentBankLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No content found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or add new content</p>
                  {canEdit && (
                    <Button onClick={() => setIsAddContentDialogOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Content
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {contentItems.map((content) => (
                    <div
                      key={content.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        contentBank.selectedContent?.id === content.id
                          ? 'border-primary bg-primary/5'
                          : 'border-accent/20 hover:border-primary/50 hover:shadow-md'
                      }`}
                      onClick={() => selectContent(content)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{content.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{content.type}</Badge>
                            <Badge variant="outline" className="text-xs">{content.category}</Badge>
                            {content.platform && (
                              <Badge variant="outline" className="text-xs">{content.platform}</Badge>
                            )}
                            {content.tone && (
                              <Badge variant="outline" className="text-xs">{content.tone}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-foreground/60">
                          <div>Used {content.usageCount} times</div>
                          <div>{content.createdAt.toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <p className="text-foreground/70 mb-3 whitespace-pre-wrap">{content.text}</p>
                      
                      {content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {content.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">#{tag}</Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/60">By {content.createdBy}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              useContentInPost(content);
                            }}
                          >
                            Use in Post
                          </Button>
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add edit functionality
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog open={isAddContentDialogOpen} onOpenChange={setIsAddContentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Content to Bank</DialogTitle>
            <DialogDescription>
              Add pre-written content for quick access when creating posts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-title">Content Title *</Label>
              <Input
                id="content-title"
                value={newContent.title}
                onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Health Tip - Heart Health"
              />
            </div>

            <div>
              <Label htmlFor="content-text">Content Text *</Label>
              <Textarea
                id="content-text"
                value={newContent.text}
                onChange={(e) => setNewContent(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your content here..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="content-category">Category</Label>
                <Select 
                  value={newContent.category} 
                  onValueChange={(value) => setNewContent(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="content-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select 
                  value={newContent.type} 
                  onValueChange={(value: any) => setNewContent(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="content-platform">Platform</Label>
                <Select 
                  value={newContent.platform} 
                  onValueChange={(value) => setNewContent(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger id="content-platform">
                    <SelectValue placeholder="Any platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Platform</SelectItem>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-tone">Tone</Label>
                <Select 
                  value={newContent.tone} 
                  onValueChange={(value) => setNewContent(prev => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger id="content-tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TONES.map(tone => (
                      <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content-tags">Tags (comma-separated)</Label>
              <Input
                id="content-tags"
                value={newContent.tags}
                onChange={(e) => setNewContent(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="health, wellness, tips"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddContentDialogOpen(false);
                  setNewContent({ title: '', text: '', category: '', type: 'caption', platform: '', tone: '', tags: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={addContentToBank} 
                disabled={!newContent.title || !newContent.text}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Bank
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={templateEditor.isOpen} onOpenChange={(open) => setTemplateEditor(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Template Editor - {templateEditor.template?.name}
            </DialogTitle>
            <DialogDescription>
              Add and customize text overlays on your template. Click and drag to position text elements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-6 h-[70vh]">
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={templateEditor.canvasSize.width}
                  height={templateEditor.canvasSize.height}
                  className="max-w-full max-h-full border border-gray-300 rounded cursor-move"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onClick={handleCanvasClick}
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={addTextOverlay} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Text
                </Button>
                <Button onClick={exportGeneratedImage} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Image
                </Button>
                <Button 
                  onClick={() => setTemplateEditor(prev => ({ ...prev, isOpen: false }))} 
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Text Properties Panel */}
            <div className="w-80 border-l border-gray-200 pl-6">
              <Tabs defaultValue="text" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="overlays">Overlays</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4 mt-4">
                  {templateEditor.selectedOverlay && (() => {
                    const selectedOverlay = templateEditor.textOverlays.find(o => o.id === templateEditor.selectedOverlay);
                    if (!selectedOverlay) return null;
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label>Text Content</Label>
                          <Textarea
                            value={selectedOverlay.text}
                            onChange={(e) => updateTextOverlay(selectedOverlay.id, { text: e.target.value })}
                            rows={3}
                            placeholder="Enter your text..."
                          />
                        </div>
                        
                        <div>
                          <Label>Font Size</Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[selectedOverlay.fontSize]}
                              onValueChange={([value]) => updateTextOverlay(selectedOverlay.id, { fontSize: value })}
                              min={12}
                              max={72}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500 w-8">{selectedOverlay.fontSize}px</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Font Family</Label>
                          <Select 
                            value={selectedOverlay.fontFamily} 
                            onValueChange={(value) => updateTextOverlay(selectedOverlay.id, { fontFamily: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FONT_FAMILIES.map(font => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                  {font}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Text Color</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {FONT_COLORS.map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded border-2 ${
                                  selectedOverlay.color === color ? 'border-blue-500' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => updateTextOverlay(selectedOverlay.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant={selectedOverlay.fontWeight === 'bold' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateTextOverlay(selectedOverlay.id, { 
                              fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold' 
                            })}
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={selectedOverlay.fontStyle === 'italic' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateTextOverlay(selectedOverlay.id, { 
                              fontStyle: selectedOverlay.fontStyle === 'italic' ? 'normal' : 'italic' 
                            })}
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div>
                          <Label>Text Alignment</Label>
                          <div className="flex gap-1">
                            <Button
                              variant={selectedOverlay.textAlign === 'left' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextOverlay(selectedOverlay.id, { textAlign: 'left' })}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={selectedOverlay.textAlign === 'center' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextOverlay(selectedOverlay.id, { textAlign: 'center' })}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={selectedOverlay.textAlign === 'right' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateTextOverlay(selectedOverlay.id, { textAlign: 'right' })}
                            >
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTextOverlay(selectedOverlay.id)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Text
                        </Button>
                      </div>
                    );
                  })()}
                  
                  {!templateEditor.selectedOverlay && (
                    <div className="text-center py-8 text-gray-500">
                      <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a text overlay to edit its properties</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="overlays" className="space-y-2 mt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {templateEditor.textOverlays.map((overlay, index) => (
                      <div
                        key={overlay.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          templateEditor.selectedOverlay === overlay.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => selectTextOverlay(overlay.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Text {index + 1}</p>
                            <p className="text-xs text-gray-500 truncate">{overlay.text}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTextOverlay(overlay.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {templateEditor.textOverlays.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No text overlays yet</p>
                        <p className="text-sm">Click "Add Text" to get started</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Connections Dialog */}
      <Dialog open={socialConnections.isOpen} onOpenChange={(open) => setSocialConnections(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Social Media Connections
            </DialogTitle>
            <DialogDescription>
              Connect your social media accounts to enable automated posting and scheduling
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {socialConnections.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor: account.platform === 'Facebook' ? '#1877F2' :
                                      account.platform === 'Instagram' ? '#E4405F' :
                                      account.platform === 'Twitter' ? '#1DA1F2' :
                                      account.platform === 'LinkedIn' ? '#0077B5' : '#6B7280'
                    }}
                  >
                    {account.platform.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{account.platform}</h4>
                    <p className="text-sm text-gray-600">{account.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={account.isConnected ? 'default' : 'secondary'}>
                    {account.isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                  
                  {account.isConnected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => disconnectSocialAccount(account.platform)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => connectSocialAccount(account.platform)}
                      disabled={socialConnections.isConnecting}
                    >
                      {socialConnections.isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Coming Soon Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic posting to connected accounts</li>
                <li>• Cross-platform content optimization</li>
                <li>• Analytics and performance tracking</li>
                <li>• Bulk posting and scheduling</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
