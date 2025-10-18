import React, { useState, useEffect } from "react";
import { User } from "../App";
import { Project } from "./ProjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Sparkles,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Grid3x3,
  LayoutGrid,
  Edit,
  Archive,
  Heart,
  Building2,
  Lightbulb,
  Users,
  Stethoscope,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Clock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Palette,
  Trash2,
  Eye,
  Save,
  Send,
  ChevronRight,
  ChevronLeft,
  Zap,
  Target,
  TrendingUp,
  BarChart3
} from "lucide-react";

interface SocialMediaProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  onAddActivity?: (action: string, section: string, details?: string) => void;
  onPendingPostsChange?: (count: number) => void;
}

// Types
interface ContentBankItem {
  id: string;
  project: string;
  contentPillar: string;
  baseContent: string;
  hashtags: string[];
  platforms: string[];
  status: 'active' | 'archived';
  suggestedDate?: Date;
  characterCount: number;
  createdAt: Date;
  usageCount: number;
}

interface ScheduledPost {
  id: string;
  contentBankId: string;
  platform: string;
  optimizedCaption: string;
  hashtags: string[];
  templateId?: string;
  finalImageUrl?: string;
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
  impressions?: number;
  engagement?: number;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  platforms: string[];
}

interface WizardState {
  step: number;
  contentPillar?: string;
  selectedContent?: ContentBankItem;
  selectedPlatforms: string[];
  generatedVariants: { [platform: string]: { caption: string; hashtags: string[]; changes: string[] } };
  selectedTemplate?: Template;
  canvasData: { [platform: string]: any };
  schedulingData: { [platform: string]: { date?: Date; time?: string; timezone?: string } };
}

// Constants
const CONTENT_PILLARS = [
  { id: 'community-health', emoji: '🏥', title: 'Community Health Impact', subtitle: 'Health outcomes & community wellness', color: 'bg-blue-500' },
  { id: 'construction', emoji: '🏗️', title: 'Construction Progress', subtitle: 'Building updates & milestones', color: 'bg-orange-500' },
  { id: 'innovation', emoji: '💡', title: 'Healthcare Innovation', subtitle: 'Technology & modern care', color: 'bg-purple-500' },
  { id: 'team', emoji: '👥', title: 'Team & Partnerships', subtitle: 'People & collaboration', color: 'bg-green-500' },
  { id: 'patient-care', emoji: '❤️', title: 'Patient-Centered Care', subtitle: 'Stories & testimonials', color: 'bg-red-500' }
];

const PLATFORMS = [
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    color: 'text-blue-600',
    charLimit: 700, 
    description: 'Professional network, 700 char limit',
    optimization: 'Will optimize: Tone, hashtags, character count'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'text-blue-500',
    charLimit: 250, 
    description: 'Community engagement, 250 char optimal',
    optimization: 'Will optimize: Casual tone, community focus, emojis'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-500',
    charLimit: 125, 
    description: 'Visual storytelling, 125 char + 30 hashtags',
    optimization: 'Requires high-quality image (1080x1080)',
    warning: true
  },
  { 
    id: 'twitter', 
    name: 'Twitter/X', 
    icon: Twitter, 
    color: 'text-gray-900',
    charLimit: 280, 
    description: 'Real-time updates, 280 char limit',
    optimization: 'Will optimize for brevity'
  }
];

const TEMPLATES = [
  { id: '1', name: 'Bold Announcement', slug: 'bold-announcement', description: 'Eye-catching design for major updates', category: 'Announcements', thumbnailUrl: '/templates/bold-announcement.png', platforms: ['linkedin', 'facebook', 'instagram', 'twitter'] },
  { id: '2', name: 'Community Focus', slug: 'community-focus', description: 'Warm, people-centered layout', category: 'Community', thumbnailUrl: '/templates/community-focus.png', platforms: ['linkedin', 'facebook', 'instagram'] },
  { id: '3', name: 'Professional Clean', slug: 'professional-clean', description: 'Minimal, corporate aesthetic', category: 'Professional', thumbnailUrl: '/templates/professional-clean.png', platforms: ['linkedin', 'twitter'] },
  { id: '4', name: 'Stats Grid', slug: 'stats-grid', description: 'Data visualization template', category: 'Data', thumbnailUrl: '/templates/stats-grid.png', platforms: ['linkedin', 'facebook', 'twitter'] },
  { id: '5', name: 'Quote Frame', slug: 'quote-frame', description: 'Testimonial and quote showcase', category: 'Testimonials', thumbnailUrl: '/templates/quote-frame.png', platforms: ['linkedin', 'facebook', 'instagram'] },
  { id: '6', name: 'Progress Bar', slug: 'progress-bar', description: 'Show milestones and achievements', category: 'Progress', thumbnailUrl: '/templates/progress-bar.png', platforms: ['linkedin', 'facebook', 'instagram', 'twitter'] },
  { id: '7', name: 'Team Spotlight', slug: 'team-spotlight', description: 'Highlight team members', category: 'Team', thumbnailUrl: '/templates/team-spotlight.png', platforms: ['linkedin', 'facebook', 'instagram'] },
  { id: '8', name: 'Event Promo', slug: 'event-promo', description: 'Event announcements and invitations', category: 'Events', thumbnailUrl: '/templates/event-promo.png', platforms: ['linkedin', 'facebook', 'instagram', 'twitter'] }
];

export function SocialMedia({ user, currentProject, canEdit = true, onAddActivity, onPendingPostsChange }: SocialMediaProps) {
  const [mode, setMode] = useState<'selection' | 'spreadsheet' | 'wizard'>('selection');
  const [contentBank, setContentBank] = useState<ContentBankItem[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>({
    step: 1,
    selectedPlatforms: [],
    generatedVariants: {},
    canvasData: {},
    schedulingData: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPillar, setFilterPillar] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load data from localStorage
  useEffect(() => {
    if (currentProject) {
      const savedContentBank = localStorage.getItem(`content-bank-${currentProject.id}`);
      if (savedContentBank) {
        const parsed = JSON.parse(savedContentBank).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          suggestedDate: item.suggestedDate ? new Date(item.suggestedDate) : undefined
        }));
        setContentBank(parsed);
      } else {
        // Initialize with sample data
        const sampleData: ContentBankItem[] = [
          {
            id: '1',
            project: currentProject.id,
            contentPillar: 'community-health',
            baseContent: 'We\'re proud to announce our new community health initiative bringing quality healthcare to underserved neighborhoods.',
            hashtags: ['#CommunityHealth', '#Healthcare', '#WellnessForAll'],
            platforms: ['linkedin', 'facebook', 'instagram'],
            status: 'active',
            characterCount: 128,
            createdAt: new Date(),
            usageCount: 0
          },
          {
            id: '2',
            project: currentProject.id,
            contentPillar: 'construction',
            baseContent: 'Construction milestone: Phase 1 of our new medical facility is 75% complete! Opening Q2 2025.',
            hashtags: ['#ConstructionUpdate', '#NewFacility', '#Progress'],
            platforms: ['linkedin', 'facebook', 'twitter'],
            status: 'active',
            characterCount: 98,
            createdAt: new Date(),
            usageCount: 2
          }
        ];
        setContentBank(sampleData);
        localStorage.setItem(`content-bank-${currentProject.id}`, JSON.stringify(sampleData));
      }

      const savedScheduledPosts = localStorage.getItem(`scheduled-posts-${currentProject.id}`);
      if (savedScheduledPosts) {
        const parsed = JSON.parse(savedScheduledPosts).map((post: any) => ({
          ...post,
          scheduledTime: post.scheduledTime ? new Date(post.scheduledTime) : undefined
        }));
        setScheduledPosts(parsed);
      }
    }
  }, [currentProject]);

  // Save data to localStorage
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(`content-bank-${currentProject.id}`, JSON.stringify(contentBank));
      localStorage.setItem(`scheduled-posts-${currentProject.id}`, JSON.stringify(scheduledPosts));

      // Update pending posts count
      const pendingCount = scheduledPosts.filter(post => post.status === 'draft' || post.status === 'scheduled').length;
      if (onPendingPostsChange) {
        onPendingPostsChange(pendingCount);
      }
    }
  }, [contentBank, scheduledPosts, currentProject, onPendingPostsChange]);

  // Wizard navigation
  const goToStep = (step: number) => {
    setWizardState(prev => ({ ...prev, step }));
  };

  const nextStep = () => {
    if (wizardState.step < 8) {
      goToStep(wizardState.step + 1);
    }
  };

  const prevStep = () => {
    if (wizardState.step > 1) {
      goToStep(wizardState.step - 1);
    }
  };

  // AI Generation simulation
  const generatePlatformVariants = async () => {
    if (!wizardState.selectedContent) return;

    setIsGenerating(true);
    goToStep(4); // Loading screen

    // Simulate AI generation with delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const variants: { [platform: string]: { caption: string; hashtags: string[]; changes: string[] } } = {};

    wizardState.selectedPlatforms.forEach(platformId => {
      const platform = PLATFORMS.find(p => p.id === platformId);
      if (!platform) return;

      const baseContent = wizardState.selectedContent!.baseContent;
      
      // Simulate platform-specific optimization
      let optimizedCaption = baseContent;
      let changes: string[] = [];

      if (platformId === 'linkedin') {
        optimizedCaption = `${baseContent}\n\nKey Takeaways:\n• Community-focused approach\n• Measurable impact\n• Long-term commitment`;
        changes = ['Added professional tone', 'Included bullet points', 'Added key takeaways section'];
      } else if (platformId === 'facebook') {
        optimizedCaption = `${baseContent} 🏥\n\nWe're so excited to share this with you and your family! ❤️`;
        changes = ['Added warm, conversational tone', 'Included emojis', 'Added family-focused language'];
      } else if (platformId === 'instagram') {
        optimizedCaption = baseContent.substring(0, 125);
        changes = ['Shortened to 125 characters', 'Optimized for visual focus', 'Increased hashtag count'];
      } else if (platformId === 'twitter') {
        optimizedCaption = baseContent.substring(0, 250);
        changes = ['Condensed for brevity', 'Maintained key message', 'Optimized character count'];
      }

      variants[platformId] = {
        caption: optimizedCaption,
        hashtags: wizardState.selectedContent!.hashtags,
        changes
      };
    });

    setWizardState(prev => ({ ...prev, generatedVariants: variants }));
    setIsGenerating(false);
    goToStep(5); // Review variants
  };

  // Filtered content for spreadsheet view
  const filteredContent = contentBank.filter(item => {
    const matchesSearch = item.baseContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = filterPillar === 'all' || item.contentPillar === filterPillar;
    const matchesPlatform = filterPlatform === 'all' || item.platforms.includes(filterPlatform);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesPillar && matchesPlatform && matchesStatus;
  });

  // Render mode selection
  if (mode === 'selection') {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Social Content Studio</h1>
            <p className="text-gray-600">Choose how you want to manage your social media content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spreadsheet View Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('spreadsheet')}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-2xl">Spreadsheet View</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Access your Airtable-synced content calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    View all content in a spreadsheet format
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Filter by pillar, platform, and status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Bulk edit and manage posts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time Airtable sync
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Open Spreadsheet
                </Button>
              </CardContent>
            </Card>

            {/* AI Wizard Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-500 relative" onClick={() => setMode('wizard')}>
              <Badge className="absolute top-4 right-4 bg-purple-500">Recommended</Badge>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <CardTitle className="text-2xl">AI Wizard Generator</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Create new posts with AI-powered optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    7-step guided post creation
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    AI-optimized content for each platform
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Professional templates & canvas editor
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Smart scheduling recommendations
                  </li>
                </ul>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{contentBank.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Content Items</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{scheduledPosts.filter(p => p.status === 'scheduled').length}</div>
                  <div className="text-sm text-gray-600 mt-1">Scheduled Posts</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{scheduledPosts.filter(p => p.status === 'published').length}</div>
                  <div className="text-sm text-gray-600 mt-1">Published</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render spreadsheet view
  if (mode === 'spreadsheet') {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setMode('selection')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Content Calendar</h1>
              <p className="text-sm text-gray-600">{currentProject?.name || 'All Projects'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync with Airtable
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setMode('wizard')}>
              <Plus className="w-4 h-4 mr-2" />
              Create in Wizard
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterPillar} onValueChange={setFilterPillar}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Content Pillar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pillars</SelectItem>
                {CONTENT_PILLARS.map(pillar => (
                  <SelectItem key={pillar.id} value={pillar.id}>
                    {pillar.emoji} {pillar.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>{platform.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content Pillar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platforms</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Characters</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hashtags</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContent.map(item => {
                  const pillar = CONTENT_PILLARS.find(p => p.id === item.contentPillar);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{pillar?.emoji}</span>
                          <span className="text-sm font-medium">{pillar?.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="text-sm text-gray-900 truncate">{item.baseContent}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {item.platforms.map(platformId => {
                            const platform = PLATFORMS.find(p => p.id === platformId);
                            const Icon = platform?.icon;
                            return Icon ? <Icon key={platformId} className={`w-4 h-4 ${platform.color}`} /> : null;
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{item.characterCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                          {item.hashtags.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{item.hashtags.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{item.usageCount}x</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setWizardState(prev => ({ ...prev, selectedContent: item, step: 3 }));
                            setMode('wizard');
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No content found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render wizard mode
  if (mode === 'wizard') {
    const progressPercentage = (wizardState.step / 8) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
                if (wizardState.step === 1) {
                  setMode('selection');
                } else {
                  // Show confirmation dialog in production
                  setMode('selection');
                }
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Social Content Studio</h1>
                <p className="text-sm text-gray-600">{currentProject?.name || 'All Projects'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {wizardState.step} of 8</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between mt-4 text-xs">
              <div className={`flex flex-col items-center ${wizardState.step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Target className="w-5 h-5 mb-1" />
                <span>Pillar</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                <FileSpreadsheet className="w-5 h-5 mb-1" />
                <span>Content</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Share2 className="w-5 h-5 mb-1" />
                <span>Platforms</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 4 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Zap className="w-5 h-5 mb-1" />
                <span>Generate</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 5 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Eye className="w-5 h-5 mb-1" />
                <span>Review</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 6 ? 'text-purple-600' : 'text-gray-400'}`}>
                <LayoutGrid className="w-5 h-5 mb-1" />
                <span>Template</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 7 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Palette className="w-5 h-5 mb-1" />
                <span>Editor</span>
              </div>
              <div className={`flex flex-col items-center ${wizardState.step >= 8 ? 'text-purple-600' : 'text-gray-400'}`}>
                <Calendar className="w-5 h-5 mb-1" />
                <span>Schedule</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Step 1: Select Content Pillar */}
          {wizardState.step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Select Content Pillar</h2>
                <p className="text-gray-600">Choose the theme that best fits your message</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CONTENT_PILLARS.map(pillar => (
                  <Card
                    key={pillar.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      wizardState.contentPillar === pillar.id ? 'ring-2 ring-purple-500 shadow-lg' : ''
                    }`}
                    onClick={() => {
                      setWizardState(prev => ({ ...prev, contentPillar: pillar.id }));
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">{pillar.emoji}</div>
                      <h3 className="font-bold mb-1">{pillar.title}</h3>
                      <p className="text-sm text-gray-600">{pillar.subtitle}</p>
                      {wizardState.contentPillar === pillar.id && (
                        <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mt-3" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Base Copy */}
          {wizardState.step === 2 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-purple-100 text-purple-700">
                    {CONTENT_PILLARS.find(p => p.id === wizardState.contentPillar)?.emoji}{' '}
                    {CONTENT_PILLARS.find(p => p.id === wizardState.contentPillar)?.title}
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold mb-2">Select Base Copy</h2>
                <p className="text-gray-600">Choose the content that will be optimized for each platform</p>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="space-y-4">
                {contentBank
                  .filter(item => item.contentPillar === wizardState.contentPillar)
                  .map(item => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        wizardState.selectedContent?.id === item.id ? 'border-l-4 border-l-purple-600 shadow-md' : ''
                      }`}
                      onClick={() => setWizardState(prev => ({ ...prev, selectedContent: item }))}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-lg mb-3">{item.baseContent}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{item.characterCount} characters</span>
                              <span>•</span>
                              <span>{item.hashtags.length} hashtags</span>
                              <span>•</span>
                              <span>Best for: {item.platforms.map(p => PLATFORMS.find(pl => pl.id === p)?.name).join(', ')}</span>
                            </div>
                          </div>
                          {wizardState.selectedContent?.id === item.id && (
                            <CheckCircle className="w-6 h-6 text-purple-600 ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {contentBank.filter(item => item.contentPillar === wizardState.contentPillar).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500 mb-4">No content available for this pillar yet</p>
                    <Button variant="outline">Create New Content</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Select Platforms */}
          {wizardState.step === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Select Platforms</h2>
                <p className="text-gray-600">Choose where you want to publish this content</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = wizardState.selectedPlatforms.includes(platform.id);
                  return (
                    <Card
                      key={platform.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
                      }`}
                      onClick={() => {
                        setWizardState(prev => ({
                          ...prev,
                          selectedPlatforms: isSelected
                            ? prev.selectedPlatforms.filter(p => p !== platform.id)
                            : [...prev.selectedPlatforms, platform.id]
                        }));
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-8 h-8 ${platform.color}`} />
                            <div>
                              <h3 className="font-bold text-lg">{platform.name}</h3>
                              <p className="text-sm text-gray-600">{platform.description}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-6 h-6 text-purple-600" />}
                        </div>
                        <div className="bg-gray-50 rounded p-3 text-sm">
                          <p className="text-gray-700">{platform.optimization}</p>
                        </div>
                        {platform.warning && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-orange-600">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <span>{platform.optimization}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-bold">{wizardState.selectedPlatforms.length} platforms</span>
                  {wizardState.selectedPlatforms.length > 0 && (
                    <span> • AI will generate {wizardState.selectedPlatforms.length} optimized variants</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: AI Generation Loading */}
          {wizardState.step === 4 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="mb-8">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Generating Platform-Optimized Variants...</h2>
                <p className="text-gray-600">This will take about 10 seconds</p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Analyzing base copy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Understanding platform requirements</span>
                    </div>
                    {wizardState.selectedPlatforms.map((platformId, idx) => {
                      const platform = PLATFORMS.find(p => p.id === platformId);
                      return (
                        <div key={platformId} className="flex items-center gap-3">
                          {isGenerating ? (
                            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span>Optimizing for {platform?.name}...</span>
                        </div>
                      );
                    })}
                  </div>
                  <Progress value={isGenerating ? 60 : 100} className="mt-6" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review Variants */}
          {wizardState.step === 5 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Review Platform Variants</h2>
                <p className="text-gray-600">Review and edit the AI-optimized content for each platform</p>
              </div>

              <Tabs defaultValue={wizardState.selectedPlatforms[0]} className="max-w-4xl mx-auto">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${wizardState.selectedPlatforms.length}, 1fr)` }}>
                  {wizardState.selectedPlatforms.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    const Icon = platform?.icon;
                    return (
                      <TabsTrigger key={platformId} value={platformId} className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        {platform?.name}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {wizardState.selectedPlatforms.map(platformId => {
                  const platform = PLATFORMS.find(p => p.id === platformId);
                  const variant = wizardState.generatedVariants[platformId];
                  const Icon = platform?.icon;

                  return (
                    <TabsContent key={platformId} value={platformId}>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`w-6 h-6 ${platform.color}`} />}
                            <CardTitle>{platform?.name} Variant</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Optimized Caption</Label>
                            <Textarea
                              value={variant?.caption || ''}
                              onChange={(e) => {
                                setWizardState(prev => ({
                                  ...prev,
                                  generatedVariants: {
                                    ...prev.generatedVariants,
                                    [platformId]: {
                                      ...prev.generatedVariants[platformId],
                                      caption: e.target.value
                                    }
                                  }
                                }));
                              }}
                              rows={6}
                              className="mt-2"
                            />
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>{variant?.caption.length || 0}/{platform?.charLimit} chars</span>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Professional tone</span>
                            </div>
                          </div>

                          <div>
                            <Label>Hashtags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {variant?.hashtags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-purple-900 mb-2">Changes made by AI:</p>
                                <ul className="space-y-1 text-sm text-purple-800">
                                  {variant?.changes.map((change, idx) => (
                                    <li key={idx}>• {change}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <Button variant="outline" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Copy
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>

              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => {
                  if (confirm('Are you sure you want to regenerate? Current changes will be lost.')) {
                    generatePlatformVariants();
                  }
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Select Template */}
          {wizardState.step === 6 && (
            <div>
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Platforms selected: {wizardState.selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.name).join(', ')} - Your template will work on all platforms ✓
                  </p>
                </div>
                <h2 className="text-3xl font-bold mb-2">Select Template</h2>
                <p className="text-gray-600">Choose a design template for your social media posts</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {TEMPLATES.map(template => {
                  const isCompatible = wizardState.selectedPlatforms.every(p => template.platforms.includes(p));
                  const isSelected = wizardState.selectedTemplate?.id === template.id;

                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        !isCompatible ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                      } ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
                      onClick={() => {
                        if (isCompatible) {
                          setWizardState(prev => ({ ...prev, selectedTemplate: template }));
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <LayoutGrid className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{template.category}</p>
                        {isSelected && (
                          <Badge className="w-full justify-center bg-purple-600">Selected</Badge>
                        )}
                        {!isCompatible && (
                          <Badge variant="secondary" className="w-full justify-center text-xs">
                            Not compatible
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {wizardState.selectedTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold mb-1">{wizardState.selectedTemplate.name}</h4>
                        <p className="text-sm text-gray-600">{wizardState.selectedTemplate.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Available for: {wizardState.selectedTemplate.platforms.map(p => PLATFORMS.find(pl => pl.id === p)?.name).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Text zones: Headline, body, hashtags</span>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-3">Platform Previews:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {wizardState.selectedPlatforms.map(platformId => {
                            const platform = PLATFORMS.find(p => p.id === platformId);
                            const dimensions = {
                              linkedin: '1200×627',
                              facebook: '1200×630',
                              instagram: '1080×1080',
                              twitter: '1200×675'
                            };
                            return (
                              <div key={platformId} className="text-center">
                                <div className="aspect-video bg-gray-100 rounded border mb-2 flex items-center justify-center">
                                  <LayoutGrid className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-xs font-medium">{platform?.name}</p>
                                <p className="text-xs text-gray-500">{dimensions[platformId as keyof typeof dimensions]}</p>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Same design, automatically sized for each platform
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 7: Canvas Editor */}
          {wizardState.step === 7 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Customize Your Design</h2>
                <p className="text-gray-600">Edit text, add images, and customize your template</p>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* Left Panel */}
                <div className="col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select defaultValue={wizardState.selectedPlatforms[0]}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {wizardState.selectedPlatforms.map(platformId => {
                            const platform = PLATFORMS.find(p => p.id === platformId);
                            return (
                              <SelectItem key={platformId} value={platformId}>
                                {platform?.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Text Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs">Headline</Label>
                        <Textarea rows={2} placeholder="Enter headline..." className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">0/60 chars</p>
                      </div>
                      <div>
                        <Label className="text-xs">Body</Label>
                        <Textarea rows={3} placeholder="Enter body text..." className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">0/200 chars</p>
                      </div>
                      <div>
                        <Label className="text-xs">Hashtags</Label>
                        <Input placeholder="#hashtag1 #hashtag2" className="mt-1" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Customization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Background
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Palette className="w-4 h-4 mr-2" />
                        Background Color
                      </Button>
                      <div className="space-y-2 pt-2 border-t">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked />
                          Show logo
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked />
                          Show icon
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" />
                          Add border
                        </label>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Panel - Canvas */}
                <div className="col-span-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Canvas</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">-</Button>
                          <span className="text-sm">100%</span>
                          <Button variant="outline" size="sm">+</Button>
                          <Button variant="outline" size="sm">Fit</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <LayoutGrid className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">Canvas Editor</p>
                          <p className="text-xs text-gray-500">Click text to edit inline</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Feed Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-2">How it looks in the feed:</p>
                        <div className="bg-white rounded border p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                              <p className="text-xs font-bold">{currentProject?.name}</p>
                              <p className="text-xs text-gray-500">Just now</p>
                            </div>
                          </div>
                          <div className="aspect-video bg-gray-200 rounded mb-2"></div>
                          <p className="text-xs">Preview caption text...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel */}
                <div className="col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Readiness Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Template selected</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Caption added</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>Add background (optional)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>Alt text needed</span>
                      </div>
                      <Progress value={75} className="mt-4" />
                      <p className="text-xs text-gray-600 text-center">75% Complete</p>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Platform Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {wizardState.selectedPlatforms.map((platformId, idx) => {
                        const platform = PLATFORMS.find(p => p.id === platformId);
                        return (
                          <div key={platformId} className="flex items-center justify-between text-sm">
                            <span>{platform?.name}</span>
                            <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                              {idx === 0 ? 'Editing' : 'Ready'}
                            </Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Schedule & Review */}
          {wizardState.step === 8 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Schedule & Review</h2>
                <p className="text-gray-600">Set publishing times for your optimized posts</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {wizardState.selectedPlatforms.map((platformId, idx) => {
                  const platform = PLATFORMS.find(p => p.id === platformId);
                  const Icon = platform?.icon;
                  return (
                    <Card key={platformId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {Icon && <Icon className={`w-6 h-6 ${platform.color}`} />}
                            <div>
                              <CardTitle>POST {idx + 1} OF {wizardState.selectedPlatforms.length}: {platform?.name.toUpperCase()}</CardTitle>
                              <CardDescription>Configure scheduling for this platform</CardDescription>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-3">
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <div className="col-span-9 space-y-4">
                            <div>
                              <Label className="text-xs text-gray-600">Caption Preview</Label>
                              <p className="text-sm mt-1 line-clamp-2">
                                {wizardState.generatedVariants[platformId]?.caption || 'No caption generated'}
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs">Date</Label>
                                <Input type="date" className="mt-1" />
                              </div>
                              <div>
                                <Label className="text-xs">Time</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="09:00">9:00 AM</SelectItem>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                    <SelectItem value="12:00">12:00 PM</SelectItem>
                                    <SelectItem value="15:00">3:00 PM</SelectItem>
                                    <SelectItem value="17:00">5:00 PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Timezone</Label>
                                <Select defaultValue="est">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="est">EST</SelectItem>
                                    <SelectItem value="pst">PST</SelectItem>
                                    <SelectItem value="cst">CST</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded p-3 text-sm">
                              <Sparkles className="w-4 h-4 inline text-blue-600 mr-2" />
                              <span className="text-blue-900">Optimal time: Tuesday 10am</span>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" />
                              Send notification 1 hour before
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="publishing" defaultChecked />
                      <div>
                        <p className="font-medium text-sm">Schedule all posts</p>
                        <p className="text-xs text-gray-600">Recommended - Publish at optimal times</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="publishing" />
                      <div>
                        <p className="font-medium text-sm">Save as drafts</p>
                        <p className="text-xs text-gray-600">Review and schedule manually later</p>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t px-6 py-4 fixed bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={wizardState.step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              {wizardState.step === 7 && (
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview All
                </Button>
              )}
              {wizardState.step === 8 ? (
                <>
                  <Button variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save Drafts
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                    // In production, save to Airtable and schedule
                    alert('Posts scheduled successfully!');
                    setMode('selection');
                    setWizardState({
                      step: 1,
                      selectedPlatforms: [],
                      generatedVariants: {},
                      canvasData: {},
                      schedulingData: {}
                    });
                  }}>
                    <Send className="w-4 h-4 mr-2" />
                    Schedule Posts
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (wizardState.step === 3 && wizardState.selectedPlatforms.length > 0) {
                      generatePlatformVariants();
                    } else {
                      nextStep();
                    }
                  }}
                  disabled={
                    (wizardState.step === 1 && !wizardState.contentPillar) ||
                    (wizardState.step === 2 && !wizardState.selectedContent) ||
                    (wizardState.step === 3 && wizardState.selectedPlatforms.length === 0) ||
                    (wizardState.step === 6 && !wizardState.selectedTemplate)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {wizardState.step === 3 ? 'Generate Variants' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

