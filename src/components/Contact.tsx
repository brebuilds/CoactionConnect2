import React, { useState } from 'react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Send, 
  AlertCircle,
  CheckCircle,
  Paperclip,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface ContactProps {
  user: User;
  currentProject?: Project;
}

export function Contact({ user, currentProject }: ContactProps) {
  // Project-specific contact information
  const getProjectContactInfo = (project?: Project) => {
    if (!project) return { email: 'support@example.com', phone: '' };
    
    switch (project.id) {
      case 'coaction':
        return {
          email: 'bre@brebuilds.com',
          phone: '910.721.8068',
          subject: 'Coaction Group: Contact Request',
          description: 'Strategic partnerships and collaboration inquiries'
        };
      case 'zrmc':
        return {
          email: 'bre@brebuilds.com',
          phone: '435-901-7560',
          subject: 'ZRMC: Contact Request',
          description: 'Healthcare services and patient support'
        };
      case 'tgmc':
        return {
          email: 'contact@tgmc.org',
          phone: '555-TGMC-CARE',
          subject: 'TGMC: Contact Request', 
          description: 'Advanced medical care and patient inquiries'
        };
      default:
        return {
          email: 'support@example.com',
          phone: '',
          subject: 'Contact Request',
          description: 'General inquiries and support'
        };
    }
  };

  const contactInfo = getProjectContactInfo(currentProject);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    toast.success("File removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Prepare email content
      const emailContent = `
New Contact Request from ${currentProject?.name || 'Portal'} Dashboard

From: ${formData.name} (${formData.email})
User Role: ${user.role}
Project: ${currentProject?.name || 'Unknown'}

Message:
${formData.message}

${selectedFile ? `Attachment: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)}KB)` : 'No attachment'}

---
Sent via ${currentProject?.name || 'Portal'} Dashboard at ${new Date().toLocaleString()}
      `;

      // Create mailto link
      const mailtoLink = `mailto:${contactInfo.email}?subject=${encodeURIComponent(contactInfo.subject)}&body=${encodeURIComponent(emailContent)}`;
      
      // Open mailto link
      window.open(mailtoLink, '_blank');
      
      setSubmitStatus('success');
      toast.success("Message sent successfully!");
      
      // Reset form
      setFormData({
        name: user.name,
        email: user.email,
        message: ''
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-foreground mb-2">Contact</h1>
        <p className="text-foreground/70">
          Get in touch with the {currentProject?.name || 'organization'} team for support and inquiries
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                Send Message
              </CardTitle>
              <CardDescription>{contactInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {submitStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your message has been sent successfully! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    There was an issue sending your message. Please try again or contact us directly.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/70">Name *</label>
                    <Input
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-background border-accent/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/70">Email *</label>
                    <Input
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-background border-accent/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground/70">Message *</label>
                  <Textarea
                    placeholder="How can we help you?"
                    className="min-h-32 bg-background border-accent/20"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground/70">Attachment (Optional)</label>
                  
                  {selectedFile ? (
                    <div className="border border-accent/20 rounded-lg p-4 bg-secondary/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{selectedFile.name}</p>
                            <p className="text-xs text-foreground/60">
                              {(selectedFile.size / 1024).toFixed(1)}KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-foreground/60 hover:text-foreground"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-accent/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-6 h-6 text-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-foreground/70">Click to upload or drag and drop</p>
                        <p className="text-xs text-foreground/50 mt-1">PDF, PNG, JPG, DOC up to 10MB</p>
                      </label>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Contact Information</CardTitle>
              <CardDescription>Get in touch directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg border border-accent/20">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-foreground">Email Support</p>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>
              
              {contactInfo.phone && (
                <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg border border-accent/20">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground">Phone Support</p>
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-foreground">
                  <strong>Response Time:</strong> We typically respond within 24 hours during business days
                </p>
              </div>
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                <p className="text-sm text-foreground">
                  <strong>Attachments:</strong> Include relevant files to help us assist you better
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}