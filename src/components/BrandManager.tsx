import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trash2, Edit, Plus, Building2, Palette } from 'lucide-react';
import { ClientSettings } from './ClientSetup';

export interface Brand extends ClientSettings {
  id: string;
  createdAt: Date;
  isActive?: boolean;
}

interface BrandManagerProps {
  brands: Brand[];
  activeBrand: Brand | null;
  onBrandSelect: (brand: Brand) => void;
  onBrandAdd: (brand: Omit<Brand, 'id' | 'createdAt'>) => void;
  onBrandUpdate: (brandId: string, updates: Partial<Brand>) => void;
  onBrandDelete: (brandId: string) => void;
}

export function BrandManager({ 
  brands, 
  activeBrand, 
  onBrandSelect, 
  onBrandAdd, 
  onBrandUpdate, 
  onBrandDelete 
}: BrandManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  const [newBrand, setNewBrand] = useState({
    companyName: '',
    companyDescription: '',
    colors: {
      primary: '#4A90A4',
      secondary: '#F8F9FA',
      accent: '#E07A33',
      text: '#2C3E50',
      background: '#FFFFFF'
    },
    adminCredentials: {
      username: 'admin',
      password: '',
      name: '',
      email: ''
    },
    advisorCredentials: {
      username: 'team',
      password: '',
      name: 'Team Member',
      email: ''
    },
    logo: ''
  });

  const handleAddBrand = () => {
    if (!newBrand.companyName || !newBrand.adminCredentials.password) return;
    
    onBrandAdd({
      ...newBrand,
      adminCredentials: {
        ...newBrand.adminCredentials,
        name: newBrand.adminCredentials.name || `${newBrand.companyName} Administrator`,
        email: newBrand.adminCredentials.email || `admin@${newBrand.companyName.toLowerCase().replace(/\s+/g, '')}.com`
      },
      advisorCredentials: {
        ...newBrand.advisorCredentials,
        email: newBrand.advisorCredentials.email || `team@${newBrand.companyName.toLowerCase().replace(/\s+/g, '')}.com`
      }
    });
    
    setNewBrand({
      companyName: '',
      companyDescription: '',
      colors: {
        primary: '#4A90A4',
        secondary: '#F8F9FA',
        accent: '#E07A33',
        text: '#2C3E50',
        background: '#FFFFFF'
      },
      adminCredentials: {
        username: 'admin',
        password: '',
        name: '',
        email: ''
      },
      advisorCredentials: {
        username: 'team',
        password: '',
        name: 'Team Member',
        email: ''
      },
      logo: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateBrand = (brand: Brand, updates: Partial<Brand>) => {
    onBrandUpdate(brand.id, updates);
    setEditingBrand(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Brand Management</h2>
          <p className="text-foreground/70">Manage all client brands from this internal tool</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Create a new brand configuration for a client.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newBrand.companyName}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g., Acme Corporation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyDescription">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      value={newBrand.companyDescription}
                      onChange={(e) => setNewBrand(prev => ({ ...prev, companyDescription: e.target.value }))}
                      placeholder="Brief description of the company..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Brand Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={newBrand.colors.primary}
                        onChange={(e) => setNewBrand(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, primary: e.target.value }
                        }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newBrand.colors.primary}
                        onChange={(e) => setNewBrand(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, primary: e.target.value }
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={newBrand.colors.accent}
                        onChange={(e) => setNewBrand(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, accent: e.target.value }
                        }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={newBrand.colors.accent}
                        onChange={(e) => setNewBrand(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, accent: e.target.value }
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Credentials */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Admin Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminName">Admin Name</Label>
                    <Input
                      id="adminName"
                      value={newBrand.adminCredentials.name}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        adminCredentials: { ...prev.adminCredentials, name: e.target.value }
                      }))}
                      placeholder="Admin User Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newBrand.adminCredentials.email}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        adminCredentials: { ...prev.adminCredentials, email: e.target.value }
                      }))}
                      placeholder="admin@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminUsername">Admin Username</Label>
                    <Input
                      id="adminUsername"
                      value={newBrand.adminCredentials.username}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        adminCredentials: { ...prev.adminCredentials, username: e.target.value }
                      }))}
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminPassword">Admin Password *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={newBrand.adminCredentials.password}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        adminCredentials: { ...prev.adminCredentials, password: e.target.value }
                      }))}
                      placeholder="Secure password..."
                    />
                  </div>
                </div>
              </div>

              {/* Team Credentials */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Team Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamUsername">Team Username</Label>
                    <Input
                      id="teamUsername"
                      value={newBrand.advisorCredentials.username}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        advisorCredentials: { ...prev.advisorCredentials, username: e.target.value }
                      }))}
                      placeholder="team"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamPassword">Team Password</Label>
                    <Input
                      id="teamPassword"
                      type="password"
                      value={newBrand.advisorCredentials.password}
                      onChange={(e) => setNewBrand(prev => ({ 
                        ...prev, 
                        advisorCredentials: { ...prev.advisorCredentials, password: e.target.value }
                      }))}
                      placeholder="Team password..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddBrand} 
                  disabled={!newBrand.companyName || !newBrand.adminCredentials.password}
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Brand
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <Card 
            key={brand.id} 
            className={`border-accent/20 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              activeBrand?.id === brand.id ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => onBrandSelect(brand)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{brand.companyName}</CardTitle>
                </div>
                {activeBrand?.id === brand.id && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
                )}
              </div>
              {brand.companyDescription && (
                <CardDescription className="text-sm">
                  {brand.companyDescription}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Palette Preview */}
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-foreground/60" />
                <div className="flex space-x-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-foreground/10"
                    style={{ backgroundColor: brand.colors.primary }}
                    title={`Primary: ${brand.colors.primary}`}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-foreground/10"
                    style={{ backgroundColor: brand.colors.accent }}
                    title={`Accent: ${brand.colors.accent}`}
                  />
                </div>
              </div>

              {/* Credentials Info */}
              <div className="text-sm text-foreground/60 space-y-1">
                <p>Admin: {brand.adminCredentials.username}</p>
                <p>Team: {brand.advisorCredentials.username}</p>
                <p>Created: {new Date(brand.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBrand(brand);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ${brand.companyName}?`)) {
                      onBrandDelete(brand.id);
                    }
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {brands.length === 0 && (
          <Card className="border-dashed border-2 border-accent/30 col-span-full">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-accent/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Brands Yet</h3>
              <p className="text-foreground/60 mb-4">Create your first brand configuration to get started.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Brand
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Brand Dialog */}
      {editingBrand && (
        <Dialog open={!!editingBrand} onOpenChange={() => setEditingBrand(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingBrand.companyName}</DialogTitle>
              <DialogDescription>
                Update brand settings and credentials.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCompanyName">Company Name</Label>
                <Input
                  id="editCompanyName"
                  value={editingBrand.companyName}
                  onChange={(e) => setEditingBrand(prev => prev ? ({ ...prev, companyName: e.target.value }) : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="editPrimaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editingBrand.colors.primary}
                    onChange={(e) => setEditingBrand(prev => prev ? ({ 
                      ...prev, 
                      colors: { ...prev.colors, primary: e.target.value }
                    }) : null)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={editingBrand.colors.primary}
                    onChange={(e) => setEditingBrand(prev => prev ? ({ 
                      ...prev, 
                      colors: { ...prev.colors, primary: e.target.value }
                    }) : null)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingBrand(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => editingBrand && handleUpdateBrand(editingBrand, editingBrand)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}