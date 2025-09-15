import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { IntegrationSettings } from './IntegrationSettings';
import { UserManagement } from './UserManagement';
import { Project } from './ProjectManager';
import { User } from '../App';
import { Users, Settings as SettingsIcon, Plug, Shield } from 'lucide-react';

interface SettingsProps {
  user: User;
  currentProject: Project;
}

export function Settings({ user, currentProject }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('integrations');

  // Check if user has admin privileges
  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
  
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
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationSettings user={user} currentProject={currentProject} />
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