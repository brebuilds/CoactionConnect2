import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { IntegrationSettings } from './IntegrationSettings';
import { UserManagement } from './UserManagement';
import { Project } from './ProjectManager';
import { User } from '../App';
import { Users, Settings as SettingsIcon, Plug, Shield, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsProps {
  user: User;
  currentProject: Project;
}

interface SocialMediaAPI {
  platform: string;
  apiKey: string;
  secret: string;
  isConnected: boolean;
  lastTest?: Date;
}

export function Settings({ user, currentProject }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('integrations');
  const [socialAPIs, setSocialAPIs] = useState<SocialMediaAPI[]>([
    { platform: 'Facebook', apiKey: '', secret: '', isConnected: false },
    { platform: 'Instagram', apiKey: '', secret: '', isConnected: false },
    { platform: 'Twitter', apiKey: '', secret: '', isConnected: false },
    { platform: 'LinkedIn', apiKey: '', secret: '', isConnected: false }
  ]);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);

  // Check if user has admin privileges
  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';

  const updateAPIKey = (platform: string, field: 'apiKey' | 'secret', value: string) => {
    setSocialAPIs(prev => prev.map(api => 
      api.platform === platform 
        ? { ...api, [field]: value }
        : api
    ));
  };

  const testConnection = async (platform: string) => {
    setIsTestingConnection(platform);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSocialAPIs(prev => prev.map(api => 
      api.platform === platform 
        ? { ...api, isConnected: true, lastTest: new Date() }
        : api
    ));
    
    setIsTestingConnection(null);
  };

  const getPlatformIcon = (platform: string) => {
    const colors = {
      'Facebook': '#1877F2',
      'Instagram': '#E4405F', 
      'Twitter': '#1DA1F2',
      'LinkedIn': '#0077B5'
    };
    
    return (
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: colors[platform as keyof typeof colors] }}
      >
        {platform.charAt(0)}
      </div>
    );
  };
  
  // In a production environment, this would come from the user's auth session
  // For now, we'll let UserManagement use its default mock token

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage system configurations and user access for {currentProject.name}
          </p>
        </div>
      </div>

      {/* Admin Access Check */}
      {!isAdmin ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground max-w-md">
                You need administrator privileges to access system settings. 
                Contact your system administrator if you need access to these features.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Settings Tabs */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="social-apis" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Social APIs
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationSettings user={user} currentProject={currentProject} />
          </TabsContent>

          <TabsContent value="social-apis" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Social Media API Keys</h2>
                <p className="text-muted-foreground">
                  Configure API keys and OAuth credentials for social media platforms to enable posting and analytics.
                </p>
              </div>

              <div className="grid gap-6">
                {socialAPIs.map((api) => (
                  <Card key={api.platform} className="border-accent/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(api.platform)}
                          <div>
                            <CardTitle className="text-foreground">{api.platform}</CardTitle>
                            <CardDescription>
                              {api.isConnected ? 'Connected' : 'Not connected'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {api.isConnected ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${api.platform}-key`}>API Key</Label>
                          <Input
                            id={`${api.platform}-key`}
                            type="password"
                            placeholder="Enter your API key"
                            value={api.apiKey}
                            onChange={(e) => updateAPIKey(api.platform, 'apiKey', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${api.platform}-secret`}>API Secret</Label>
                          <Input
                            id={`${api.platform}-secret`}
                            type="password"
                            placeholder="Enter your API secret"
                            value={api.secret}
                            onChange={(e) => updateAPIKey(api.platform, 'secret', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(api.platform)}
                            disabled={!api.apiKey || !api.secret || isTestingConnection === api.platform}
                          >
                            {isTestingConnection === api.platform ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Test Connection
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Get API Key
                          </Button>
                        </div>
                        {api.lastTest && (
                          <span className="text-xs text-muted-foreground">
                            Last tested: {api.lastTest.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">API Key Security</h4>
                      <p className="text-sm text-blue-800">
                        Your API keys are encrypted and stored securely. Never share them with unauthorized users. 
                        For production use, consider using OAuth 2.0 for enhanced security.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      )}

      {/* Settings Overview Cards for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('integrations')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">API Integrations</CardTitle>
                  <CardDescription className="text-xs">Connected platforms</CardDescription>
                </div>
                <Plug className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold text-foreground">14 Available</p>
              <p className="text-xs text-muted-foreground">Social, Analytics, CRM</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('social-apis')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">Social Media APIs</CardTitle>
                  <CardDescription className="text-xs">API keys & OAuth</CardDescription>
                </div>
                <Key className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold text-foreground">
                {socialAPIs.filter(api => api.isConnected).length}/4 Connected
              </p>
              <p className="text-xs text-muted-foreground">Facebook, Instagram, Twitter, LinkedIn</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('users')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">User Management</CardTitle>
                  <CardDescription className="text-xs">System users & roles</CardDescription>
                </div>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold text-foreground">Active Users</p>
              <p className="text-xs text-muted-foreground">Create & manage accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">Project Settings</CardTitle>
                  <CardDescription className="text-xs">Branding & configuration</CardDescription>
                </div>
                <SettingsIcon className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold text-foreground">{currentProject.name}</p>
              <p className="text-xs text-muted-foreground">Theme & customization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">Security & Access</CardTitle>
                  <CardDescription className="text-xs">Permissions & auth</CardDescription>
                </div>
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-lg font-bold text-foreground">Protected</p>
              <p className="text-xs text-muted-foreground">Role-based access</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}