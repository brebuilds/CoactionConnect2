import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Calendar as CalendarIcon,
  Share2,
  ThumbsUp,
  MessageCircle,
  BarChart3,
  Eye,
  Plus,
  Edit,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Clock,
  Trash2,
  Save,
  X,
  Upload,
  FileText,
  Download,
  Filter,
  Search,
  ExternalLink,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  User,
  Target,
  Pencil,
  PieChart as PieChartIcon,
  AlertTriangle,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { User } from "../App";
import { Project } from "./ProjectManager";

interface SocialMediaProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  onAddActivity?: (
    action: string,
    section: string,
    details?: string,
  ) => void;
  onPendingPostsChange?: (count: number) => void;
}

interface ContentPillar {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
}

interface Post {
  id: number;
  content: string;
  platform: string[];
  scheduledFor?: string;
  publishedAt?: string;
  status: 'pending' | 'scheduled' | 'published' | 'edit-requested';
  engagement: { likes: number; comments: number; shares: number };
  createdBy?: string;
  requestedEdit?: string;
}

export function SocialMedia({
  user,
  currentProject,
  canEdit = true,
  onAddActivity,
  onPendingPostsChange,
}: SocialMediaProps) {
  console.log('SocialMedia component rendering with:', { user, currentProject, canEdit });
  const isAdmin = user.role === "Admin" || user.role === "SuperAdmin";

  // Project-specific data functions
  const getProjectGoals = (project?: Project): string[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          "Build strategic partnerships and expand network reach",
          "Share thought leadership content and industry insights",
          "Promote collaborative initiatives and community engagement",
          "Showcase partnership success stories and case studies"
        ];
      case 'zrmc':
        return [
          "Increase brand awareness and community engagement",
          "Share valuable health and wellness content",
          "Promote upcoming events and services",
          "Build trust through patient testimonials and success stories"
        ];
      case 'tgmc':
        return [
          "Establish medical excellence and patient-centered care reputation",
          "Share advanced healthcare innovations and treatments",
          "Promote specialized medical services and expert physicians",
          "Build community trust through patient success stories"
        ];
      default:
        return [];
    }
  };

  const getProjectSocialPlatforms = (project?: Project) => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          {
            name: "LinkedIn",
            icon: Linkedin,
            color: "text-blue-700 hover:text-blue-800",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://linkedin.com/company/coactiongroup",
          },
          {
            name: "Facebook",
            icon: Facebook,
            color: "text-blue-600 hover:text-blue-700",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://facebook.com/coactiongroup",
          },
          {
            name: "Instagram",
            icon: Instagram,
            color: "text-pink-600 hover:text-pink-700",
            bgColor: "bg-pink-50 hover:bg-pink-100",
            url: "https://instagram.com/coactiongroup",
          },
          {
            name: "Twitter/X",
            icon: Twitter,
            color: "text-slate-700 hover:text-slate-800",
            bgColor: "bg-slate-50 hover:bg-slate-100",
            url: "https://twitter.com/coactiongroup",
          },
        ];
      case 'zrmc':
        return [
          {
            name: "Facebook",
            icon: Facebook,
            color: "text-blue-600 hover:text-blue-700",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://facebook.com/zionregionalmedical",
          },
          {
            name: "Instagram",
            icon: Instagram,
            color: "text-pink-600 hover:text-pink-700",
            bgColor: "bg-pink-50 hover:bg-pink-100",
            url: "https://instagram.com/zionregionalmedical",
          },
          {
            name: "Google Business",
            icon: Building,
            color: "text-green-600 hover:text-green-700",
            bgColor: "bg-green-50 hover:bg-green-100",
            url: "https://business.google.com/zionregional",
          },
          {
            name: "LinkedIn",
            icon: Linkedin,
            color: "text-blue-700 hover:text-blue-800",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://linkedin.com/company/zion-regional",
          },
        ];
      case 'tgmc':
        return [
          {
            name: "Facebook",
            icon: Facebook,
            color: "text-blue-600 hover:text-blue-700",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://facebook.com/texasgeneralmedical",
          },
          {
            name: "LinkedIn",
            icon: Linkedin,
            color: "text-blue-700 hover:text-blue-800",
            bgColor: "bg-blue-50 hover:bg-blue-100",
            url: "https://linkedin.com/company/texas-general",
          },
          {
            name: "Instagram",
            icon: Instagram,
            color: "text-pink-600 hover:text-pink-700",
            bgColor: "bg-pink-50 hover:bg-pink-100",
            url: "https://instagram.com/texasgeneralmedical",
          },
          {
            name: "Google Business",
            icon: Building,
            color: "text-green-600 hover:text-green-700",
            bgColor: "bg-green-50 hover:bg-green-100",
            url: "https://business.google.com/texasgeneral",
          },
        ];
      default:
        return [];
    }
  };

  // Goals management
  const [goals, setGoals] = useState<string[]>([]);
  const [editingGoals, setEditingGoals] = useState(false);
  const [goalsText, setGoalsText] = useState("");

  const getProjectContentPillars = (project?: Project): ContentPillar[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          {
            id: '1',
            name: 'Industry Insights',
            description: 'Thought leadership and industry trends',
            percentage: 35,
            color: project.colors.primary
          },
          {
            id: '2',
            name: 'Partnership Stories',
            description: 'Success stories and collaboration highlights',
            percentage: 30,
            color: project.colors.accent
          },
          {
            id: '3',
            name: 'Event Promotion',
            description: 'Networking events and industry conferences',
            percentage: 25,
            color: project.colors.text
          },
          {
            id: '4',
            name: 'Company Culture',
            description: 'Team highlights and behind-the-scenes content',
            percentage: 10,
            color: '#34495E'
          }
        ];
      case 'zrmc':
        return [
          {
            id: '1',
            name: 'Educational Content',
            description: 'Health tips, medical insights, and wellness guides',
            percentage: 40,
            color: project.colors.primary
          },
          {
            id: '2',
            name: 'Community Stories',
            description: 'Patient testimonials and success stories',
            percentage: 25,
            color: project.colors.accent
          },
          {
            id: '3',
            name: 'Event Promotion',
            description: 'Upcoming events, workshops, and health fairs',
            percentage: 20,
            color: project.colors.text
          },
          {
            id: '4',
            name: 'Behind the Scenes',
            description: 'Team introductions and facility highlights',
            percentage: 15,
            color: '#34495E'
          }
        ];
      case 'tgmc':
        return [
          {
            id: '1',
            name: 'Medical Excellence',
            description: 'Advanced treatments and medical innovations',
            percentage: 35,
            color: project.colors.primary
          },
          {
            id: '2',
            name: 'Patient Success',
            description: 'Recovery stories and testimonials',
            percentage: 30,
            color: project.colors.accent
          },
          {
            id: '3',
            name: 'Expert Physicians',
            description: 'Doctor spotlights and medical expertise',
            percentage: 25,
            color: project.colors.text
          },
          {
            id: '4',
            name: 'Community Health',
            description: 'Health education and community outreach',
            percentage: 10,
            color: '#34495E'
          }
        ];
      default:
        return [];
    }
  };

  // Content Pillars management
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([]);

  const [editingPillars, setEditingPillars] = useState(false);

  // Approval workflow state
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'all' | 'select'>('all');
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'feed' | 'spreadsheet'>('feed');

  // CSV upload state
  const [isCsvUploadDialogOpen, setIsCsvUploadDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploadStatus, setCsvUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [csvUploadError, setCsvUploadError] = useState<string>('');

  // Posts awaiting approval
  const [pendingPosts, setPendingPosts] = useState<Post[]>([
    {
      id: 101,
      content: "🌟 Exciting news! We're launching our new telehealth services next week. Book your virtual consultation today and experience healthcare from the comfort of your home. #Telehealth #Innovation",
      platform: ["facebook", "instagram", "linkedin"],
      status: "pending",
      engagement: { likes: 0, comments: 0, shares: 0 },
      createdBy: "Content Team"
    },
    {
      id: 102,
      content: "Did you know that regular check-ups can prevent 80% of premature heart disease and stroke? Schedule your annual wellness exam today! 💗 #PreventiveCare #HeartHealth",
      platform: ["facebook", "twitter", "instagram"],
      status: "pending",
      engagement: { likes: 0, comments: 0, shares: 0 },
      createdBy: "Marketing Team"
    },
    {
      id: 103,
      content: "Meet our amazing nursing staff! Behind every great healthcare experience is a compassionate nurse. Thank you to all our nurses for their dedication. #NursesWeek #Healthcare",
      platform: ["facebook", "linkedin"],
      status: "pending",
      engagement: { likes: 0, comments: 0, shares: 0 },
      createdBy: "HR Team"
    }
  ]);

  // Posts requesting edits
  const [editRequestedPosts, setEditRequestedPosts] = useState<Post[]>([
    {
      id: 201,
      content: "Get your flu shot today! Protect yourself and your community. Available at all locations with no appointment needed.",
      platform: ["facebook", "twitter"],
      status: "edit-requested",
      engagement: { likes: 0, comments: 0, shares: 0 },
      createdBy: "Content Team",
      requestedEdit: "Please add more information about flu shot safety and effectiveness statistics"
    }
  ]);

  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([
    {
      id: 1,
      content:
        "Join us for our Health & Wellness Fair this Saturday! Free health screenings, educational workshops, and fun activities for the whole family. #HealthyLiving #Community",
      platform: ["facebook", "instagram", "twitter"],
      scheduledFor: "2025-08-23 10:00 AM",
      status: "scheduled",
      engagement: { likes: 0, comments: 0, shares: 0 },
    },
    {
      id: 2,
      content:
        "Meet Dr. Sarah Wilson, our new cardiologist! She brings 15 years of experience in cardiac care and is accepting new patients. Schedule your appointment today.",
      platform: ["facebook", "linkedin"],
      scheduledFor: "2025-08-24 2:00 PM",
      status: "scheduled",
      engagement: { likes: 0, comments: 0, shares: 0 },
    },
  ]);

  const [publishedPosts] = useState<Post[]>([
    {
      id: 3,
      content:
        "Thank you to all the healthcare heroes working tirelessly to keep our community healthy. Your dedication makes a difference every day! #HealthcareHeroes",
      platform: [
        "facebook",
        "instagram",
        "twitter",
        "linkedin",
      ],
      publishedAt: "2025-08-19 3:30 PM",
      status: "published",
      engagement: { likes: 124, comments: 18, shares: 32 },
    },
    {
      id: 4,
      content:
        "Reminder: Our pharmacy now offers extended hours Monday-Friday until 8 PM for your convenience. No appointment necessary for vaccinations!",
      platform: ["facebook", "twitter"],
      publishedAt: "2025-08-18 9:00 AM",
      status: "published",
      engagement: { likes: 67, comments: 8, shares: 15 },
    },
  ]);

  // Get social media platform links for current project
  const socialPlatforms = getProjectSocialPlatforms(currentProject);

  // Initialize project-specific data
  useEffect(() => {
    if (currentProject) {
      // Load saved data or initialize with project defaults
      const savedGoals = localStorage.getItem(`social-goals-${currentProject.id}`);
      if (savedGoals) {
        const goalsList = JSON.parse(savedGoals);
        setGoals(goalsList);
        setGoalsText(goalsList.join('\n'));
      } else {
        const defaultGoals = getProjectGoals(currentProject);
        setGoals(defaultGoals);
        setGoalsText(defaultGoals.join('\n'));
      }

      const savedPillars = localStorage.getItem(`social-pillars-${currentProject.id}`);
      if (savedPillars) {
        setContentPillars(JSON.parse(savedPillars));
      } else {
        setContentPillars(getProjectContentPillars(currentProject));
      }

      const savedPendingPosts = localStorage.getItem(`social-pending-${currentProject.id}`);
      if (savedPendingPosts) {
        setPendingPosts(JSON.parse(savedPendingPosts));
      }

      const savedScheduledPosts = localStorage.getItem(`social-scheduled-${currentProject.id}`);
      if (savedScheduledPosts) {
        setScheduledPosts(JSON.parse(savedScheduledPosts));
      }
    }
  }, [currentProject]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return Facebook;
      case "instagram":
        return Instagram;
      case "twitter":
        return Twitter;
      case "linkedin":
        return Linkedin;
      default:
        return Share2;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "text-blue-600";
      case "instagram":
        return "text-pink-600";
      case "twitter":
        return "text-sky-600";
      case "linkedin":
        return "text-blue-700";
      default:
        return "text-foreground";
    }
  };

  const handleSaveGoals = () => {
    const newGoals = goalsText.split('\n').filter(goal => goal.trim() !== '');
    setGoals(newGoals);
    setEditingGoals(false);
    
    // Save to project-specific localStorage
    if (currentProject) {
      localStorage.setItem(`social-goals-${currentProject.id}`, JSON.stringify(newGoals));
    }
  };

  const handlePillarPercentageChange = (pillarId: string, newPercentage: number) => {
    setContentPillars(prevPillars => {
      const updatedPillars = [...prevPillars];
      const pillarIndex = updatedPillars.findIndex(p => p.id === pillarId);
      
      if (pillarIndex === -1) return prevPillars;
      
      const oldPercentage = updatedPillars[pillarIndex].percentage;
      const difference = newPercentage - oldPercentage;
      
      // Update the selected pillar
      updatedPillars[pillarIndex].percentage = newPercentage;
      
      // Distribute the difference among other pillars
      const otherPillars = updatedPillars.filter((_, index) => index !== pillarIndex);
      const totalOtherPercentage = otherPillars.reduce((sum, p) => sum + p.percentage, 0);
      
      if (totalOtherPercentage > 0) {
        otherPillars.forEach(pillar => {
          const ratio = pillar.percentage / totalOtherPercentage;
          const adjustment = -difference * ratio;
          pillar.percentage = Math.max(0, Math.min(100, pillar.percentage + adjustment));
        });
      }
      
      // Normalize to ensure total equals 100%
      const total = updatedPillars.reduce((sum, p) => sum + p.percentage, 0);
      if (total !== 100 && total > 0) {
        updatedPillars.forEach(pillar => {
          pillar.percentage = Math.round((pillar.percentage / total) * 100);
        });
      }
      
      // Save to project-specific localStorage
      if (currentProject) {
        localStorage.setItem(`social-pillars-${currentProject.id}`, JSON.stringify(updatedPillars));
      }
      
      return updatedPillars;
    });
  };

  const pieChartData = contentPillars.map(pillar => ({
    name: pillar.name,
    value: pillar.percentage,
    color: pillar.color
  }));

  // Approval workflow functions
  const handleApproveAll = () => {
    const approvedPosts = pendingPosts.map(post => ({
      ...post,
      status: 'scheduled' as const,
      scheduledFor: "2025-08-25 2:00 PM" // Default scheduling
    }));
    
    setScheduledPosts(prev => [...prev, ...approvedPosts]);
    setPendingPosts([]);
    setIsApprovalDialogOpen(false);
    toast.success(`${approvedPosts.length} posts approved and scheduled!`);
  };

  const handleSelectiveApproval = (action: 'approve' | 'request-edit') => {
    if (selectedPostIds.length === 0) {
      toast.error("Please select at least one post to continue.");
      return;
    }

    const selectedPosts = pendingPosts.filter(post => selectedPostIds.includes(post.id));
    const remainingPosts = pendingPosts.filter(post => !selectedPostIds.includes(post.id));

    if (action === 'approve') {
      const approvedPosts = selectedPosts.map(post => ({
        ...post,
        status: 'scheduled' as const,
        scheduledFor: "2025-08-25 2:00 PM" // Default scheduling
      }));
      
      setScheduledPosts(prev => [...prev, ...approvedPosts]);
      toast.success(`${approvedPosts.length} posts approved and scheduled!`);
    } else {
      const editRequestedPosts = selectedPosts.map(post => ({
        ...post,
        status: 'edit-requested' as const,
        requestedEdit: "Please review and improve content quality"
      }));
      
      setEditRequestedPosts(prev => [...prev, ...editRequestedPosts]);
      toast.info(`${editRequestedPosts.length} posts moved to edits requested.`);
    }

    setPendingPosts(remainingPosts);
    setSelectedPostIds([]);
    setIsApprovalDialogOpen(false);
  };

  const handlePostSelection = (postId: number, checked: boolean) => {
    if (checked) {
      setSelectedPostIds(prev => [...prev, postId]);
    } else {
      setSelectedPostIds(prev => prev.filter(id => id !== postId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPostIds(pendingPosts.map(post => post.id));
    } else {
      setSelectedPostIds([]);
    }
  };

  // Notify parent component when pending posts count changes
  useEffect(() => {
    if (onPendingPostsChange) {
      onPendingPostsChange(pendingPosts.length);
    }
  }, [pendingPosts.length, onPendingPostsChange]);

  // CSV processing functions
  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvUploadError('');
    } else {
      setCsvUploadError('Please select a valid CSV file.');
    }
  };

  const parseCsvContent = (csvText: string): Post[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const posts: Post[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 2) continue; // Skip empty lines
      
      const content = values[0] || '';
      const platforms = values[1] ? values[1].split('|').map(p => p.trim().toLowerCase()) : ['facebook'];
      
      // Validate platforms
      const validPlatforms = platforms.filter(p => 
        ['facebook', 'instagram', 'twitter', 'linkedin'].includes(p)
      );
      
      if (content && validPlatforms.length > 0) {
        posts.push({
          id: Date.now() + i, // Generate unique ID
          content: content,
          platform: validPlatforms,
          status: 'pending',
          engagement: { likes: 0, comments: 0, shares: 0 },
          createdBy: user.name || 'CSV Upload'
        });
      }
    }
    
    return posts;
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setCsvUploadError('Please select a CSV file first.');
      return;
    }

    setCsvUploadStatus('uploading');
    setCsvUploadError('');

    try {
      const csvText = await csvFile.text();
      const newPosts = parseCsvContent(csvText);
      
      if (newPosts.length === 0) {
        setCsvUploadError('No valid posts found in CSV file. Please check the format.');
        setCsvUploadStatus('error');
        return;
      }

      // Add new posts to pending posts
      setPendingPosts(prev => [...prev, ...newPosts]);
      
      // Save to localStorage
      const updatedPendingPosts = [...pendingPosts, ...newPosts];
      localStorage.setItem(`social-pending-${currentProject?.id}`, JSON.stringify(updatedPendingPosts));
      
      setCsvUploadStatus('success');
      toast.success(`${newPosts.length} posts uploaded and added to approval queue!`);
      
      // Reset form
      setCsvFile(null);
      setIsCsvUploadDialogOpen(false);
      
    } catch (error) {
      setCsvUploadError('Error processing CSV file. Please check the format and try again.');
      setCsvUploadStatus('error');
    }
  };

  const downloadCsvTemplate = () => {
    const template = 'content,platforms\n"🌟 Exciting news! We are launching our new telehealth services next week. Book your virtual consultation today! #Telehealth #Innovation","facebook|instagram|linkedin"\n"Did you know that regular check-ups can prevent 80% of premature heart disease? Schedule your annual wellness exam today! 💗 #PreventiveCare","facebook|twitter|instagram"';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_media_posts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">
            Social Media
          </h1>
          <p className="text-foreground/70">
            {isAdmin
              ? "Manage content, schedule posts, and track engagement across all platforms"
              : "View content, scheduled posts, and engagement across all platforms"}
          </p>
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'feed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('feed')}
              className={viewMode === 'feed' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Feed
            </Button>
            <Button
              variant={viewMode === 'spreadsheet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('spreadsheet')}
              className={viewMode === 'spreadsheet' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'}
            >
              <Table className="w-4 h-4 mr-2" />
              Spreadsheet
            </Button>
          </div>
          
          {canEdit && (
            <>
              <Button 
                onClick={() => setIsCreatePostDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button 
                onClick={() => setIsCsvUploadDialogOpen(true)}
                variant="outline"
                className="border-primary/20 hover:bg-primary/5"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Approval Banner */}
      {pendingPosts.length > 0 && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Content Approvals Needed</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span className="text-foreground/70">
              {pendingPosts.length} post{pendingPosts.length !== 1 ? 's' : ''} waiting for approval
            </span>
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Eye className="w-4 h-4 mr-2" />
                  View ({pendingPosts.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-primary" />
                    Content Approval Review
                  </DialogTitle>
                  <DialogDescription>
                    Review and approve posts before they are scheduled for publication.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Quick Actions</h3>
                      <p className="text-sm text-foreground/60">Choose how you'd like to review the pending posts</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleApproveAll}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve All ({pendingPosts.length})
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setApprovalMode('select')}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Select Posts
                      </Button>
                    </div>
                  </div>

                  {/* Selective Approval Mode */}
                  {approvalMode === 'select' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedPostIds.length === pendingPosts.length}
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-sm font-medium">Select All Posts</span>
                          {selectedPostIds.length > 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {selectedPostIds.length} selected
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={selectedPostIds.length === 0}
                            onClick={() => handleSelectiveApproval('approve')}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve Selected
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={selectedPostIds.length === 0}
                            onClick={() => handleSelectiveApproval('request-edit')}
                            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Request Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="space-y-4">
                    {pendingPosts.map((post) => (
                      <div key={post.id} className="p-4 border border-accent/20 rounded-lg space-y-3">
                        <div className="flex items-start space-x-3">
                          {approvalMode === 'select' && (
                            <Checkbox
                              checked={selectedPostIds.includes(post.id)}
                              onCheckedChange={(checked) => handlePostSelection(post.id, checked as boolean)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-primary text-primary">
                                Pending Approval
                              </Badge>
                              <span className="text-xs text-foreground/60">Created by {post.createdBy}</span>
                            </div>
                            <p className="text-foreground">{post.content}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-foreground/60">Platforms:</span>
                              {post.platform.map((platform) => {
                                const Icon = getPlatformIcon(platform);
                                return (
                                  <Icon
                                    key={platform}
                                    className={`w-4 h-4 ${getPlatformColor(platform)}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsApprovalDialogOpen(false);
                        setApprovalMode('all');
                        setSelectedPostIds([]);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}

      {/* CSV Upload Dialog */}
      <Dialog open={isCsvUploadDialogOpen} onOpenChange={setIsCsvUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2 text-primary" />
              Upload Posts via CSV
            </DialogTitle>
            <DialogDescription>
              Upload multiple social media posts at once using a CSV file. All uploaded posts will be added to the approval queue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Download */}
            <div className="p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Need a template?</h4>
                  <p className="text-sm text-foreground/70">
                    Download our CSV template to see the correct format
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadCsvTemplate}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file" className="text-sm font-medium">
                  Select CSV File
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileSelect}
                  className="mt-1"
                />
                {csvFile && (
                  <p className="text-sm text-foreground/70 mt-2">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              {/* CSV Format Instructions */}
              <div className="p-4 bg-background border border-accent/20 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-foreground/70 space-y-1">
                  <li>• <strong>content</strong>: The post text content</li>
                  <li>• <strong>platforms</strong>: Platforms separated by | (e.g., facebook|instagram|twitter)</li>
                  <li>• Valid platforms: facebook, instagram, twitter, linkedin</li>
                  <li>• First row should be headers: content,platforms</li>
                </ul>
              </div>

              {/* Error Display */}
              {csvUploadError && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {csvUploadError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Display */}
              {csvUploadStatus === 'success' && (
                <Alert className="border-green-500/20 bg-green-500/5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Posts uploaded successfully and added to approval queue!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCsvUploadDialogOpen(false);
                  setCsvFile(null);
                  setCsvUploadError('');
                  setCsvUploadStatus('idle');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCsvUpload}
                disabled={!csvFile || csvUploadStatus === 'uploading'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {csvUploadStatus === 'uploading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Posts
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Media Platform Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Card
              key={platform.name}
              className="border-accent/20 shadow-sm bg-background hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${platform.bgColor} group`}
                >
                  <Icon
                    className={`w-6 h-6 ${platform.color} transition-colors`}
                  />
                  <div className="flex-1">
                    <p className="text-foreground group-hover:text-foreground/80 transition-colors">
                      {platform.name}
                    </p>
                    <p className="text-xs text-foreground/60">
                      View & Manage
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Management */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-secondary">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Scheduled</TabsTrigger>
          <TabsTrigger value="published" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Published</TabsTrigger>
          <TabsTrigger value="edits-requested" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
            Edits Requested
            {editRequestedPosts.length > 0 && (
              <Badge className="ml-2 bg-accent text-accent-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {editRequestedPosts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Social Media Goals */}
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Social Media Goals
                </CardTitle>
                <CardDescription>Define your social media objectives and strategy</CardDescription>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingGoals) {
                      handleSaveGoals();
                    } else {
                      setEditingGoals(true);
                      setGoalsText(goals.join('\n'));
                    }
                  }}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {editingGoals ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingGoals ? (
                <div className="space-y-4">
                  <Textarea
                    value={goalsText}
                    onChange={(e) => setGoalsText(e.target.value)}
                    placeholder="Enter each goal on a new line..."
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingGoals(false);
                        setGoalsText(goals.join('\n'));
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-foreground">{goal}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Pillars */}
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Content Pillars
                </CardTitle>
                <CardDescription>Manage your content strategy and distribution</CardDescription>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPillars(!editingPillars)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {editingPillars ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Done
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Content Pillars List */}
                <div className="space-y-4">
                  {contentPillars.map((pillar) => (
                    <div key={pillar.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: pillar.color }}
                          />
                          <div>
                            <h4 className="text-foreground font-medium">{pillar.name}</h4>
                            <p className="text-sm text-foreground/60">{pillar.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-foreground">{pillar.percentage}%</span>
                        </div>
                      </div>
                      
                      {editingPillars && canEdit && (
                        <div className="pl-7">
                          <Slider
                            value={[pillar.percentage]}
                            onValueChange={(value) => handlePillarPercentageChange(pillar.id, value[0])}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-foreground/60 mt-1">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-accent/20">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground font-medium">Total:</span>
                      <span className="text-lg font-semibold text-primary">
                        {contentPillars.reduce((sum, pillar) => sum + pillar.percentage, 0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ value }) => `${value}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {contentPillars.map((pillar) => (
                      <div key={pillar.id} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pillar.color }}
                        />
                        <span className="text-foreground/70 text-xs">{pillar.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Scheduled Posts</CardTitle>
              <CardDescription>Posts ready to be published</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-accent/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-foreground mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-foreground/60">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {post.scheduledFor}
                          </span>
                          <div className="flex items-center space-x-2">
                            {post.platform.map((platform) => {
                              const Icon = getPlatformIcon(platform);
                              return (
                                <Icon
                                  key={platform}
                                  className={`w-4 h-4 ${getPlatformColor(platform)}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Published Posts</CardTitle>
              <CardDescription>Your published content and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-accent/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-foreground mb-2">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-foreground/60">{post.publishedAt}</span>
                            <div className="flex items-center space-x-2">
                              {post.platform.map((platform) => {
                                const Icon = getPlatformIcon(platform);
                                return (
                                  <Icon
                                    key={platform}
                                    className={`w-4 h-4 ${getPlatformColor(platform)}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-sm text-foreground/60">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.engagement.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-foreground/60">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.engagement.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-foreground/60">
                              <Share2 className="w-4 h-4" />
                              <span>{post.engagement.shares}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edits-requested" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <RotateCcw className="w-5 h-5 mr-2 text-accent" />
                Edits Requested
              </CardTitle>
              <CardDescription>Posts that need revision before approval</CardDescription>
            </CardHeader>
            <CardContent>
              {editRequestedPosts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg text-foreground mb-2">No edits requested</h3>
                  <p className="text-foreground/60">All posts are either approved or pending approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {editRequestedPosts.map((post) => (
                    <div key={post.id} className="p-4 border border-accent/20 rounded-lg bg-accent/5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-accent text-accent">
                              Edit Requested
                            </Badge>
                            <span className="text-xs text-foreground/60">Created by {post.createdBy}</span>
                          </div>
                          {canEdit && (
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-background p-3 rounded border border-accent/20">
                          <p className="text-foreground">{post.content}</p>
                        </div>

                        {post.requestedEdit && (
                          <div className="bg-accent/10 p-3 rounded border border-accent/20">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-accent mb-1">Edit Request:</p>
                                <p className="text-sm text-foreground/70">{post.requestedEdit}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-foreground/60">Platforms:</span>
                            {post.platform.map((platform) => {
                              const Icon = getPlatformIcon(platform);
                              return (
                                <Icon
                                  key={platform}
                                  className={`w-4 h-4 ${getPlatformColor(platform)}`}
                                />
                              );
                            })}
                          </div>
                          
                          {canEdit && (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                <Send className="w-4 h-4 mr-1" />
                                Send to Creator
                              </Button>
                              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit & Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Content Calendar</CardTitle>
              <CardDescription>View and manage your social media schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border border-accent/20"
                  />
                </div>
                <div className="lg:w-80">
                  <div className="space-y-4">
                    <h3 className="text-foreground">Upcoming Posts</h3>
                    {scheduledPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-foreground mb-1">{post.content.substring(0, 60)}...</p>
                        <p className="text-xs text-foreground/60">{post.scheduledFor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
