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
  Pencil
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface WebsiteProps {
  user: User;
  currentProject?: Project;
}

export function Website({ user, currentProject }: WebsiteProps) {
  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
  
  // Project-specific website URLs and content
  const getProjectWebsiteUrl = (project?: Project): string => {
    if (!project) return "https://example.com";
    
    switch (project.id) {
      case 'coaction':
        return "https://coactiongroup.com";
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
        return "Update partnerships page with new member companies, enhance about us section with leadership profiles, optimize contact forms for enterprise leads";
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
    }
  }, [currentProject]);

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
    </div>
  );
}