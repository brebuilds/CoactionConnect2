import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Download, 
  Upload, 
  Palette, 
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Pencil,
  Settings
} from 'lucide-react';
import { User } from '../App';
import { Project } from './ProjectManager';
import { AssetService, ColorService, FontService } from '../supabase/services';
import { setSyncStatus } from '../utils/sync';

interface BrandingAssetsProps {
  user: User;
  currentProject?: Project;
  canEdit?: boolean;
  canManageBranding?: boolean;
}

interface LogoAsset {
  id: string;
  name: string;
  format: string;
  size: string;
  type: string;
  asset: string;
  uploadDate: Date;
  uploadedBy: string;
}

interface ColorAsset {
  id: string;
  name: string;
  hex: string;
  usage: string;
  pantone?: string;
}

interface FontAsset {
  id: string;
  name: string;
  weight: string;
  usage: string;
  family: string;
  fontFile?: string; // Base64 encoded font file
  fileName?: string; // Original file name
  fileSize?: string; // Formatted file size
  uploadedBy?: string;
  uploadDate?: Date;
}

interface BrandSettings {
  companyName: string;
  primaryLogo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
}

export function BrandingAssets({ user, currentProject, canEdit = true, canManageBranding = true }: BrandingAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingColor, setEditingColor] = useState<number | null>(null);
  const [editingLogo, setEditingLogo] = useState<number | null>(null);
  const [editingFont, setEditingFont] = useState<number | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddColorDialogOpen, setIsAddColorDialogOpen] = useState(false);
  const [isAddFontDialogOpen, setIsAddFontDialogOpen] = useState(false);
  const [isBrandSettingsOpen, setIsBrandSettingsOpen] = useState(false);

  const [newLogo, setNewLogo] = useState({
    name: '',
    type: '',
    format: '',
    file: null as File | null,
    multipleFiles: [] as File[]
  });

  const [newColor, setNewColor] = useState({
    name: '',
    hex: '#000000',
    usage: '',
    pantone: ''
  });

  const [newFont, setNewFont] = useState({
    name: '',
    weight: '',
    usage: '',
    family: '',
    file: null as File | null
  });

  // Initialize brand settings from current project
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    companyName: currentProject?.name || 'Coaction Connect',
    primaryLogo: currentProject?.logo || '/CC-Main-Logo.png',
    colors: currentProject?.colors || {
      primary: '#1c5f9a',
      secondary: '#F8F9FA',
      accent: '#c9741c',
      text: '#2e496c',
      background: '#ffffff'
    }
  });

  const isAdmin = user.role === 'Admin' || user.role === 'SuperAdmin';

  // Get project-specific brand assets
  const getProjectBrandAssets = (projectId: string): LogoAsset[] => {
    const assets: LogoAsset[] = [];
    
    switch (projectId) {
      case 'coaction':
        assets.push(
          { id: 'cc-1', name: 'CC Main Logo', format: 'PNG', size: '2.1 MB', type: 'Main branding', asset: '/CC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'cc-2', name: 'CC Coaction Logo', format: 'JPEG', size: '1.8 MB', type: 'Alternative branding', asset: '/CC-Coaction-Logo.jpeg', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'cc-3', name: 'CC Video Logo Reveal', format: 'MP4', size: '15.2 MB', type: 'Video branding', asset: '/CC-Coaction-Video-Logo-Reveal.mp4', uploadDate: new Date(), uploadedBy: 'System' }
        );
        break;
      case 'zrmc':
        assets.push(
          { id: 'zrmc-1', name: 'ZRMC Main Logo', format: 'PNG', size: '2.1 MB', type: 'Main branding', asset: '/ZRMC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-2', name: 'ZRMC Brand Board', format: 'JPEG', size: '3.2 MB', type: 'Brand guidelines', asset: '/ZRMC-Brand-Board.jpeg', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-3', name: 'ZRMC Icon Transparent', format: 'PNG', size: '850 KB', type: 'Icon', asset: '/ZRMC-Icon-Trans.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-4', name: 'ZRMC Logo Dark Transparent', format: 'PNG', size: '1.1 MB', type: 'Dark backgrounds', asset: '/ZRMC-Logo-Dark-Trans.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-5', name: 'ZRMC Logo on Dark Back', format: 'PNG', size: '1.0 MB', type: 'Dark backgrounds', asset: '/ZRMC-Logo-on-Dark-Back.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-6', name: 'ZRMC Stacked Logo Light', format: 'PNG', size: '1.2 MB', type: 'Light backgrounds', asset: '/ZRMC-Stacked-Logo-Light.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-7', name: 'ZRMC Social Profile', format: 'PNG', size: '900 KB', type: 'Social media', asset: '/ZRMC-Social-Profile.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-8', name: 'ZRMC Video Logo Reveal', format: 'MP4', size: '12.8 MB', type: 'Video branding', asset: '/ZRMC-Video-Logo-Reveal.mp4', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-9', name: 'ZRMC Aerial Map', format: 'JPG', size: '4.5 MB', type: 'Background imagery', asset: '/ZRMC-Aerial-Map.jpg', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-10', name: 'ZRMC Rendering', format: 'PNG', size: '2.8 MB', type: 'Background imagery', asset: '/ZRMC-Rendering.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-11', name: 'ZRMC Header Overlay', format: 'PNG', size: '1.5 MB', type: 'Header overlay', asset: '/ZRMC Header Overlay.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'zrmc-12', name: 'ZRMC Nature Back Overlay', format: 'PNG', size: '2.1 MB', type: 'Background overlay', asset: '/ZRMC-Nature-Back-Overlay.png', uploadDate: new Date(), uploadedBy: 'System' }
        );
        break;
      case 'tgmc':
        assets.push(
          { id: 'tgmc-1', name: 'TGMC Main Logo', format: 'PNG', size: '2.1 MB', type: 'Main branding', asset: '/TGMC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'tgmc-2', name: 'TGMC Brand Board', format: 'PNG', size: '3.2 MB', type: 'Brand guidelines', asset: '/TGMC-Brand-Board.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'tgmc-3', name: 'TGMC Long Logo', format: 'PNG', size: '1.8 MB', type: 'Horizontal branding', asset: '/TGMC-Long-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'tgmc-4', name: 'TGMC Logo Back Gradient', format: 'PNG', size: '1.5 MB', type: 'Background variant', asset: '/TGMC-Logo-Back-Gradient.png', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'tgmc-5', name: 'TGMC Social Preview', format: 'JPG', size: '1.2 MB', type: 'Social media', asset: '/TGMC-Social-Preview.jpg', uploadDate: new Date(), uploadedBy: 'System' },
          { id: 'tgmc-6', name: 'TGMC Video Logo Reveal', format: 'MP4', size: '14.5 MB', type: 'Video branding', asset: '/TGMC-Logo-Reveal.mp4', uploadDate: new Date(), uploadedBy: 'System' }
        );
        break;
    }
    
    return assets;
  };

  // Load project-specific brand settings from localStorage
  useEffect(() => {
    if (currentProject) {
      // Try loading persisted data from Supabase first; fallback to localStorage/sample
      (async () => {
        try {
          // Logos
          const assets = await AssetService.getAssets(currentProject.id, 'logo');
          const mappedLogos: LogoAsset[] = (assets || []).map(a => ({
            id: a.id,
            name: a.name,
            format: a.format,
            size: a.size,
            type: a.type,
            asset: a.url,
            uploadDate: new Date(a.created_at),
            uploadedBy: a.uploaded_by
          }));
          if (mappedLogos.length) setLogos(mappedLogos);

          // Colors
          const colors = await ColorService.getColors(currentProject.id);
          const mappedColors: ColorAsset[] = (colors || []).map(c => ({
            id: c.id,
            name: c.name,
            hex: c.hex,
            usage: c.usage,
            pantone: c.pantone || undefined,
          }));
          if (mappedColors.length) setColorPalette(mappedColors);

          // Fonts
          const fontsData = await FontService.getFonts(currentProject.id);
          const mappedFonts: FontAsset[] = (fontsData || []).map(f => ({
            id: f.id,
            name: f.name,
            weight: f.weight,
            usage: f.usage,
            family: f.family,
            fontFile: f.url,
            fileName: f.file_name,
            fileSize: f.file_size,
            uploadedBy: f.uploaded_by,
            uploadDate: new Date(f.created_at)
          }));
          if (mappedFonts.length) setFonts(mappedFonts);
        } catch (e) {
          // Silent fallback to existing localStorage logic below
          console.warn('Supabase fetch failed, falling back to local defaults:', e);
        }
      })();

      // Load saved settings or initialize with project defaults
      const savedSettings = localStorage.getItem(`brand-settings-${currentProject.id}`);
      if (savedSettings) {
        setBrandSettings(JSON.parse(savedSettings));
      } else {
        setBrandSettings({
          companyName: currentProject.name,
          primaryLogo: currentProject.logo || '/CC-Main-Logo.png',
          colors: currentProject.colors
        });
      }

      // Load saved color palette or initialize with project defaults
      const savedColors = localStorage.getItem(`color-palette-${currentProject.id}`);
      if (savedColors) {
        setColorPalette(JSON.parse(savedColors));
      } else {
        setColorPalette(getDefaultColorPalette(currentProject));
      }

      // Load saved logos or initialize with project defaults
      const savedLogos = localStorage.getItem(`logos-${currentProject.id}`);
      if (savedLogos) {
        setLogos(JSON.parse(savedLogos));
      } else {
        // Use project-specific brand assets
        const projectAssets = getProjectBrandAssets(currentProject.id);
        setLogos(projectAssets);
      }

      // Load saved fonts or initialize with project defaults
      const savedFonts = localStorage.getItem(`fonts-${currentProject.id}`);
      if (savedFonts) {
        setFonts(JSON.parse(savedFonts));
      } else {
        setFonts([
          { 
            id: '1', 
            name: 'Proxima Nova', 
            weight: 'Regular, Medium, Semibold, Bold', 
            usage: 'Body text, interface elements', 
            family: 'Proxima Nova',
            uploadedBy: 'System',
            uploadDate: new Date()
          },
          { 
            id: '2', 
            name: 'Gilroy', 
            weight: 'Medium, Semibold, Bold', 
            usage: 'Headlines and emphasis', 
            family: 'Gilroy',
            uploadedBy: 'System',
            uploadDate: new Date()
          },
        ]);
      }
    }
  }, [currentProject]);

  // Save project-specific brand settings to localStorage
  const saveBrandSettings = (settings: BrandSettings) => {
    setBrandSettings(settings);
    if (currentProject) {
      localStorage.setItem(`brand-settings-${currentProject.id}`, JSON.stringify(settings));
      
      // Update the project's logo in localStorage so it's used in the sidebar
      const updatedProject = {
        ...currentProject,
        logo: settings.primaryLogo
      };
      localStorage.setItem(`project-${currentProject.id}`, JSON.stringify(updatedProject));
    }
    
    // Update CSS custom properties for real-time theme changes
    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.colors.primary);
    root.style.setProperty('--color-secondary', settings.colors.secondary);
    root.style.setProperty('--color-accent', settings.colors.accent);
    root.style.setProperty('--color-foreground', settings.colors.text);
    root.style.setProperty('--color-background', settings.colors.background);
  };

  // Project-specific color palette
  const getDefaultColorPalette = (project?: Project): ColorAsset[] => {
    if (!project) return [];
    
    switch (project.id) {
      case 'coaction':
        return [
          { id: '1', name: 'Coaction Blue', hex: '#1c5f9a', usage: 'Primary brand color, headers, CTAs', pantone: '301 C' },
          { id: '2', name: 'Light Gray', hex: '#F8F9FA', usage: 'Light backgrounds, cards', pantone: 'Cool Gray 1 C' },
          { id: '3', name: 'Coaction Orange', hex: '#c9741c', usage: 'Accent color, highlights', pantone: '138 C' },
          { id: '4', name: 'Coaction Navy', hex: '#2e496c', usage: 'Primary text, body copy', pantone: '533 C' },
          { id: '5', name: 'Pure White', hex: '#FFFFFF', usage: 'Clean backgrounds, cards', pantone: 'White' },
        ];
      case 'zrmc':
        return [
          { id: '1', name: 'Medical Green', hex: '#2B5F3F', usage: 'Primary brand color, trust, healthcare', pantone: '553 C' },
          { id: '2', name: 'Light Mint', hex: '#F0F8F5', usage: 'Light backgrounds, calm spaces', pantone: '7541 C' },
          { id: '3', name: 'Warm Gold', hex: '#E8A317', usage: 'Accent color, warmth, care', pantone: '130 C' },
          { id: '4', name: 'Forest Green', hex: '#1B4332', usage: 'Primary text, professional', pantone: '555 C' },
          { id: '5', name: 'Pure White', hex: '#FFFFFF', usage: 'Clean medical environments', pantone: 'White' },
        ];
      case 'tgmc':
        return [
          { id: '1', name: 'Medical Red', hex: '#8B2635', usage: 'Primary brand color, strength, medical', pantone: '188 C' },
          { id: '2', name: 'Light Rose', hex: '#FDF5F5', usage: 'Light backgrounds, gentle care', pantone: '7422 C' },
          { id: '3', name: 'Warm Gold', hex: '#D4A574', usage: 'Accent color, excellence, care', pantone: '465 C' },
          { id: '4', name: 'Burgundy', hex: '#5D1A1D', usage: 'Primary text, professional', pantone: '7428 C' },
          { id: '5', name: 'Pure White', hex: '#FFFFFF', usage: 'Clean medical environments', pantone: 'White' },
        ];
      default:
        return [];
    }
  };

  const [colorPalette, setColorPalette] = useState<ColorAsset[]>([]);

  const [logos, setLogos] = useState<LogoAsset[]>([
    { id: '1', name: 'Primary Logo', format: 'PNG', size: '2.1 MB', type: 'Main branding', asset: '/CC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
    { id: '2', name: 'Logo Horizontal', format: 'SVG', size: '180 KB', type: 'Website header', asset: '/CC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
    { id: '3', name: 'Logo Icon', format: 'PNG', size: '85 KB', type: 'Social media', asset: '/CC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
    { id: '4', name: 'Logo White', format: 'PNG', size: '1.8 MB', type: 'Dark backgrounds', asset: '/CC-Main-Logo.png', uploadDate: new Date(), uploadedBy: 'System' },
  ]);

  const [fonts, setFonts] = useState<FontAsset[]>([
    { 
      id: '1', 
      name: 'Proxima Nova', 
      weight: 'Regular, Medium, Semibold, Bold', 
      usage: 'Body text, interface elements', 
      family: 'Proxima Nova',
      uploadedBy: 'System',
      uploadDate: new Date()
    },
    { 
      id: '2', 
      name: 'Gilroy', 
      weight: 'Medium, Semibold, Bold', 
      usage: 'Headlines and emphasis', 
      family: 'Gilroy',
      uploadedBy: 'System',
      uploadDate: new Date()
    },
  ]);

  // Always mirror state to localStorage for reliability
  useEffect(() => {
    if (!currentProject) return;
    try {
      localStorage.setItem(`logos-${currentProject.id}`, JSON.stringify(logos));
    } catch {}
  }, [logos, currentProject]);

  useEffect(() => {
    if (!currentProject) return;
    try {
      localStorage.setItem(`color-palette-${currentProject.id}`, JSON.stringify(colorPalette));
    } catch {}
  }, [colorPalette, currentProject]);

  useEffect(() => {
    if (!currentProject) return;
    try {
      localStorage.setItem(`fonts-${currentProject.id}`, JSON.stringify(fonts));
    } catch {}
  }, [fonts, currentProject]);

  // File upload helper
  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogoUpload = async () => {
    if (!newLogo.name || !newLogo.type) return;

    const filesToUpload = newLogo.multipleFiles.length > 0 ? newLogo.multipleFiles : [newLogo.file].filter(Boolean);
    
    if (filesToUpload.length === 0) return;

    const uploadedAssets: LogoAsset[] = [];

    for (const file of filesToUpload) {
      try {
        // Try Supabase first
        const url = currentProject ? await AssetService.uploadFile(file, currentProject.id, 'logo') : await handleFileUpload(file);
        const meta = {
          name: newLogo.multipleFiles.length > 1 ? `${newLogo.name} (${file.name})` : newLogo.name,
          type: 'logo',
          format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: formatFileSize(file.size),
          url,
          project_id: currentProject?.id || 'coaction',
          uploaded_by: user.name
        } as const;
        let id = Date.now().toString() + Math.random();
        try {
          id = await AssetService.saveAsset(meta as any);
        } catch (e) {
          // if saving metadata fails, still keep local
          console.warn('Asset metadata save failed, keeping local only:', e);
          setSyncStatus({ level: 'local-only', message: 'Brand asset saved locally' });
        }
        const logoAsset: LogoAsset = {
          id,
          name: meta.name,
          type: newLogo.type || 'logo',
          format: meta.format,
          size: meta.size,
          asset: meta.url,
          uploadDate: new Date(),
          uploadedBy: user.name
        };
        uploadedAssets.push(logoAsset);
        setSyncStatus({ level: 'synced', message: 'Brand asset saved' });
      } catch (e) {
        // Fallback to base64 local storage if storage upload fails
        console.warn('Asset upload failed, falling back to base64 local:', e);
        const assetUrl = await handleFileUpload(file);
        const logoAsset: LogoAsset = {
          id: Date.now().toString() + Math.random(),
          name: newLogo.multipleFiles.length > 1 ? `${newLogo.name} (${file.name})` : newLogo.name,
          type: newLogo.type,
          format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: formatFileSize(file.size),
          asset: assetUrl,
          uploadDate: new Date(),
          uploadedBy: user.name
        };
        uploadedAssets.push(logoAsset);
        setSyncStatus({ level: 'local-only', message: 'Brand asset saved locally' });
      }
    }

    const updatedLogos = [...uploadedAssets, ...logos];
    setLogos(updatedLogos);
    
    if (currentProject) {
      localStorage.setItem(`logos-${currentProject.id}`, JSON.stringify(updatedLogos));
    }
    
    setNewLogo({ name: '', type: '', format: '', file: null, multipleFiles: [] });
    setIsUploadDialogOpen(false);
    
    // Show success message
    if (uploadedAssets.length > 1) {
      alert(`Successfully uploaded ${uploadedAssets.length} assets!`);
    }
  };

  const handleAddColor = async () => {
    if (!newColor.name || !newColor.hex) return;

    let id = Date.now().toString();
    try {
      if (currentProject) {
        id = await ColorService.saveColor({
          name: newColor.name,
          hex: newColor.hex,
          usage: newColor.usage,
          pantone: newColor.pantone || undefined,
          project_id: currentProject.id
        } as any);
      }
    } catch (e) {
      console.warn('Color save failed, using local only:', e);
      setSyncStatus({ level: 'local-only', message: 'Color saved locally' });
    }

    const colorAsset: ColorAsset = {
      id,
      name: newColor.name,
      hex: newColor.hex,
      usage: newColor.usage,
      pantone: newColor.pantone || undefined
    };

    const updatedColors = [...colorPalette, colorAsset];
    setColorPalette(updatedColors);
    if (currentProject) {
      localStorage.setItem(`color-palette-${currentProject.id}`, JSON.stringify(updatedColors));
    }
    setNewColor({ name: '', hex: '#000000', usage: '', pantone: '' });
    setIsAddColorDialogOpen(false);
    setSyncStatus({ level: 'synced', message: 'Color saved' });
  };

  const handleAddFont = async () => {
    if (!newFont.name || !newFont.family) return;

    let fontFile: string | undefined;
    let fileName: string | undefined;
    let fileSize: string | undefined;

    if (newFont.file) {
      try {
        if (currentProject) {
          fontFile = await AssetService.uploadFile(newFont.file, currentProject.id, 'font');
        } else {
          fontFile = await handleFileUpload(newFont.file);
        }
        fileName = newFont.file.name;
        fileSize = formatFileSize(newFont.file.size);
      } catch (e) {
        console.warn('Font upload failed, using base64 local:', e);
        fontFile = await handleFileUpload(newFont.file);
        fileName = newFont.file.name;
        fileSize = formatFileSize(newFont.file.size);
      }
    }

    let id = Date.now().toString();
    try {
      if (currentProject) {
        id = await FontService.saveFont({
          name: newFont.name,
          weight: newFont.weight,
          usage: newFont.usage,
          family: newFont.family,
          url: fontFile,
          file_name: fileName,
          file_size: fileSize,
          uploaded_by: user.name,
          project_id: currentProject.id
        } as any);
      }
    } catch (e) {
      console.warn('Font metadata save failed, keeping local only:', e);
      setSyncStatus({ level: 'local-only', message: 'Font saved locally' });
    }

    const fontAsset: FontAsset = {
      id,
      name: newFont.name,
      weight: newFont.weight,
      usage: newFont.usage,
      family: newFont.family,
      fontFile,
      fileName,
      fileSize,
      uploadedBy: user.name,
      uploadDate: new Date()
    };

    setFonts(prev => {
      const next = [...prev, fontAsset];
      if (currentProject) {
        localStorage.setItem(`fonts-${currentProject.id}`, JSON.stringify(next));
      }
      return next;
    });
    setNewFont({ name: '', weight: '', usage: '', family: '', file: null });
    setIsAddFontDialogOpen(false);
    setSyncStatus({ level: 'synced', message: 'Font saved' });
  };

  const handleUpdateColor = (index: number, field: string, value: string) => {
    if (!canEdit) return;
    const updatedColors = [...colorPalette];
    updatedColors[index] = { ...updatedColors[index], [field]: value };
    setColorPalette(updatedColors);
    if (currentProject) {
      localStorage.setItem(`color-palette-${currentProject.id}`, JSON.stringify(updatedColors));
    }
  };

  const handleDeleteColor = async (index: number) => {
    if (!canEdit) return;
    const toDelete = colorPalette[index];
    setColorPalette(colorPalette.filter((_, i) => i !== index));
    if (currentProject) {
      const next = colorPalette.filter((_, i) => i !== index);
      localStorage.setItem(`color-palette-${currentProject.id}`, JSON.stringify(next));
    }
    try {
      if (toDelete?.id) await ColorService.deleteColor(toDelete.id);
      setSyncStatus({ level: 'synced', message: 'Color deleted' });
    } catch (e) {
      console.warn('Color delete failed:', e);
      setSyncStatus({ level: 'local-only', message: 'Color deletion saved locally' });
    }
  };

  const handleDeleteLogo = async (index: number) => {
    if (!canEdit) return;
    const toDelete = logos[index];
    const next = logos.filter((_, i) => i !== index);
    setLogos(next);
    if (currentProject) {
      localStorage.setItem(`logos-${currentProject.id}`, JSON.stringify(next));
    }
    try {
      if (toDelete?.id) await AssetService.deleteAsset(toDelete.id);
      setSyncStatus({ level: 'synced', message: 'Logo deleted' });
    } catch (e) {
      console.warn('Logo delete failed:', e);
      setSyncStatus({ level: 'local-only', message: 'Logo deletion saved locally' });
    }
  };

  const handleDeleteFont = async (index: number) => {
    if (!canEdit) return;
    const toDelete = fonts[index];
    const next = fonts.filter((_, i) => i !== index);
    setFonts(next);
    if (currentProject) {
      localStorage.setItem(`fonts-${currentProject.id}`, JSON.stringify(next));
    }
    try {
      if (toDelete?.id) await FontService.deleteFont(toDelete.id);
      setSyncStatus({ level: 'synced', message: 'Font deleted' });
    } catch (e) {
      console.warn('Font delete failed:', e);
      setSyncStatus({ level: 'local-only', message: 'Font deletion saved locally' });
    }
  };

  const handleUpdateLogo = (index: number, field: string, value: string) => {
    if (!canEdit) return;
    const updatedLogos = [...logos];
    updatedLogos[index] = { ...updatedLogos[index], [field]: value };
    setLogos(updatedLogos);
    if (currentProject) {
      localStorage.setItem(`logos-${currentProject.id}`, JSON.stringify(updatedLogos));
    }
    // Fire-and-forget metadata update
    const l = updatedLogos[index];
    if (l?.id) {
      AssetService
        .updateAsset(l.id, { name: l.name, type: l.type, format: l.format, size: l.size } as any)
        .then(() => setSyncStatus({ level: 'synced', message: 'Logo updated' }))
        .catch(() => setSyncStatus({ level: 'local-only', message: 'Logo update saved locally' }));
    } else {
      setSyncStatus({ level: 'local-only', message: 'Logo update saved locally' });
    }
  };

  const handleUpdateFont = (index: number, field: string, value: string) => {
    if (!isAdmin) return;
    const updatedFonts = [...fonts];
    updatedFonts[index] = { ...updatedFonts[index], [field]: value };
    setFonts(updatedFonts);
    if (currentProject) {
      localStorage.setItem(`fonts-${currentProject.id}`, JSON.stringify(updatedFonts));
    }
    // Fire-and-forget metadata update
    const f = updatedFonts[index];
    if (f?.id) {
      FontService
        .updateFont(f.id, { name: f.name, weight: f.weight, usage: f.usage, family: f.family } as any)
        .then(() => setSyncStatus({ level: 'synced', message: 'Font updated' }))
        .catch(() => setSyncStatus({ level: 'local-only', message: 'Font update saved locally' }));
    } else {
      setSyncStatus({ level: 'local-only', message: 'Font update saved locally' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground font-bold mb-2">Branding Assets</h1>
          <p className="text-foreground/70">
            {isAdmin 
              ? `Manage and edit all brand materials for ${brandSettings.companyName}`
              : `Access all brand materials for ${brandSettings.companyName}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Dialog open={isBrandSettingsOpen} onOpenChange={setIsBrandSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Brand Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Brand Settings</DialogTitle>
                    <DialogDescription>
                      Configure your company branding and theme colors.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={brandSettings.companyName}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryLogo">Primary Logo</Label>
                      <Select 
                        value={brandSettings.primaryLogo} 
                        onValueChange={(value) => setBrandSettings(prev => ({ ...prev, primaryLogo: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary logo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="/CC-Main-Logo.png">
                            <div className="flex items-center gap-2">
                              <img src="/CC-Main-Logo.png" alt="Default" className="w-6 h-6 object-contain" />
                              Default Logo
                            </div>
                          </SelectItem>
                          {logos.map((logoAsset) => (
                            <SelectItem key={logoAsset.id} value={logoAsset.asset}>
                              <div className="flex items-center gap-2">
                                <img src={logoAsset.asset} alt={logoAsset.name} className="w-6 h-6 object-contain" />
                                {logoAsset.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-foreground/60 mt-1">
                        Choose the main logo that will be used throughout the application
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={brandSettings.colors.primary}
                          onChange={(e) => setBrandSettings(prev => ({ 
                            ...prev, 
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={brandSettings.colors.primary}
                          onChange={(e) => setBrandSettings(prev => ({ 
                            ...prev, 
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          placeholder="#4A90A4"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsBrandSettingsOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        saveBrandSettings(brandSettings);
                        setIsBrandSettingsOpen(false);
                      }}>
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {canManageBranding && (
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Asset
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload New Logo</DialogTitle>
                    <DialogDescription>
                      Add a new logo asset to your brand library.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logoName">Logo Name</Label>
                      <Input
                        id="logoName"
                        value={newLogo.name}
                        onChange={(e) => setNewLogo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Primary Logo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logoType">Usage Type</Label>
                      <Select onValueChange={(value) => setNewLogo(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select usage type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main branding">Main branding</SelectItem>
                          <SelectItem value="Website header">Website header</SelectItem>
                          <SelectItem value="Social media">Social media</SelectItem>
                          <SelectItem value="Dark backgrounds">Dark backgrounds</SelectItem>
                          <SelectItem value="Print materials">Print materials</SelectItem>
                          <SelectItem value="Merchandise">Merchandise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="logoFile">Logo File</Label>
                      <Input
                        id="logoFile"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 10) {
                            alert('Please select no more than 10 files at once.');
                            return;
                          }
                          setNewLogo(prev => ({ ...prev, file: files[0] || null, multipleFiles: files }));
                        }}
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        You can select up to 10 files at once for bulk upload
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLogoUpload} disabled={!newLogo.name || !newLogo.type || (!newLogo.file && newLogo.multipleFiles.length === 0)}>
                        {newLogo.multipleFiles.length > 1 ? `Upload ${newLogo.multipleFiles.length} Assets` : 'Upload Logo'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="border-accent/20 shadow-sm bg-background">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
            <Input
              placeholder="Search brand assets..."
              className="pl-10 bg-secondary/50 border-accent/30 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets Tabs - Simplified to 3 tabs only */}
      <Tabs defaultValue="logos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="logos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Logos</TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Colors</TabsTrigger>
          <TabsTrigger value="fonts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Typography</TabsTrigger>
        </TabsList>

        <TabsContent value="logos" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logoItem, index) => (
              <Card key={logoItem.id} className="border-accent/20 shadow-sm hover:shadow-md transition-shadow bg-background">
                <CardContent className="p-6">
                  <div className="w-full h-32 bg-secondary/50 rounded-lg flex items-center justify-center mb-4 border border-accent/20">
                    <img src={logoItem.asset} alt={logoItem.name} className="max-h-20 max-w-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {editingLogo === index ? (
                        <Input
                          value={logoItem.name}
                          onChange={(e) => handleUpdateLogo(index, 'name', e.target.value)}
                          className="text-sm font-medium"
                        />
                      ) : (
                        <h3 className="text-foreground font-medium">{logoItem.name}</h3>
                      )}
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="bg-accent/20 text-foreground">{logoItem.format}</Badge>
                        {isAdmin && canManageBranding && (
                            <div className="flex gap-1">
                              {editingLogo === index ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLogo(null)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Save className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLogo(null)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLogo(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteLogo(index)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                    {editingLogo === index ? (
                      <Input
                        value={logoItem.type}
                        onChange={(e) => handleUpdateLogo(index, 'type', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground/60">{logoItem.type}</p>
                    )}
                    <p className="text-xs text-foreground/40">{logoItem.size}</p>
                    <p className="text-xs text-foreground/40">Uploaded by {logoItem.uploadedBy}</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Dialog open={isAddColorDialogOpen} onOpenChange={setIsAddColorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Color
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Color</DialogTitle>
                    <DialogDescription>
                      Add a new color to your brand palette.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="colorName">Color Name</Label>
                      <Input
                        id="colorName"
                        value={newColor.name}
                        onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Ocean Blue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="colorHex">Hex Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={newColor.hex}
                          onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={newColor.hex}
                          onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="colorUsage">Usage Description</Label>
                      <Textarea
                        id="colorUsage"
                        value={newColor.usage}
                        onChange={(e) => setNewColor(prev => ({ ...prev, usage: e.target.value }))}
                        placeholder="Describe when and how to use this color"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddColorDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddColor} disabled={!newColor.name || !newColor.hex}>
                        Add Color
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {colorPalette.map((color, index) => (
              <Card key={color.id} className="border-accent/20 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div 
                    className="w-full h-24 rounded-lg mb-4 shadow-inner border border-foreground/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {editingColor === index ? (
                        <Input
                          value={color.name}
                          onChange={(e) => handleUpdateColor(index, 'name', e.target.value)}
                          className="text-sm font-bold"
                        />
                      ) : (
                        <h3 className="text-foreground font-bold">{color.name}</h3>
                      )}
                      {isAdmin && (
                        <div className="flex gap-1">
                          {editingColor === index ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingColor(null)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingColor(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingColor(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteColor(index)}
                                className="h-6 w-6 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingColor === index ? (
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color.hex}
                          onChange={(e) => handleUpdateColor(index, 'hex', e.target.value)}
                          className="w-8 h-6 p-0 border-0"
                        />
                        <Input
                          value={color.hex}
                          onChange={(e) => handleUpdateColor(index, 'hex', e.target.value)}
                          className="text-xs flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-foreground">{color.hex.toUpperCase()}</p>
                    )}
                    {editingColor === index ? (
                      <Input
                        value={color.usage}
                        onChange={(e) => handleUpdateColor(index, 'usage', e.target.value)}
                        className="text-xs"
                      />
                    ) : (
                      <p className="text-xs text-foreground/60">{color.usage}</p>
                    )}
                    {color.pantone && (
                      <p className="text-xs text-foreground/40">Pantone: {color.pantone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-6">
          <div className="flex justify-end mb-4">
            {canEdit && (
              <Dialog open={isAddFontDialogOpen} onOpenChange={setIsAddFontDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Font
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Font</DialogTitle>
                    <DialogDescription>
                      Add a new font to your typography system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pb-4">
                    <div>
                      <Label htmlFor="fontName">Font Name</Label>
                      <Input
                        id="fontName"
                        value={newFont.name}
                        onChange={(e) => setNewFont(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Open Sans"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Input
                        id="fontFamily"
                        value={newFont.family}
                        onChange={(e) => setNewFont(prev => ({ ...prev, family: e.target.value }))}
                        placeholder="e.g., Open Sans, sans-serif"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontFile">Font File (Optional)</Label>
                      <Input
                        id="fontFile"
                        type="file"
                        accept=".woff,.woff2,.ttf,.otf"
                        onChange={(e) => setNewFont(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Supported formats: WOFF, WOFF2, TTF, OTF
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="fontWeight">Available Weights</Label>
                      <Input
                        id="fontWeight"
                        value={newFont.weight}
                        onChange={(e) => setNewFont(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="e.g., Regular, Medium, Bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fontUsage">Usage</Label>
                      <Textarea
                        id="fontUsage"
                        value={newFont.usage}
                        onChange={(e) => setNewFont(prev => ({ ...prev, usage: e.target.value }))}
                        placeholder="Describe when to use this font"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setIsAddFontDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFont} disabled={!newFont.name || !newFont.family}>
                      Add Font
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {fonts.map((font, index) => (
              <Card key={font.id} className="border-accent/20 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {editingFont === index ? (
                        <Input
                          value={font.name}
                          onChange={(e) => handleUpdateFont(index, 'name', e.target.value)}
                          className="font-bold"
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground font-bold" style={{ fontFamily: font.family }}>{font.name}</h3>
                            {font.fontFile && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                Custom Font
                              </Badge>
                            )}
                          </div>
                          {/* Font Preview */}
                          <div className="p-3 bg-accent/10 rounded-lg">
                            <p className="text-sm text-foreground/80 mb-1">Preview:</p>
                            <p 
                              className="text-lg font-medium" 
                              style={{ 
                                fontFamily: font.family,
                                fontWeight: font.weight === 'Bold' ? 'bold' : font.weight === 'Light' ? '300' : 'normal'
                              }}
                            >
                              The quick brown fox jumps over the lazy dog
                            </p>
                            <p 
                              className="text-sm text-foreground/70 mt-1" 
                              style={{ 
                                fontFamily: font.family,
                                fontWeight: font.weight === 'Bold' ? 'bold' : font.weight === 'Light' ? '300' : 'normal'
                              }}
                            >
                              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 1234567890
                            </p>
                          </div>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex gap-1">
                          {editingFont === index ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFont(null)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFont(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingFont(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFont(index)}
                                className="h-6 w-6 p-0 text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-2xl mb-2" style={{ fontFamily: font.family }}>Aa</p>
                      <p className="text-sm" style={{ fontFamily: font.family }}>The quick brown fox jumps over the lazy dog</p>
                    </div>
                    
                    {editingFont === index ? (
                      <>
                        <Input
                          value={font.weight}
                          onChange={(e) => handleUpdateFont(index, 'weight', e.target.value)}
                          placeholder="Available weights"
                          className="text-sm"
                        />
                        <Input
                          value={font.usage}
                          onChange={(e) => handleUpdateFont(index, 'usage', e.target.value)}
                          placeholder="Usage description"
                          className="text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-foreground/60">{font.weight}</p>
                        <p className="text-sm text-foreground/60">{font.usage}</p>
                      </>
                    )}

                    {/* Font file information */}
                    {font.fontFile && (
                      <div className="pt-2 border-t border-accent/20">
                        <div className="flex items-center justify-between text-xs text-foreground/60">
                          <span>{font.fileName}</span>
                          <span>{font.fileSize}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-foreground/40 mt-1">
                          <span>Uploaded by {font.uploadedBy}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              // Create download link for font file
                              const link = document.createElement('a');
                              link.href = font.fontFile!;
                              link.download = font.fileName || `${font.name}.font`;
                              link.click();
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Placeholder for fonts without files */}
                    {!font.fontFile && font.uploadedBy !== 'System' && (
                      <div className="pt-2 border-t border-accent/20">
                        <div className="flex items-center justify-between text-xs text-foreground/40">
                          <span>No font file uploaded</span>
                          <span className="text-foreground/60">Web font only</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
