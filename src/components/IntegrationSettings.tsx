import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  IntegrationManager, 
  Integration, 
  IntegrationType, 
  INTEGRATION_CONFIGS,
  IntegrationStatus 
} from './IntegrationManager';
import { Project } from './ProjectManager';
import { User } from '../App';
import { ExternalLink, Settings, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface IntegrationSettingsProps {
  user: User;
  currentProject: Project;
}

export function IntegrationSettings({ user, currentProject }: IntegrationSettingsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIntegrations();
  }, [currentProject.id]);

  const loadIntegrations = () => {
    const projectIntegrations = IntegrationManager.getIntegrations(currentProject.id);
    setIntegrations(projectIntegrations);
  };

  const handleConfigureIntegration = (type: IntegrationType) => {
    const existing = integrations.find(i => i.type === type);
    if (existing) {
      setSelectedIntegration(existing);
      // Pre-populate form with existing credentials (excluding sensitive data)
      const safeData: Record<string, string> = {};
      if (existing.credentials) {
        Object.keys(existing.credentials).forEach(key => {
          if (!['accessToken', 'refreshToken', 'clientSecret', 'apiSecret'].includes(key)) {
            safeData[key] = existing.credentials![key] || '';
          }
        });
      }
      setFormData(safeData);
    } else {
      setSelectedIntegration({
        id: '',
        type,
        projectId: currentProject.id,
        status: 'disconnected'
      });
      setFormData({});
    }
    setIsConfiguring(true);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    const updatedIntegration = IntegrationManager.updateIntegration(currentProject.id, {
      ...selectedIntegration,
      credentials: {
        ...selectedIntegration.credentials,
        ...formData
      },
      status: 'pending' as IntegrationStatus
    });

    // Test the connection
    setTestingConnection(selectedIntegration.type);
    try {
      const testResult = await IntegrationManager.testConnection(updatedIntegration);
      
      const finalStatus: IntegrationStatus = testResult.success ? 'connected' : 'error';
      const finalIntegration = IntegrationManager.updateIntegration(currentProject.id, {
        ...updatedIntegration,
        status: finalStatus,
        error: testResult.error,
        accountName: testResult.data?.accountName,
        accountId: testResult.data?.accountId,
        connectedAt: testResult.success ? new Date() : undefined,
        lastSyncAt: testResult.success ? new Date() : undefined
      });

      loadIntegrations();
      setIsConfiguring(false);
      setSelectedIntegration(null);
      setFormData({});
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleRemoveIntegration = (type: IntegrationType) => {
    IntegrationManager.removeIntegration(currentProject.id, type);
    loadIntegrations();
  };

  const handleRetestConnection = async (integration: Integration) => {
    setTestingConnection(integration.type);
    try {
      const testResult = await IntegrationManager.testConnection(integration);
      const status: IntegrationStatus = testResult.success ? 'connected' : 'error';
      
      IntegrationManager.updateIntegration(currentProject.id, {
        ...integration,
        status,
        error: testResult.error,
        lastSyncAt: testResult.success ? new Date() : integration.lastSyncAt
      });
      
      loadIntegrations();
    } catch (error) {
      console.error('Error retesting connection:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    const variants = {
      connected: 'default',
      error: 'destructive',
      pending: 'secondary',
      disconnected: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = IntegrationManager.getStats(currentProject.id);
  const availableIntegrations = Object.keys(INTEGRATION_CONFIGS) as IntegrationType[];
  const socialIntegrations = availableIntegrations.filter(type => 
    ['facebook_pages', 'instagram_business', 'linkedin_company', 'twitter_api', 'youtube_channel', 'tiktok_business', 'pinterest_business'].includes(type)
  );
  const analyticsIntegrations = availableIntegrations.filter(type => 
    ['google_analytics', 'google_business'].includes(type)
  );
  const emailIntegrations = availableIntegrations.filter(type => 
    ['mailchimp', 'constant_contact'].includes(type)
  );
  const crmIntegrations = availableIntegrations.filter(type => 
    ['hubspot', 'salesforce'].includes(type)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Integration Settings</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts, analytics platforms, and business tools to {currentProject.name}.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total > 0 ? Math.round((stats.connected / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Progress 
                  value={stats.total > 0 ? (stats.connected / stats.total) * 100 : 0} 
                  className="w-6 h-6"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Categories */}
      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialIntegrations.map(type => {
              const config = INTEGRATION_CONFIGS[type];
              const integration = integrations.find(i => i.type === type);
              
              return (
                <Card key={type} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{config.name}</CardTitle>
                          <CardDescription className="text-xs">{config.description}</CardDescription>
                        </div>
                      </div>
                      {integration && getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {integration?.status === 'connected' && integration.accountName && (
                      <div className="mb-3 p-2 bg-green-50 rounded text-xs">
                        <p className="font-medium text-green-800">Connected to: {integration.accountName}</p>
                        {integration.lastSyncAt && (
                          <p className="text-green-600">Last sync: {integration.lastSyncAt.toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                    {integration?.status === 'error' && integration.error && (
                      <div className="mb-3 p-2 bg-red-50 rounded text-xs">
                        <p className="font-medium text-red-800">Error:</p>
                        <p className="text-red-600">{integration.error}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration?.status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleConfigureIntegration(type)}
                        className="flex-1"
                      >
                        {integration?.status === 'connected' ? 'Reconfigure' : 'Connect'}
                      </Button>
                      {integration && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetestConnection(integration)}
                          disabled={testingConnection === type}
                        >
                          {testingConnection === type ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                      {integration && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveIntegration(type)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsIntegrations.map(type => {
              const config = INTEGRATION_CONFIGS[type];
              const integration = integrations.find(i => i.type === type);
              
              return (
                <Card key={type} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{config.name}</CardTitle>
                          <CardDescription className="text-xs">{config.description}</CardDescription>
                        </div>
                      </div>
                      {integration && getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration?.status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleConfigureIntegration(type)}
                        className="flex-1"
                      >
                        {integration?.status === 'connected' ? 'Reconfigure' : 'Connect'}
                      </Button>
                      {integration && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetestConnection(integration)}
                          disabled={testingConnection === type}
                        >
                          {testingConnection === type ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailIntegrations.map(type => {
              const config = INTEGRATION_CONFIGS[type];
              const integration = integrations.find(i => i.type === type);
              
              return (
                <Card key={type} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{config.name}</CardTitle>
                          <CardDescription className="text-xs">{config.description}</CardDescription>
                        </div>
                      </div>
                      {integration && getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration?.status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleConfigureIntegration(type)}
                        className="flex-1"
                      >
                        {integration?.status === 'connected' ? 'Reconfigure' : 'Connect'}
                      </Button>
                      {integration && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetestConnection(integration)}
                          disabled={testingConnection === type}
                        >
                          {testingConnection === type ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crmIntegrations.map(type => {
              const config = INTEGRATION_CONFIGS[type];
              const integration = integrations.find(i => i.type === type);
              
              return (
                <Card key={type} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <CardTitle className="text-sm">{config.name}</CardTitle>
                          <CardDescription className="text-xs">{config.description}</CardDescription>
                        </div>
                      </div>
                      {integration && getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration?.status === 'connected' ? 'outline' : 'default'}
                        onClick={() => handleConfigureIntegration(type)}
                        className="flex-1"
                      >
                        {integration?.status === 'connected' ? 'Reconfigure' : 'Connect'}
                      </Button>
                      {integration && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetestConnection(integration)}
                          disabled={testingConnection === type}
                        >
                          {testingConnection === type ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && (
                <>
                  <span className="text-xl">{INTEGRATION_CONFIGS[selectedIntegration.type].icon}</span>
                  Configure {INTEGRATION_CONFIGS[selectedIntegration.type].name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration && (
                <>
                  {INTEGRATION_CONFIGS[selectedIntegration.type].description}
                  {INTEGRATION_CONFIGS[selectedIntegration.type].docs && (
                    <div className="mt-2">
                      <a 
                        href={INTEGRATION_CONFIGS[selectedIntegration.type].docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        View API Documentation <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              {INTEGRATION_CONFIGS[selectedIntegration.type].requiredFields.map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm font-medium">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Input
                    id={field}
                    type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={`Enter your ${field}`}
                  />
                </div>
              ))}
              
              <Separator />
              
              <div className="flex gap-2">
                <Button onClick={handleSaveIntegration} className="flex-1">
                  {testingConnection === selectedIntegration.type ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    'Save & Test Connection'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}