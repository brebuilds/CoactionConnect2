import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Slider } from './ui/slider';
import { 
  Download, 
  Upload, 
  Type, 
  Palette, 
  Move, 
  RotateCcw, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Square,
  Circle,
  Image as ImageIcon,
  Text,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Settings,
  Save,
  X
} from 'lucide-react';
import { GraphicTemplateService } from '../airtable/services';

interface GraphicGeneratorProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  dimensions: string;
  tags: string[];
}

export function GraphicGenerator({ user, currentProject, canEdit = true }: GraphicGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('All');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(100);
  const [showTextTools, setShowTextTools] = useState(false);
  const [showShapeTools, setShowShapeTools] = useState(false);
  const [showImageTools, setShowImageTools] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [shapes, setShapes] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [layers, setLayers] = useState<any[]>([]);

  // Brand colors and fonts from current project
  const brandColors = currentProject?.colors || {
    primary: '#1c5f9a',
    secondary: '#F8F9FA',
    accent: '#c9741c',
    text: '#2e496c',
    background: '#ffffff'
  };

  const brandFonts = [
    'Roboto Condensed',
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman'
  ];

  // Load templates from Airtable and fallback to default templates
  useEffect(() => {
    if (currentProject) {
      loadTemplates();
    }
  }, [currentProject]);

  const loadTemplates = async () => {
    try {
      const projectTemplates = await GraphicTemplateService.getTemplates(currentProject!.id);
      if (projectTemplates.length > 0) {
        setTemplates(projectTemplates);
      } else {
        // Load default templates if no custom templates exist
        setTemplates(getDefaultTemplates(currentProject!.id));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback to default templates
      setTemplates(getDefaultTemplates(currentProject!.id));
    }
  };

  // Get default templates for each project
  const getDefaultTemplates = (projectId: string): Template[] => {
    const baseTemplates: Template[] = [
      {
        id: 'default-1',
        name: 'Health Tip - Blue Background',
        category: 'Health Tips',
        imageUrl: '/api/placeholder/1080/1080/1c5f9a/ffffff?text=Health+Tip',
        dimensions: '1080x1080',
        tags: ['health', 'tip', 'blue', 'square']
      },
      {
        id: 'default-2',
        name: 'Announcement - Orange Accent',
        category: 'Announcements',
        imageUrl: '/api/placeholder/1080/1080/c9741c/ffffff?text=Announcement',
        dimensions: '1080x1080',
        tags: ['announcement', 'orange', 'square', 'news']
      },
      {
        id: 'default-3',
        name: 'Quote - Navy Background',
        category: 'Quotes',
        imageUrl: '/api/placeholder/1080/1080/2e496c/ffffff?text=Inspirational+Quote',
        dimensions: '1080x1080',
        tags: ['quote', 'inspiration', 'navy', 'square']
      },
      {
        id: 'default-4',
        name: 'Event - Story Format',
        category: 'Events',
        imageUrl: '/api/placeholder/1080/1920/1c5f9a/ffffff?text=Upcoming+Event',
        dimensions: '1080x1920',
        tags: ['event', 'story', 'vertical', 'blue']
      },
      {
        id: 'default-5',
        name: 'Testimonial - Light Background',
        category: 'Testimonials',
        imageUrl: '/api/placeholder/1080/1080/f8f9fa/2e496c?text=Patient+Testimonial',
        dimensions: '1080x1080',
        tags: ['testimonial', 'patient', 'light', 'square']
      },
      {
        id: 'default-6',
        name: 'Promotion - Accent Colors',
        category: 'Promotions',
        imageUrl: '/api/placeholder/1080/1080/c9741c/ffffff?text=Special+Offer',
        dimensions: '1080x1080',
        tags: ['promotion', 'offer', 'orange', 'square']
      }
    ];

    // Add project-specific templates
    if (projectId === 'zrmc') {
      return [
        ...baseTemplates,
        {
          id: 'zrmc-1',
          name: 'ZRMC Construction Update',
          category: 'Progress',
          imageUrl: '/api/placeholder/1080/1080/1c5f9a/ffffff?text=ZRMC+Construction+Update',
          dimensions: '1080x1080',
          tags: ['zrmc', 'construction', 'progress', 'blue']
        },
        {
          id: 'zrmc-2',
          name: 'ZRMC Community Health',
          category: 'Health Tips',
          imageUrl: '/api/placeholder/1080/1080/2e496c/ffffff?text=ZRMC+Community+Health',
          dimensions: '1080x1080',
          tags: ['zrmc', 'community', 'health', 'navy']
        }
      ];
    } else if (projectId === 'tgmc') {
      return [
        ...baseTemplates,
        {
          id: 'tgmc-1',
          name: 'TGMC Wellness Program',
          category: 'Health Tips',
          imageUrl: '/api/placeholder/1080/1080/c9741c/ffffff?text=TGMC+Wellness+Program',
          dimensions: '1080x1080',
          tags: ['tgmc', 'wellness', 'program', 'orange']
        },
        {
          id: 'tgmc-2',
          name: 'TGMC Patient Care',
          category: 'Testimonials',
          imageUrl: '/api/placeholder/1080/1080/1c5f9a/ffffff?text=TGMC+Patient+Care',
          dimensions: '1080x1080',
          tags: ['tgmc', 'patient', 'care', 'blue']
        }
      ];
    }

    return baseTemplates;
  };

  // Initialize canvas when template is selected
  useEffect(() => {
    if (selectedTemplate && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size based on template dimensions
        const [width, height] = selectedTemplate.dimensions.split('x').map(Number);
        setCanvasSize({ width, height });
        canvas.width = width;
        canvas.height = height;
        
        // Load and draw template image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          redrawCanvas();
        };
        img.src = selectedTemplate.imageUrl;
      }
    }
  }, [selectedTemplate]);

  // Redraw canvas with all elements
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template background
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw text elements
      textElements.forEach((element) => {
        drawTextElement(ctx, element);
      });
    };
    img.src = selectedTemplate.imageUrl;
  }, [selectedTemplate, textElements]);

  // Draw individual text element
  const drawTextElement = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    ctx.save();
    
    // Set text properties
    ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.textAlign;
    ctx.globalAlpha = element.opacity;
    
    // Apply rotation
    if (element.rotation !== 0) {
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-element.width / 2, -element.height / 2);
    }
    
    // Draw text
    const lines = element.text.split('\n');
    const lineHeight = element.fontSize * 1.2;
    
    lines.forEach((line, index) => {
      const y = element.y + (index + 1) * lineHeight;
      ctx.fillText(line, element.x, y);
    });
    
    ctx.restore();
  };

  // Add new text element
  const addTextElement = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: 'Your text here',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontSize: 24,
      fontFamily: 'Roboto Condensed',
      fontWeight: 'normal',
      color: brandColors.primary,
      textAlign: 'left',
      rotation: 0,
      opacity: 1
    };
    
    setTextElements(prev => [...prev, newElement]);
    setSelectedTextElement(newElement.id);
  };

  // Update text element
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  // Delete text element
  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    if (selectedTextElement === id) {
      setSelectedTextElement(null);
    }
  };

  // Handle mouse events for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTextElement) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    const element = textElements.find(el => el.id === selectedTextElement);
    if (!element) return;
    
    // Check if clicking on resize handle
    const handleSize = 8;
    const isOnResizeHandle = 
      (x >= element.x + element.width - handleSize && x <= element.x + element.width + handleSize &&
       y >= element.y + element.height - handleSize && y <= element.y + element.height + handleSize);
    
    if (isOnResizeHandle) {
      setIsResizing(true);
      setResizeHandle('se'); // southeast
    } else if (x >= element.x && x <= element.x + element.width && 
               y >= element.y && y <= element.y + element.height) {
      setIsDragging(true);
      setDragStart({ x: x - element.x, y: y - element.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTextElement) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    if (isDragging) {
      updateTextElement(selectedTextElement, {
        x: x - dragStart.x,
        y: y - dragStart.y
      });
    } else if (isResizing) {
      const element = textElements.find(el => el.id === selectedTextElement);
      if (element) {
        updateTextElement(selectedTextElement, {
          width: Math.max(50, x - element.x),
          height: Math.max(20, y - element.y)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Export canvas as image
  const exportCanvas = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `graphic-${Date.now()}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(templateSearchTerm.toLowerCase()));
    const matchesCategory = templateCategoryFilter === 'All' || template.category === templateCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  // Get selected text element
  const selectedElement = textElements.find(el => el.id === selectedTextElement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2">Graphic Generator</h1>
          <p className="text-foreground/70">
            Create branded graphics with text overlays and templates
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Template
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsExportDialogOpen(true)}
            disabled={!selectedTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-3">
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Canvas</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-foreground/70">{Math.round(zoom * 100)}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px] border rounded-lg bg-gray-50">
                <div 
                  className="inline-block"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="border border-gray-300 cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tools Panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  disabled={!selectedTemplate}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Templates
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                  disabled={!selectedTemplate}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLayerPanel(!showLayerPanel)}
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Layers
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Save to database functionality
                    console.log('Saving to database...');
                  }}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Text Tools */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={addTextElement}
                  className="w-full"
                  disabled={!selectedTemplate}
                >
                  <Text className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowTextTools(!showTextTools)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Format
                </Button>
              </div>
              
              {textElements.length > 0 && (
                <div className="space-y-2">
                  <Label>Text Elements</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {textElements.map((element) => (
                      <div
                        key={element.id}
                        className={`p-2 rounded border cursor-pointer text-sm ${
                          selectedTextElement === element.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTextElement(element.id)}
                      >
                        <div className="truncate">{element.text || 'Empty text'}</div>
                        <div className="text-xs text-gray-500">
                          {element.fontSize}px {element.fontFamily}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Properties */}
          {selectedElement && (
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Text Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Textarea
                    id="text-content"
                    value={selectedElement.text}
                    onChange={(e) => updateTextElement(selectedElement.id, { text: e.target.value })}
                    rows={3}
                    placeholder="Enter your text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateTextElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      min="8"
                      max="200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-family">Font</Label>
                    <Select
                      value={selectedElement.fontFamily}
                      onValueChange={(value) => updateTextElement(selectedElement.id, { fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {brandFonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateTextElement(selectedElement.id, { color: e.target.value })}
                      className="w-12 h-8"
                    />
                    <div className="flex gap-1">
                      {Object.entries(brandColors).map(([name, color]) => (
                        <button
                          key={name}
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: color }}
                          onClick={() => updateTextElement(selectedElement.id, { color })}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Text Alignment</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextElement(selectedElement.id, { textAlign: 'left' })}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextElement(selectedElement.id, { textAlign: 'center' })}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTextElement(selectedElement.id, { textAlign: 'right' })}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Font Weight</Label>
                  <Select
                    value={selectedElement.fontWeight}
                    onValueChange={(value) => updateTextElement(selectedElement.id, { fontWeight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Opacity: {Math.round(selectedElement.opacity * 100)}%</Label>
                  <Slider
                    value={[selectedElement.opacity]}
                    onValueChange={([value]) => updateTextElement(selectedElement.id, { opacity: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Rotation: {selectedElement.rotation}°</Label>
                  <Slider
                    value={[selectedElement.rotation]}
                    onValueChange={([value]) => updateTextElement(selectedElement.id, { rotation: value })}
                    max={360}
                    min={-360}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTextElement(selectedElement.id)}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete Text
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Shape Tools */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Square className="w-4 h-4" />
                Shape Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add rectangle shape
                    console.log('Adding rectangle...');
                  }}
                  disabled={!selectedTemplate}
                >
                  <Square className="w-4 h-4 mr-1" />
                  Rectangle
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add circle shape
                    console.log('Adding circle...');
                  }}
                  disabled={!selectedTemplate}
                >
                  <Circle className="w-4 h-4 mr-1" />
                  Circle
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShapeTools(!showShapeTools)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  More Shapes
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add line
                    console.log('Adding line...');
                  }}
                  disabled={!selectedTemplate}
                >
                  <Move className="w-4 h-4 mr-1" />
                  Line
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Image Tools */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  // Upload image
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      console.log('Uploading image:', file.name);
                    }
                  };
                  input.click();
                }}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageTools(!showImageTools)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit Image
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add from library
                    console.log('Opening image library...');
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Library
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Brand Assets */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Brand Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Brand Colors</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {Object.entries(brandColors).map(([name, color]) => (
                    <button
                      key={name}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      title={name}
                      onClick={() => {
                        // Apply brand color
                        console.log('Applying brand color:', name, color);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add logo
                      console.log('Adding logo...');
                    }}
                  >
                    Logo
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add watermark
                      console.log('Adding watermark...');
                    }}
                  >
                    Watermark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layer Panel */}
          {showLayerPanel && (
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-500">
                  {textElements.length} text elements
                </div>
                <div className="text-sm text-gray-500">
                  {shapes.length} shapes
                </div>
                <div className="text-sm text-gray-500">
                  {images.length} images
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear all layers
                    setTextElements([]);
                    setShapes([]);
                    setImages([]);
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Template Bank</DialogTitle>
            <DialogDescription>
              Choose from {templates.length} pre-designed templates to create your graphic
            </DialogDescription>
          </DialogHeader>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsTemplateDialogOpen(false);
                  }}
                >
                  <div className="relative">
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        // Fallback to a colored placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x300/1c5f9a/ffffff?text=${encodeURIComponent(template.name)}`;
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                      {template.dimensions}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{template.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 2 && (
                      <span className="text-xs text-gray-400">+{template.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or category filter
                </p>
              </div>
            )}
          </div>

          {/* Template Stats */}
          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            Showing {filteredTemplates.length} of {templates.length} templates
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Graphic</DialogTitle>
            <DialogDescription>
              Choose the format and quality for your exported graphic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => exportCanvas('png')}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as PNG
              </Button>
              <Button
                onClick={() => exportCanvas('jpg')}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JPG
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              PNG format preserves transparency, JPG format has smaller file size.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
