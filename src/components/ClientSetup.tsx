import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Upload, Settings, Palette, Building2, Save, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ClientSetupProps {
  onSetupComplete: (settings: ClientSettings) => void;
  existingSettings?: ClientSettings;
}

export interface ClientSettings {
  companyName: string;
  companyDescription: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  adminCredentials: {
    username: string;
    password: string;
    name: string;
    email: string;
  };
  advisorCredentials: {
    username: string;
    password: string;
    name: string;
    email: string;
  };
}

export function ClientSetup({ onSetupComplete, existingSettings }: ClientSetupProps) {
  const [settings, setSettings] = useState<ClientSettings>(existingSettings || {
    companyName: '',
    companyDescription: '',
    logo: '',
    colors: {
      primary: '#7A9BB8',
      secondary: '#F5F2EF',
      accent: '#E8DDD4',
      text: '#3C3C3C',
      background: '#ffffff'
    },
    adminCredentials: {
      username: 'admin',
      password: '',
      name: 'Administrator',
      email: ''
    },
    advisorCredentials: {
      username: 'advisor',
      password: '',
      name: 'Team Advisor',
      email: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const steps = [
    { title: 'Company Info', icon: Building2 },
    { title: 'Brand Colors', icon: Palette },
    { title: 'User Access', icon: Settings },
    { title: 'Review', icon: Eye }
  ];

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSettings(prev => ({ ...prev, logo: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
  };

  const applyPreviewColors = () => {
    if (previewMode) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', settings.colors.primary);
      root.style.setProperty('--color-secondary', settings.colors.secondary);
      root.style.setProperty('--color-accent', settings.colors.accent);
      root.style.setProperty('--color-foreground', settings.colors.text);
      root.style.setProperty('--color-background', settings.colors.background);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applyPreviewColors();
    } else {
      // Reset to default colors
      const root = document.documentElement;
      root.style.setProperty('--color-primary', '#7A9BB8');
      root.style.setProperty('--color-secondary', '#F5F2EF');
      root.style.setProperty('--color-accent', '#E8DDD4');
      root.style.setProperty('--color-foreground', '#3C3C3C');
      root.style.setProperty('--color-background', '#ffffff');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return settings.companyName.trim() !== '' && settings.logo !== '';
      case 1:
        return Object.values(settings.colors).every(color => color !== '');
      case 2:
        return settings.adminCredentials.password !== '' && 
               settings.advisorCredentials.password !== '' &&
               settings.adminCredentials.email !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    // Apply final colors
    applyPreviewColors();
    onSetupComplete(settings);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter your company name"
                className="text-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={settings.companyDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, companyDescription: e.target.value }))}
                placeholder="Brief description of your company or services"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="logo">Company Logo *</Label>
              <div className="space-y-4">
                {settings.logo && (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <img src={settings.logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <p className="text-sm text-gray-500">
                  Upload your company logo. This will appear in the top-left corner of the dashboard.
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Brand Colors</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className={previewMode ? "bg-primary text-primary-foreground" : ""}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Exit Preview' : 'Preview Colors'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(settings.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">{key} Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => {
                        const newColors = { ...settings.colors, [key]: e.target.value };
                        setSettings(prev => ({ ...prev, colors: newColors }));
                        if (previewMode) {
                          applyPreviewColors();
                        }
                      }}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        const newColors = { ...settings.colors, [key]: e.target.value };
                        setSettings(prev => ({ ...prev, colors: newColors }));
                        if (previewMode) {
                          applyPreviewColors();
                        }
                      }}
                      placeholder="#000000"
                      className="flex-1 font-mono"
                    />
                  </div>
                  <div 
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: value }}
                  />
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Color Usage Guide</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Primary:</strong> Main brand color, buttons, links, headers</li>
                <li><strong>Secondary:</strong> Light backgrounds, cards, subtle elements</li>
                <li><strong>Accent:</strong> Highlights, borders, secondary actions</li>
                <li><strong>Text:</strong> Primary text color throughout the interface</li>
                <li><strong>Background:</strong> Main page background color</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Admin Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminUsername">Username</Label>
                  <Input
                    id="adminUsername"
                    value={settings.adminCredentials.username}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      adminCredentials: { ...prev.adminCredentials, username: e.target.value }
                    }))}
                    placeholder="admin"
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Password *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={settings.adminCredentials.password}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      adminCredentials: { ...prev.adminCredentials, password: e.target.value }
                    }))}
                    placeholder="Enter admin password"
                  />
                </div>
                <div>
                  <Label htmlFor="adminName">Display Name</Label>
                  <Input
                    id="adminName"
                    value={settings.adminCredentials.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      adminCredentials: { ...prev.adminCredentials, name: e.target.value }
                    }))}
                    placeholder="Administrator"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminCredentials.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      adminCredentials: { ...prev.adminCredentials, email: e.target.value }
                    }))}
                    placeholder="admin@company.com"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Admin users have full access to edit content, upload assets, and manage settings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Team Advisor Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="advisorUsername">Username</Label>
                  <Input
                    id="advisorUsername"
                    value={settings.advisorCredentials.username}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      advisorCredentials: { ...prev.advisorCredentials, username: e.target.value }
                    }))}
                    placeholder="advisor"
                  />
                </div>
                <div>
                  <Label htmlFor="advisorPassword">Password *</Label>
                  <Input
                    id="advisorPassword"
                    type="password"
                    value={settings.advisorCredentials.password}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      advisorCredentials: { ...prev.advisorCredentials, password: e.target.value }
                    }))}
                    placeholder="Enter advisor password"
                  />
                </div>
                <div>
                  <Label htmlFor="advisorName">Display Name</Label>
                  <Input
                    id="advisorName"
                    value={settings.advisorCredentials.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      advisorCredentials: { ...prev.advisorCredentials, name: e.target.value }
                    }))}
                    placeholder="Team Advisor"
                  />
                </div>
                <div>
                  <Label htmlFor="advisorEmail">Email</Label>
                  <Input
                    id="advisorEmail"
                    type="email"
                    value={settings.advisorCredentials.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      advisorCredentials: { ...prev.advisorCredentials, email: e.target.value }
                    }))}
                    placeholder="advisor@company.com"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Advisor users have view-only access with a simplified interface.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Review Your Setup</h3>
              <p className="text-gray-600">Please review your configuration before completing setup.</p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {settings.logo && (
                      <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-50">
                        <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{settings.companyName}</h4>
                      {settings.companyDescription && (
                        <p className="text-sm text-gray-600">{settings.companyDescription}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Brand Colors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {Object.entries(settings.colors).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div 
                          className="w-12 h-12 rounded border mb-2"
                          style={{ backgroundColor: value }}
                        />
                        <p className="text-xs text-gray-600 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    User Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-600">
                        {settings.adminCredentials.name} ({settings.adminCredentials.username})
                      </p>
                      <p className="text-sm text-gray-600">{settings.adminCredentials.email}</p>
                    </div>
                    <div>
                      <p className="font-medium">Advisor User</p>
                      <p className="text-sm text-gray-600">
                        {settings.advisorCredentials.name} ({settings.advisorCredentials.username})
                      </p>
                      {settings.advisorCredentials.email && (
                        <p className="text-sm text-gray-600">{settings.advisorCredentials.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Client Portal Setup</CardTitle>
            <CardDescription>
              Configure your branded client portal dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive ? 'border-primary bg-primary text-white' :
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-2 text-sm ${
                      isActive ? 'text-primary font-medium' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-px mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}