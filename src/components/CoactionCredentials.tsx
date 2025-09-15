import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, EyeOff, Copy, Check, Shield, Users } from 'lucide-react';

export function CoactionCredentials() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const credentials = [
    {
      role: 'Admin',
      username: 'admin',
      password: 'CoactionAdmin2024!',
      description: 'Full administrative access',
      icon: Shield,
      color: 'bg-primary text-primary-foreground'
    },
    {
      role: 'Team Member',
      username: 'team',
      password: 'CoactionTeam2024!',
      description: 'Collaborative team access',
      icon: Users,
      color: 'bg-accent text-accent-foreground'
    }
  ];

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.log('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-accent/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Coaction Connect Access</CardTitle>
              <CardDescription className="text-xs">Demo credentials for testing</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="h-8 w-8 p-0"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {credentials.map((cred, index) => {
            const Icon = cred.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${cred.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {cred.role}
                  </Badge>
                </div>
                
                <div className="pl-8 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/70">Username:</span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                        {cred.username}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cred.username, `username-${index}`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === `username-${index}` ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/70">Password:</span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                        {showPasswords ? cred.password : '••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cred.password, `password-${index}`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === `password-${index}` ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-foreground/50">{cred.description}</p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 border-t border-accent/20">
            <p className="text-xs text-foreground/60 text-center">
              Click the eye icon to show/hide passwords, or copy button to copy credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}