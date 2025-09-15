import { supabase } from './client';
import { Database } from './client';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

type Color = Database['public']['Tables']['colors']['Row'];
type ColorInsert = Database['public']['Tables']['colors']['Insert'];
type ColorUpdate = Database['public']['Tables']['colors']['Update'];

type Font = Database['public']['Tables']['fonts']['Row'];
type FontInsert = Database['public']['Tables']['fonts']['Insert'];
type FontUpdate = Database['public']['Tables']['fonts']['Update'];

type SocialPost = Database['public']['Tables']['social_posts']['Row'];
type SocialPostInsert = Database['public']['Tables']['social_posts']['Insert'];
type SocialPostUpdate = Database['public']['Tables']['social_posts']['Update'];

type KnowledgeFile = Database['public']['Tables']['knowledge_files']['Row'];
type KnowledgeFileInsert = Database['public']['Tables']['knowledge_files']['Insert'];

// Asset Management
export const AssetService = {
  // Upload file to Supabase Storage
  uploadFile: async (file: File, projectId: string, assetType: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `projects/${projectId}/${assetType}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);
    
    return publicUrl;
  },

  // Save asset metadata
  saveAsset: async (asset: Omit<AssetInsert, 'id' | 'created_at'>): Promise<string> => {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  // Get assets for a project
  getAssets: async (projectId: string, assetType: string): Promise<Asset[]> => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', assetType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update asset
  updateAsset: async (assetId: string, updates: AssetUpdate): Promise<void> => {
    const { error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', assetId);
    
    if (error) throw error;
  },

  // Delete asset
  deleteAsset: async (assetId: string): Promise<void> => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);
    
    if (error) throw error;
  }
};

// Color Management
export const ColorService = {
  saveColor: async (color: Omit<ColorInsert, 'id' | 'created_at'>): Promise<string> => {
    const { data, error } = await supabase
      .from('colors')
      .insert(color)
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  getColors: async (projectId: string): Promise<Color[]> => {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  updateColor: async (colorId: string, updates: ColorUpdate): Promise<void> => {
    const { error } = await supabase
      .from('colors')
      .update(updates)
      .eq('id', colorId);
    
    if (error) throw error;
  },

  deleteColor: async (colorId: string): Promise<void> => {
    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('id', colorId);
    
    if (error) throw error;
  }
};

// Font Management
export const FontService = {
  saveFont: async (font: Omit<FontInsert, 'id' | 'created_at'>): Promise<string> => {
    const { data, error } = await supabase
      .from('fonts')
      .insert(font)
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  getFonts: async (projectId: string): Promise<Font[]> => {
    const { data, error } = await supabase
      .from('fonts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  updateFont: async (fontId: string, updates: FontUpdate): Promise<void> => {
    const { error } = await supabase
      .from('fonts')
      .update(updates)
      .eq('id', fontId);
    
    if (error) throw error;
  },

  deleteFont: async (fontId: string): Promise<void> => {
    const { error } = await supabase
      .from('fonts')
      .delete()
      .eq('id', fontId);
    
    if (error) throw error;
  }
};

// Social Media Management
export const SocialService = {
  savePost: async (post: Omit<SocialPostInsert, 'id' | 'created_at'>): Promise<string> => {
    const { data, error } = await supabase
      .from('social_posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  getPosts: async (projectId: string, status?: string): Promise<SocialPost[]> => {
    let query = supabase
      .from('social_posts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  updatePost: async (postId: string, updates: SocialPostUpdate): Promise<void> => {
    const { error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', postId);
    
    if (error) throw error;
  },

  deletePost: async (postId: string): Promise<void> => {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
  }
};

// Knowledge Hub Management
export const KnowledgeService = {
  uploadFile: async (file: File, projectId: string, metadata: Omit<KnowledgeFileInsert, 'id' | 'url' | 'created_at'>): Promise<string> => {
    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `projects/${projectId}/knowledge/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('knowledge')
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('knowledge')
      .getPublicUrl(filePath);
    
    // Save metadata
    const { data: fileData, error: dbError } = await supabase
      .from('knowledge_files')
      .insert({
        ...metadata,
        url: publicUrl
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    return fileData.id;
  },

  getFiles: async (projectId: string): Promise<KnowledgeFile[]> => {
    const { data, error } = await supabase
      .from('knowledge_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  deleteFile: async (fileId: string): Promise<void> => {
    const { error } = await supabase
      .from('knowledge_files')
      .delete()
      .eq('id', fileId);
    
    if (error) throw error;
  }
};
