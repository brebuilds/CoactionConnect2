import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X
} from 'lucide-react';

interface CalendarPost {
  id: string;
  title: string;
  platform: string;
  content: string;
  imageUrl?: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  pillar: string;
  postType: string;
  createdBy: string;
}

interface VisualCalendarProps {
  posts: CalendarPost[];
  onAddPost: (post: Omit<CalendarPost, 'id'>) => void;
  onUpdatePost: (id: string, updates: Partial<CalendarPost>) => void;
  onDeletePost: (id: string) => void;
  canEdit: boolean;
}

export function VisualCalendar({ posts, onAddPost, onUpdatePost, onDeletePost, canEdit }: VisualCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    platform: '',
    content: '',
    imageUrl: '',
    scheduledDate: '',
    pillar: '',
    postType: ''
  });

  // Get current week/month data
  const getWeekDates = (date: Date): Date[] => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getPostsForDate = (date: Date): CalendarPost[] => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getFilteredPosts = (): CalendarPost[] => {
    let filtered = posts;
    
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(post => post.platform === filterPlatform);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.platform || !newPost.content || !newPost.scheduledDate) return;

    const postData = {
      title: newPost.title,
      platform: newPost.platform,
      content: newPost.content,
      imageUrl: newPost.imageUrl || undefined,
      scheduledDate: new Date(newPost.scheduledDate),
      status: 'scheduled' as const,
      pillar: newPost.pillar,
      postType: newPost.postType,
      createdBy: 'Current User'
    };

    onAddPost(postData);
    setNewPost({ title: '', platform: '', content: '', imageUrl: '', scheduledDate: '', pillar: '', postType: '' });
    setIsCreateDialogOpen(false);
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);
  const filteredPosts = getFilteredPosts();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Content Calendar</h2>
            <p className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Platform Filter */}
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
            </SelectContent>
          </Select>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'week') {
                  newDate.setDate(newDate.getDate() - 7);
                } else {
                  newDate.setMonth(newDate.getMonth() - 1);
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === 'week') {
                  newDate.setDate(newDate.getDate() + 7);
                } else {
                  newDate.setMonth(newDate.getMonth() + 1);
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Create Post Button */}
          {canEdit && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Post</DialogTitle>
                  <DialogDescription>
                    Create and schedule a new social media post
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Post Title</Label>
                      <Input
                        id="title"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter post title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select value={newPost.platform} onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your post content..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduledDate">Scheduled Date</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={newPost.scheduledDate}
                        onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL (optional)</Label>
                      <Input
                        id="imageUrl"
                        value={newPost.imageUrl}
                        onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost} disabled={!newPost.title || !newPost.platform || !newPost.content || !newPost.scheduledDate}>
                      Schedule Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="border-accent/20">
        <CardContent className="p-0">
          {viewMode === 'week' ? (
            <div className="calendar-week-view">
              {/* Week Header */}
              <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-100">
                {dates.map((date, index) => (
                  <div key={index} className="p-4 text-center border-r border-gray-300 last:border-r-0">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Week Calendar Body */}
              <div className="grid grid-cols-7 min-h-[500px] border-l border-t border-gray-300">
                {dates.map((date, index) => (
                  <div 
                    key={index} 
                    className="border-r border-b border-gray-300 last:border-r-0 p-3 min-h-[500px] bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-2">
                      {getPostsForDate(date).map((post) => (
                        <div
                          key={post.id}
                          className={`p-2 rounded-lg border text-xs ${getStatusColor(post.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span>{getPlatformIcon(post.platform)}</span>
                            <span className="font-medium truncate">{post.title}</span>
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            {post.content.substring(0, 50)}...
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {post.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdatePost(post.id, { status: 'published' });
                                }}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePost(post.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="calendar-month-view">
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center border-r border-gray-300 last:border-r-0">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{day}</div>
                  </div>
                ))}
              </div>
              
              {/* Month Calendar Body */}
              <div className="grid grid-cols-7 border-l border-t border-gray-300">
                {dates.map((date, index) => (
                  <div
                    key={index}
                    className={`min-h-[140px] p-3 border-r border-b border-gray-300 last:border-r-0 ${
                      date.getMonth() === currentDate.getMonth() 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-gray-50 text-gray-400'
                    } transition-colors relative`}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-lg font-semibold ${
                        date.getMonth() === currentDate.getMonth() 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      {date.getDate() === new Date().getDate() && 
                       date.getMonth() === new Date().getMonth() && 
                       date.getFullYear() === new Date().getFullYear() && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Posts */}
                    <div className="space-y-1">
                      {getPostsForDate(date).slice(0, 4).map((post) => (
                        <div
                          key={post.id}
                          className={`p-2 rounded-md text-xs ${getStatusColor(post.status)} cursor-pointer hover:shadow-md transition-all duration-200 border-l-2 ${
                            post.status === 'published' ? 'border-l-green-400' :
                            post.status === 'scheduled' ? 'border-l-blue-400' :
                            post.status === 'draft' ? 'border-l-gray-400' :
                            'border-l-red-400'
                          }`}
                          title={`${post.title} - ${post.content.substring(0, 100)}`}
                          onClick={() => setSelectedPost(post)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm">{getPlatformIcon(post.platform)}</span>
                            <span className="text-xs text-gray-600">
                              {new Date(post.scheduledDate).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <div className="font-medium truncate">{post.title}</div>
                        </div>
                      ))}
                      {getPostsForDate(date).length > 4 && (
                        <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 font-medium">
                          +{getPostsForDate(date).length - 4} more posts
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Preview Popup */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-4">
              {/* Platform Icons */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPlatformIcon(selectedPost.platform)}</span>
                <span className="text-sm text-gray-600">{selectedPost.platform}</span>
              </div>
              
              {/* Date and Time */}
              <div className="text-sm text-gray-600">
                {selectedPost.scheduledDate.toLocaleDateString()} @ {selectedPost.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {/* Post Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Content</span>
                </div>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                  {selectedPost.content}
                </p>
              </div>
              
              {/* Graphic Preview */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Graphic Preview</div>
                <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  {selectedPost.imageUrl ? (
                    <img 
                      src={selectedPost.imageUrl} 
                      alt="Post graphic" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">(GRAPHIC PREVIEW)</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  size="sm"
                  onClick={() => onUpdatePost(selectedPost.id, { status: 'published' })}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Publish Now
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeletePost(selectedPost.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List View */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Posts ({filteredPosts.length})
          </CardTitle>
          <CardDescription>
            Manage all your scheduled and published posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                  <div>
                    <h3 className="font-medium text-foreground">{post.title}</h3>
                    <p className="text-sm text-foreground/70">{post.content.substring(0, 100)}...</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {post.platform}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {post.status}
                      </Badge>
                      <span className="text-xs text-foreground/60">
                        {post.scheduledDate.toLocaleDateString()} at {post.scheduledDate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdatePost(post.id, { status: 'published' })}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Publish
                  </Button>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
