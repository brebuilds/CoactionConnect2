import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Trash2, 
  Edit,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  created_by?: string;
}

interface UserManagementProps {
  accessToken?: string;
}

const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin', 
  ADVISOR: 'Advisor',
  MARKETING: 'Marketing Team',
  MANAGER: 'Manager',
  VIEWER: 'Viewer'
} as const;

const ROLE_COLORS: Record<string, string> = {
  'SuperAdmin': 'bg-red-100 text-red-800 border-red-200',
  'Admin': 'bg-blue-100 text-blue-800 border-blue-200',
  'Advisor': 'bg-green-100 text-green-800 border-green-200',
  'Marketing Team': 'bg-orange-100 text-orange-800 border-orange-200',
  'Manager': 'bg-purple-100 text-purple-800 border-purple-200',
  'Viewer': 'bg-gray-100 text-gray-800 border-gray-200'
};

export function UserManagement({ accessToken = 'mock-admin-token' }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const fetchUsers = async () => {
    try {
      // For demo purposes, we'll load some mock users
      // In production, this would call the real API
      const mockUsers = [
        {
          id: '1',
          email: 'bre@coactiongroup.com',
          name: 'Bre Anderson',
          role: 'SuperAdmin',
          created_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          id: '2', 
          email: 'admin@zrmc.com',
          name: 'ZRMC Administrator',
          role: 'Admin',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          created_by: '1'
        },
        {
          id: '3',
          email: 'marketing@tgmc.com', 
          name: 'TGMC Marketing',
          role: 'Marketing Team',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          created_by: '1'
        }
      ];
      
      setUsers(mockUsers);
    } catch (err: any) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    clearMessages();

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5e3056d/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(`User ${newUser.name} created successfully`);
        setNewUser({ email: '', password: '', name: '', role: '' });
        await fetchUsers();
      } else {
        showError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      showError('Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    clearMessages();

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5e3056d/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('User role updated successfully');
        setEditingUser(null);
        await fetchUsers();
      } else {
        showError(data.error || 'Failed to update user role');
      }
    } catch (err: any) {
      showError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    clearMessages();

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5e3056d/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(`User ${userName} deleted successfully`);
        await fetchUsers();
      } else {
        showError(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      showError('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-pulse text-stirling mb-4">
            <div className="w-8 h-8 border-2 border-stirling border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-granite">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-granite">User Management</h1>
          <p className="text-granite/60 mt-2">Manage user accounts and permissions</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-stirling hover:bg-stirling/90 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Full Name</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(USER_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating User...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Users Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => {
                const today = new Date().toDateString();
                return new Date(user.created_at).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                            <DialogDescription>
                              Change the role for {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Current Role</Label>
                              <div className="p-2 bg-muted rounded">
                                <Badge className={ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}>
                                  {user.role}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>New Role</Label>
                              <Select onValueChange={(value) => handleUpdateRole(user.id, value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select new role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(USER_ROLES).map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={(user.role === 'Admin' || user.role === 'SuperAdmin') && users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}