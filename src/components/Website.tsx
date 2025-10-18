import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  ExternalLink,
  Edit,
  Save,
  X,
  Send,
  AlertCircle,
  Target,
  MessageSquare,
  Pencil,
  BarChart3,
  Users,
  Mail,
  TrendingUp,
  Eye,
  MousePointer,
  Calendar,
  Download,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from "sonner";

interface WebsiteProps {
  user: User;
  currentProject?: Project;
}

interface WebsiteAnalytics {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{
    page: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  source: string;
  status: 'active' | 'unsubscribed';
}

interface MobileOptimization {
  score: number;
  issues: Array<{
    id: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    fix: string;
    status: 'fixed' | 'pending' | 'ignored';
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  lastChecked: Date;
}

export function Website({ user, currentProject }: WebsiteProps) {
  const isAdmin = user.role === 'SuperAdmin';
  
  // Project-specific website URLs and content
  const getProjectWebsiteUrl = (project?: Project): string => {
    if (!project) return "https://example.com";
    
    switch (project.id) {
      case 'coaction':
        return ""; // Coaction Group doesn't have a client website
      case 'zrmc':
        return "https://zrmc.org";
      case 'tgmc':
        return "https://tgmc.org";
      default:
        return "https://example.com";
    }
  };

  const getProjectNextSteps = (project?: Project): string => {
    if (!project) return "";
    
    switch (project.id) {
      case 'coaction':
        return ""; // Coaction Group doesn't have website next steps
      case 'zrmc':
        return "Update homepage hero section with new messaging, optimize contact form for mobile, add patient testimonials section";
      case 'tgmc':
        return "Add physician directory with specialties, update services pages with advanced medical equipment, integrate online appointment scheduling";
      default:
        return "";
    }
  };

  // Next steps state
  const [nextSteps, setNextSteps] = useState("");
  const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);
  const [nextStepsInput, setNextStepsInput] = useState("");

  // Edit request form state
  const [editRequest, setEditRequest] = useState({
    section: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<WebsiteAnalytics>({
    visitors: 0,
    pageViews: 0,
    bounceRate: 0,
    avgSessionDuration: '0:00',
    topPages: [],
    trafficSources: []
  });

  // Email subscribers state
  const [emailSubscribers, setEmailSubscribers] = useState<EmailSubscriber[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Mobile optimization state
  const [mobileOptimization, setMobileOptimization] = useState<MobileOptimization>({
    score: 0,
    issues: [],
    recommendations: [],
    lastChecked: new Date()
  });
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  const websiteUrl = getProjectWebsiteUrl(currentProject);

  // Initialize project-specific data
  useEffect(() => {
    if (currentProject) {
      const savedNextSteps = localStorage.getItem(`website-next-steps-${currentProject.id}`);
      if (savedNextSteps) {
        setNextSteps(savedNextSteps);
        setNextStepsInput(savedNextSteps);
      } else {
        const defaultNextSteps = getProjectNextSteps(currentProject);
        setNextSteps(defaultNextSteps);
        setNextStepsInput(defaultNextSteps);
      }

      // Load analytics and email data
      loadWebsiteData();
    }
  }, [currentProject]);

  // Load website analytics and email subscribers
  const loadWebsiteData = async () => {
    setIsLoadingAnalytics(true);
    try {
      // Simulate loading analytics data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show placeholder analytics data
      const placeholderAnalytics: WebsiteAnalytics = {
        visitors: 0,
        pageViews: 0,
        bounceRate: 0,
        avgSessionDuration: '--',
        topPages: [],
        trafficSources: []
      };

      // Mock email subscribers data
      const mockSubscribers: EmailSubscriber[] = [
        { id: '1', email: 'john.doe@example.com', name: 'John Doe', subscribedAt: new Date('2024-01-15'), source: 'Homepage', status: 'active' },
        { id: '2', email: 'jane.smith@example.com', name: 'Jane Smith', subscribedAt: new Date('2024-01-14'), source: 'Contact Form', status: 'active' },
        { id: '3', email: 'mike.wilson@example.com', subscribedAt: new Date('2024-01-13'), source: 'Homepage', status: 'active' },
        { id: '4', email: 'sarah.jones@example.com', name: 'Sarah Jones', subscribedAt: new Date('2024-01-12'), source: 'Newsletter', status: 'active' },
        { id: '5', email: 'bob.brown@example.com', subscribedAt: new Date('2024-01-11'), source: 'Homepage', status: 'unsubscribed' }
      ];

      setAnalytics(mockAnalytics);
      setEmailSubscribers(mockSubscribers);
    } catch (error) {
      console.error('Error loading website data:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleSaveNextSteps = () => {
    setNextSteps(nextStepsInput);
    setIsEditingNextSteps(false);
    
    // Save to project-specific localStorage
    if (currentProject) {
      localStorage.setItem(`website-next-steps-${currentProject.id}`, nextStepsInput);
    }
    
    toast.success("Next steps updated successfully!");
  };

  const handleCancelNextSteps = () => {
    setNextStepsInput(nextSteps);
    setIsEditingNextSteps(false);
  };

  const handleSubmitRequest = () => {
    if (!editRequest.section.trim() || !editRequest.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In a real implementation, this would send to a backend
    toast.success("Edit request submitted successfully!");
    
    // Reset form
    setEditRequest({
      section: '',
      description: '',
      priority: 'medium'
    });
  };

  const checkMobileOptimization = async () => {
    setIsCheckingMobile(true);
    
    try {
      // Simulate mobile optimization check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOptimization: MobileOptimization = {
        score: 78,
        issues: [
          {
            id: '1',
            title: 'Viewport meta tag missing',
            severity: 'high',
            description: 'The viewport meta tag is not properly configured for mobile devices',
            fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the head section',
            status: 'pending'
          },
          {
            id: '2',
            title: 'Text too small to read',
            severity: 'medium',
            description: 'Some text elements are smaller than 16px, making them hard to read on mobile',
            fix: 'Increase font size to at least 16px for body text',
            status: 'pending'
          },
          {
            id: '3',
            title: 'Touch targets too small',
            severity: 'medium',
            description: 'Some buttons and links are smaller than 44px, making them hard to tap',
            fix: 'Increase button and link sizes to at least 44px',
            status: 'pending'
          },
          {
            id: '4',
            title: 'Images not optimized',
            severity: 'low',
            description: 'Some images are not optimized for mobile devices',
            fix: 'Use responsive images with srcset and sizes attributes',
            status: 'pending'
          }
        ],
        recommendations: [
          {
            id: '1',
            title: 'Implement responsive design',
            impact: 'high',
            description: 'Use CSS Grid and Flexbox for better mobile layouts',
            effort: 'medium'
          },
          {
            id: '2',
            title: 'Add mobile navigation',
            impact: 'high',
            description: 'Implement a hamburger menu for better mobile navigation',
            effort: 'low'
          },
          {
            id: '3',
            title: 'Optimize images',
            impact: 'medium',
            description: 'Compress and resize images for faster mobile loading',
            effort: 'low'
          },
          {
            id: '4',
            title: 'Add touch gestures',
            impact: 'medium',
            description: 'Implement swipe gestures for better mobile interaction',
            effort: 'high'
          }
        ],
        lastChecked: new Date()
      };
      
      setMobileOptimization(mockOptimization);
      toast.success("Mobile optimization check completed!");
    } catch (error) {
      console.error('Error checking mobile optimization:', error);
      toast.error("Failed to check mobile optimization");
    } finally {
      setIsCheckingMobile(false);
    }
  };

  const updateIssueStatus = (issueId: string, status: 'fixed' | 'pending' | 'ignored') => {
    setMobileOptimization(prev => ({
      ...prev,
      issues: prev.issues.map(issue => 
        issue.id === issueId ? { ...issue, status } : issue
      )
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Website</h1>
          <p className="text-foreground/70">
            {isAdmin 
              ? `Manage and update the ${currentProject?.name || 'organization'} website`
              : `View and request changes to the ${currentProject?.name || 'organization'} website`
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => window.open(websiteUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Website
          </Button>
        </div>
      </div>

      {/* Website URL Display */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <ExternalLink className="w-5 h-5 mr-2 text-primary" />
            Website URL
          </CardTitle>
          <CardDescription>Your live website address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-mono text-sm text-foreground">{websiteUrl}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(websiteUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Website Preview */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            Live Website Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-accent/20 rounded-lg overflow-hidden bg-background">
            <iframe
              src={websiteUrl}
              className="w-full h-[600px]"
              title="Website Preview"
              loading="lazy"
              sandbox="allow-same-origin allow-scripts allow-navigation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Website Analytics Section */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Website Analytics
          </CardTitle>
          <CardDescription>Traffic and performance metrics for your website</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70">Total Visitors</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.visitors.toLocaleString()}</p>
                    </div>
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/70">Page Views</p>
                      <p className="text-2xl font-bold text-foreground">{analytics.pageViews.toLocaleString()}</p>
                    </div>
                    <MousePointer className="w-8 h-8 text-accent" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Bounce Rate</p>
                      <p className="text-2xl font-bold text-green-900">{analytics.bounceRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Avg Session</p>
                      <p className="text-2xl font-bold text-blue-900">{analytics.avgSessionDuration}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Top Pages</h4>
                <div className="space-y-3">
                  {analytics.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="font-medium text-foreground">{page.page}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-foreground/70">{page.views.toLocaleString()} views</span>
                        <Badge variant="secondary">{page.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Traffic Sources</h4>
                <div className="space-y-3">
                  {analytics.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="font-medium text-foreground">{source.source}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-foreground/70">{source.visitors.toLocaleString()} visitors</span>
                        <Badge variant="outline">{source.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Subscribers Section */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" />
                Email Subscribers
              </CardTitle>
              <CardDescription>Email addresses collected from website opt-ins</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subscriber Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-2xl font-bold text-primary">{emailSubscribers.length}</p>
                <p className="text-sm text-foreground/70">Total Subscribers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-900">{emailSubscribers.filter(s => s.status === 'active').length}</p>
                <p className="text-sm text-green-700">Active</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-900">{emailSubscribers.filter(s => s.status === 'unsubscribed').length}</p>
                <p className="text-sm text-red-700">Unsubscribed</p>
              </div>
            </div>

            {/* Subscriber List */}
            <div className="space-y-3">
              {emailSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{subscriber.email}</p>
                      {subscriber.name && (
                        <p className="text-sm text-foreground/70">{subscriber.name}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                          {subscriber.status}
                        </Badge>
                        <span className="text-xs text-foreground/60">via {subscriber.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/70">
                      {subscriber.subscribedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Section */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Next Steps
            </CardTitle>
            {isAdmin && !isEditingNextSteps && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingNextSteps(true)}
                className="text-primary hover:text-primary"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription>Upcoming website improvements and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingNextSteps && isAdmin ? (
            <div className="space-y-4">
              <Textarea
                value={nextStepsInput}
                onChange={(e) => setNextStepsInput(e.target.value)}
                placeholder="Enter upcoming website edits and priorities..."
                className="min-h-24 bg-background border-accent/20"
              />
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveNextSteps}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelNextSteps}
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 p-4 rounded-lg border border-accent/20">
              <p className="text-foreground/80 leading-relaxed">
                {nextSteps || "No upcoming website changes planned at this time."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Request Form */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-accent" />
            Request Website Edit
          </CardTitle>
          <CardDescription>Submit requests for website changes or improvements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground/70">Section/Page *</label>
              <Input
                placeholder="e.g., Homepage, Contact Page, Services"
                value={editRequest.section}
                onChange={(e) => setEditRequest(prev => ({ ...prev, section: e.target.value }))}
                className="bg-background border-accent/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/70">Priority</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-background border border-accent/20 rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={editRequest.priority}
                onChange={(e) => setEditRequest(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground/70">Description *</label>
            <Textarea
              placeholder="Describe the changes you'd like to see made..."
              value={editRequest.description}
              onChange={(e) => setEditRequest(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-32 bg-background border-accent/20"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-accent/20">
            <div className="flex items-center text-sm text-foreground/60">
              <AlertCircle className="w-4 h-4 mr-2" />
              Requests will be reviewed within 2-3 business days
            </div>
            <Button 
              onClick={handleSubmitRequest}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Optimization Checker */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-foreground">Mobile Optimization</CardTitle>
                <CardDescription>Check and improve your website's mobile performance</CardDescription>
              </div>
            </div>
            <Button 
              onClick={checkMobileOptimization}
              disabled={isCheckingMobile}
              className="gap-2"
            >
              {isCheckingMobile ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Check Mobile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mobileOptimization.score > 0 ? (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-accent/20">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-foreground">
                    {mobileOptimization.score}/100
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Mobile Score</p>
                    <p className="text-xs text-foreground/60">
                      Last checked: {mobileOptimization.lastChecked.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mobileOptimization.score >= 80 ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : mobileOptimization.score >= 60 ? (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {mobileOptimization.score >= 80 ? 'Good' : mobileOptimization.score >= 60 ? 'Needs Improvement' : 'Poor'}
                  </span>
                </div>
              </div>

              {/* Issues */}
              {mobileOptimization.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Issues Found</h3>
                  <div className="space-y-3">
                    {mobileOptimization.issues.map((issue) => (
                      <div key={issue.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-foreground">{issue.title}</h4>
                              <Badge 
                                variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {issue.severity}
                              </Badge>
                              <Badge 
                                variant={issue.status === 'fixed' ? 'default' : issue.status === 'ignored' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {issue.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/70 mb-2">{issue.description}</p>
                            <p className="text-sm text-foreground/60">
                              <strong>Fix:</strong> {issue.fix}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateIssueStatus(issue.id, 'fixed')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Fixed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateIssueStatus(issue.id, 'ignored')}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Ignore
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {mobileOptimization.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mobileOptimization.recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{rec.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={rec.impact === 'high' ? 'default' : rec.impact === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {rec.impact} impact
                            </Badge>
                            <Badge 
                              variant={rec.effort === 'low' ? 'default' : rec.effort === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {rec.effort} effort
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/70">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No mobile optimization data</h3>
              <p className="text-foreground/60 mb-4">
                Run a mobile optimization check to analyze your website's mobile performance
              </p>
              <Button onClick={checkMobileOptimization} disabled={isCheckingMobile}>
                {isCheckingMobile ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Check Mobile Optimization
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}