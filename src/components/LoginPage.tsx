import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, AlertCircle, Download, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  companyName: string;
  companyLogo?: string;
}

export function LoginPage({ onLogin, companyName, companyLogo }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // PWA Install functionality
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed successfully');
    } else {
      console.log('PWA installation declined');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await onLogin(username, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-primary/20 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-16 w-auto mx-auto max-w-[200px] object-contain"
              />
            ) : (
              <div className="h-16 w-32 bg-gray-200 rounded mx-auto flex items-center justify-center">
                <span className="text-sm text-gray-500">Logo</span>
              </div>
            )}
          </div>
          <p className="text-foreground/80 text-lg">{companyName}</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground font-bold">Secure Access</CardTitle>
            <CardDescription className="text-foreground/70">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-accent/30 focus:border-primary focus:ring-primary/20"
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-accent/30 focus:border-primary focus:ring-primary/20"
                  autoComplete="current-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* PWA Install Button */}
            {showInstallButton && (
              <div className="mt-4">
                <Button
                  onClick={handleInstallClick}
                  variant="outline"
                  className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-white font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
                <p className="text-xs text-center text-foreground/60 mt-2">
                  Install for offline access and better mobile experience
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-primary">
                <Shield className="w-4 h-4 inline mr-2" />
                Access is restricted to authorized personnel only. Contact your administrator for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
