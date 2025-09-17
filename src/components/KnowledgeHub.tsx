import React, { useState, useEffect } from 'react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
import { KnowledgeService } from '../airtable/services';
import { setSyncStatus } from '../utils/sync';

interface KnowledgeHubProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  canUploadKnowledge?: boolean;
  canComment?: boolean;
  onAddActivity?: (action: string, section: string, details?: string) => void;
}

interface FileRecord {
  id: string;
  fileName: string;
  lastModified: Date;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  notes?: string;
}

export function KnowledgeHub({ user, currentProject, canEdit = true, canUploadKnowledge = true, canComment = true, onAddActivity }: KnowledgeHubProps) {
  const isAdmin = user.role === 'SuperAdmin';
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [newFiles, setNewFiles] = useState({
    files: [] as File[],
    notes: ''
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
          // Start with empty array instead of sample files
          setFiles([]);
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
    if (newFiles.files.length === 0) return;
    
    const uploadedFiles: FileRecord[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of newFiles.files) {
      const fileName = file.name;
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileSize = formatFileSize(file.size);

      let id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      try {
        if (currentProject) {
          id = await KnowledgeService.uploadFile(file, currentProject.id, {
            file_name: fileName,
            category: 'General', // Default category
            tags: [],
            file_type: fileType,
            file_size: fileSize,
            uploaded_by: user.name,
            project_id: currentProject.id
          } as any);
        }
        successCount++;
      } catch (e) {
        console.warn('Knowledge upload failed for', fileName, e);
        errorCount++;
      }

      const record: FileRecord = {
        id,
        fileName,
        lastModified: new Date(),
        fileType,
        fileSize,
        uploadedBy: user.name,
        notes: newFiles.notes || undefined
      };

      uploadedFiles.push(record);
    }

    setFiles(prev => [...uploadedFiles, ...prev]);
    setNewFiles({ files: [], notes: '' });
    setIsUploadDialogOpen(false);

    if (onAddActivity) {
      onAddActivity('File Upload', 'Knowledge Hub', `Uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
    }

    if (errorCount > 0) {
      setSyncStatus({ level: 'error', message: `${successCount} files saved, ${errorCount} failed` });
    } else {
      setSyncStatus({ level: 'synced', message: `${successCount} file${successCount !== 1 ? 's' : ''} saved` });
    }
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
                         (file.notes && file.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
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
        <div className="flex gap-2">
          {canUploadKnowledge && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Select one or more files to upload. File names will be used automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="files">Files *</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || []);
                      setNewFiles(prev => ({ ...prev, files: selectedFiles }));
                    }}
                  />
                  {newFiles.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Selected {newFiles.files.length} file{newFiles.files.length !== 1 ? 's' : ''}:
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {newFiles.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="truncate flex-1">{file.name}</span>
                            <span className="text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => {
                                const updatedFiles = newFiles.files.filter((_, i) => i !== index);
                                setNewFiles(prev => ({ ...prev, files: updatedFiles }));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={newFiles.notes}
                    onChange={(e) => setNewFiles(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about these files..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload} disabled={newFiles.files.length === 0}>
                    Upload {newFiles.files.length} File{newFiles.files.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
          
          {/* Clear All Files Button - Only for SuperAdmin */}
          {user.role === 'SuperAdmin' && files.length > 0 && (
            <Button 
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => {
                if (confirm(`Are you sure you want to delete all ${files.length} files from the knowledge hub? This action cannot be undone.`)) {
                  setFiles([]);
                  if (currentProject) {
                    localStorage.removeItem(`knowledge-files-${currentProject.id}`);
                  }
                  if (onAddActivity) {
                    onAddActivity('Clear All Files', 'Knowledge Hub', `Cleared ${files.length} files`);
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All ({files.length})
            </Button>
          )}
        </div>
      </div>

      {/* Upload Guide for TGMC */}
      {currentProject?.id === 'tgmc' && (
        <Card className="border-accent/20 shadow-sm bg-background">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-primary/60 mx-auto mb-4" />
              <h3 className="text-2xl text-foreground mb-2">What to Upload</h3>
              <p className="text-foreground/70 text-lg mb-6">
                Help us tell your story! Here's a list of ideas you can upload and share that are great for content creation. Photos are also welcome!
              </p>
              
              {/* Top Upload Button */}
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-12 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-7 h-7 mr-4" />
                Upload to Knowledge Hub
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Hospital Identity & Mission</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Mission, vision, and values statements</li>
                    <li>• Hospital name, taglines, and messaging</li>
                    <li>• Leadership team bios and organizational structure</li>
                    <li>• Community commitment and service area information</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Visual Documentation</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Architectural renderings and construction progress photos</li>
                    <li>• Medical equipment and facility images</li>
                    <li>• Leadership headshots and team photos</li>
                    <li>• Community events and groundbreaking ceremonies</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Medical Services & Specialties</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Department descriptions and service offerings</li>
                    <li>• Physician profiles and credentials</li>
                    <li>• Medical equipment and technology capabilities</li>
                    <li>• Patient care protocols and quality measures</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Regulatory & Compliance</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Accreditation documentation</li>
                    <li>• Licensing and certification materials</li>
                    <li>• Quality and safety initiatives</li>
                    <li>• Compliance policies and procedures</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Community & Market Information</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Market research and community health assessments</li>
                    <li>• Demographics and service area maps</li>
                    <li>• Competitor analysis and positioning</li>
                    <li>• Partnership announcements and affiliations</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Development Materials</h4>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>• Press releases and media coverage</li>
                    <li>• Investor presentations and financial updates</li>
                    <li>• Timeline and milestone documentation</li>
                    <li>• Community engagement and public hearing materials</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-foreground/80 mb-8 leading-relaxed text-lg">
                The more information you share about your vision for healthcare in McAllen, 
                the better we can create content that builds community trust and excitement 
                for your hospital's opening.
              </p>
              
              {/* Bottom Upload Button - Extra Large */}
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-2xl px-16 py-8 h-auto font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-8 h-8 mr-4" />
                Upload to Knowledge Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search files by name or notes..."
                className="pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                <TableHead>Notes</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
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
                      <div className="max-w-xs">
                        {file.notes ? (
                          <div className="text-sm text-gray-700 truncate" title={file.notes}>
                            {file.notes}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No notes</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {file.lastModified.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {file.fileSize}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {file.uploadedBy}
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
                        {canUploadKnowledge && (
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
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : "Upload your first files to get started."}
              </p>
              {canUploadKnowledge && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
