import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { 
  Upload, 
  Search, 
  Download, 
  Clock, 
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Tag,
  Plus,
  Filter,
  Trash2,
  Edit
} from 'lucide-react';
import { KnowledgeService } from '../supabase/services';
import { setSyncStatus } from '../utils/sync';

interface KnowledgeHubProps {
  user: User;
  currentProject?: Project;
  onAddActivity?: (action: string, section: string, details?: string) => void;
}

interface FileRecord {
  id: string;
  fileName: string;
  category: string;
  lastModified: Date;
  tags: string[];
  fileType: string;
  fileSize: string;
  uploadedBy: string;
}

export function KnowledgeHub({ user, currentProject, onAddActivity }: KnowledgeHubProps) {
  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [newFile, setNewFile] = useState({
    fileName: '',
    category: '',
    tags: '',
    file: null as File | null
  });

  // Project-specific categories
  const getProjectCategories = (project?: Project): string[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return ['Partnership Agreements', 'Strategy Documents', 'Presentations', 'Templates', 'Legal Documents', 'Training Materials'];
      case 'zrmc':
        return ['Brand Guidelines', 'Social Media', 'Website Resources', 'Templates', 'Policies', 'Training Materials'];
      case 'tgmc':
        return ['Medical Protocols', 'Brand Guidelines', 'Patient Materials', 'Training Docs', 'Compliance', 'Marketing Resources'];
      default:
        return ['Documents', 'Templates', 'Resources', 'Policies'];
    }
  };

  const categories = getProjectCategories(currentProject);

  const getProjectSampleFiles = (project?: Project): FileRecord[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          {
            id: '1',
            fileName: 'Coaction Group Brand Guidelines 2024',
            category: 'Partnership Agreements',
            lastModified: new Date('2024-08-15'),
            tags: ['branding', 'guidelines', 'partnerships'],
            fileType: 'PDF',
            fileSize: '3.2 MB',
            uploadedBy: 'Marketing Team'
          },
          {
            id: '2',
            fileName: 'Strategic Partnership Framework',
            category: 'Strategy Documents',
            lastModified: new Date('2024-08-10'),
            tags: ['strategy', 'partnerships', 'framework'],
            fileType: 'DOCX',
            fileSize: '1.8 MB',
            uploadedBy: 'Strategy Team'
          }
        ];
      case 'zrmc':
        return [
          {
            id: '1',
            fileName: 'ZRMC Brand Guidelines 2024',
            category: 'Brand Guidelines',
            lastModified: new Date('2024-08-15'),
            tags: ['branding', 'guidelines', 'logo'],
            fileType: 'PDF',
            fileSize: '2.4 MB',
            uploadedBy: 'Marketing Team'
          },
          {
            id: '2',
            fileName: 'Patient Communication Guidelines',
            category: 'Policies',
            lastModified: new Date('2024-08-05'),
            tags: ['communication', 'patients', 'guidelines'],
            fileType: 'DOCX',
            fileSize: '890 KB',
            uploadedBy: 'Admin Team'
          }
        ];
      case 'tgmc':
        return [
          {
            id: '1',
            fileName: 'TGMC Medical Excellence Standards',
            category: 'Medical Protocols',
            lastModified: new Date('2024-08-15'),
            tags: ['medical', 'standards', 'protocols'],
            fileType: 'PDF',
            fileSize: '4.1 MB',
            uploadedBy: 'Medical Director'
          },
          {
            id: '2',
            fileName: 'Patient Care Guidelines',
            category: 'Patient Materials',
            lastModified: new Date('2024-08-08'),
            tags: ['patient care', 'guidelines', 'procedures'],
            fileType: 'DOCX',
            fileSize: '1.2 MB',
            uploadedBy: 'Nursing Staff'
          }
        ];
      default:
        return [];
    }
  };

  // Load project-specific files from Supabase (fallback to localStorage/sample)
  useEffect(() => {
    if (currentProject) {
      (async () => {
        try {
          const data = await KnowledgeService.getFiles(currentProject.id);
          const mapped: FileRecord[] = (data || []).map(f => ({
            id: f.id,
            fileName: f.file_name,
            category: f.category,
            lastModified: new Date(f.created_at),
            tags: f.tags || [],
            fileType: f.file_type,
            fileSize: f.file_size,
            uploadedBy: f.uploaded_by
          }));
          if (mapped.length) {
            setFiles(mapped);
            return;
          }
        } catch (e) {
          console.warn('Supabase knowledge fetch failed, falling back to local:', e);
        }
        const savedFiles = localStorage.getItem(`knowledge-files-${currentProject.id}`);
        if (savedFiles) {
          const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
            ...file,
            lastModified: new Date(file.lastModified)
          }));
          setFiles(parsedFiles);
        } else {
          const sampleFiles = getProjectSampleFiles(currentProject);
          setFiles(sampleFiles);
        }
      })();
    }
  }, [currentProject]);

  // Save project-specific files to localStorage whenever files change
  useEffect(() => {
    if (currentProject && files.length > 0) {
      localStorage.setItem(`knowledge-files-${currentProject.id}`, JSON.stringify(files));
    }
  }, [files, currentProject]);

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf') || type.includes('doc')) return FileText;
    if (type.includes('xls') || type.includes('csv')) return FileText;
    if (type.includes('jpg') || type.includes('png') || type.includes('gif')) return ImageIcon;
    if (type.includes('mp4') || type.includes('avi') || type.includes('mov')) return Video;
    return File;
  };

  const getFileIconColor = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'text-red-600';
    if (type.includes('doc')) return 'text-blue-600';
    if (type.includes('xls') || type.includes('csv')) return 'text-green-600';
    if (type.includes('jpg') || type.includes('png') || type.includes('gif')) return 'text-purple-600';
    if (type.includes('mp4') || type.includes('avi') || type.includes('mov')) return 'text-orange-600';
    return 'text-gray-600';
  };

  const handleFileUpload = async () => {
    if (!newFile.fileName || !newFile.category || !newFile.file) return;
    const tags = newFile.tags ? newFile.tags.split(',').map(tag => tag.trim()) : [];
    const fileType = newFile.file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const fileSize = formatFileSize(newFile.file.size);

    let id = Date.now().toString();
    try {
      if (currentProject) {
        id = await KnowledgeService.uploadFile(newFile.file, currentProject.id, {
          file_name: newFile.fileName,
          category: newFile.category,
          tags,
          file_type: fileType,
          file_size: fileSize,
          uploaded_by: user.name,
          project_id: currentProject.id
        } as any);
      }
    } catch (e) {
      console.warn('Knowledge upload failed, saving locally only:', e);
      setSyncStatus({ level: 'local-only', message: 'File saved locally' });
    }

    const record: FileRecord = {
      id,
      fileName: newFile.fileName,
      category: newFile.category,
      lastModified: new Date(),
      tags,
      fileType,
      fileSize,
      uploadedBy: user.name
    };

    setFiles(prev => [record, ...prev]);
    setNewFile({ fileName: '', category: '', tags: '', file: null });
    setIsUploadDialogOpen(false);

    if (onAddActivity) {
      onAddActivity('File Upload', 'Knowledge Hub', `Uploaded ${record.fileName}`);
    }
    setSyncStatus({ level: 'synced', message: 'File saved' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (file: FileRecord) => {
    // In a real implementation, this would download the actual file
    // For now, we'll just track the activity
    if (onAddActivity) {
      onAddActivity('File Download', 'Knowledge Hub', `Downloaded ${file.fileName}`);
    }
    
    // Simulate download
    alert(`Downloading ${file.fileName}...`);
  };

  const handleDelete = async (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    try {
      await KnowledgeService.deleteFile(fileId);
      setSyncStatus({ level: 'synced', message: 'File deleted' });
    } catch (e) {
      console.warn('Knowledge delete failed:', e);
      setSyncStatus({ level: 'local-only', message: 'File deletion saved locally' });
    }
    
    if (onAddActivity && fileToDelete) {
      onAddActivity('File Delete', 'Knowledge Hub', `Deleted ${fileToDelete.fileName}`);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Knowledge Hub</h1>
          <p className="text-foreground/70">
            {isAdmin 
              ? `Manage and organize ${currentProject?.name || 'organization'} files and resources`
              : `Access ${currentProject?.name || 'organization'} files and resources`
            }
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New File</DialogTitle>
                <DialogDescription>
                  Add a new file to the knowledge hub with categories and tags.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={newFile.fileName}
                    onChange={(e) => setNewFile(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="Enter descriptive file name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewFile(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newFile.tags}
                    onChange={(e) => setNewFile(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., branding, guidelines, logo"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setNewFile(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload} disabled={!newFile.fileName || !newFile.category || !newFile.file}>
                    Upload File
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search files by name or tags..."
                className="pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Files & Resources</CardTitle>
          <CardDescription>
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.fileType);
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileIcon className={`w-5 h-5 ${getFileIconColor(file.fileType)}`} />
                        <div>
                          <div className="text-gray-900">{file.fileName}</div>
                          <div className="text-sm text-gray-500">{file.fileType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{file.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {file.lastModified.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {file.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {file.fileSize}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No Files Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all' 
                  ? "Try adjusting your search criteria or filters." 
                  : "Upload your first file to get started."}
              </p>
              {isAdmin && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
