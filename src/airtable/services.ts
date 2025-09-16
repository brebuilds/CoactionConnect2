// Airtable Services for CoactionConnect2
// Replace Supabase/Firebase with Airtable API

import { AIRTABLE_API_KEY, AIRTABLE_BASES, AIRTABLE_BASE_URL, TABLE_NAMES } from './config';

// Generic Airtable API call
const airtableRequest = async (baseId: string, table: string, method: string = 'GET', data?: any) => {
  const url = `${AIRTABLE_BASE_URL}/${baseId}/${table}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  return response.json();
};

// Asset Management (Logos, Colors, Fonts)
export const AssetService = {
  // Upload file to Airtable
  uploadFile: async (file: File, projectId: string, assetType: string): Promise<string> => {
    // For Airtable, we'll return a placeholder URL
    // In practice, you'd upload to a file service and store the URL
    return `https://example.com/uploads/${Date.now()}_${file.name}`;
  },

  // Save asset metadata to Airtable
  saveAsset: async (asset: any, projectId: string, assetType: string): Promise<string> => {
    const tableName = assetType === 'logo' ? TABLE_NAMES.logos : 
                     assetType === 'color' ? TABLE_NAMES.colors : TABLE_NAMES.fonts;
    
    const record = {
      fields: {
        'Name': asset.name,
        'Type': asset.type || assetType,
        'Format': asset.format,
        'Size': asset.size,
        'File': asset.url ? [{ url: asset.url }] : undefined,
        'Project': projectId,
        'Uploaded By': asset.uploadedBy,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(AIRTABLE_BASES.branding, tableName, 'POST', record);
    return result.id;
  },

  // Get assets for a project
  getAssets: async (projectId: string, assetType: string): Promise<any[]> => {
    const tableName = assetType === 'logo' ? TABLE_NAMES.logos : 
                     assetType === 'color' ? TABLE_NAMES.colors : TABLE_NAMES.fonts;
    
    const result = await airtableRequest(AIRTABLE_BASES.branding, tableName, 'GET');
    
    return result.records
      .filter((record: any) => record.fields.Project === projectId)
      .map((record: any) => ({
        id: record.id,
        name: record.fields.Name,
        type: record.fields.Type,
        format: record.fields.Format,
        size: record.fields.Size,
        url: record.fields.File?.[0]?.url,
        project_id: record.fields.Project,
        uploaded_by: record.fields['Uploaded By'],
        created_at: record.fields['Upload Date']
      }));
  },

  // Update asset
  updateAsset: async (assetId: string, updates: any): Promise<void> => {
    const record = {
      fields: updates
    };
    
    await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.logos, 'PATCH', record);
  },

  // Delete asset
  deleteAsset: async (assetId: string): Promise<void> => {
    await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.logos, 'DELETE');
  }
};

// Color Management
export const ColorService = {
  saveColor: async (color: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Name': color.name,
        'Hex Code': color.hex,
        'Usage': color.usage,
        'Pantone': color.pantone || '',
        'Project': projectId,
        'Created Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.colors, 'POST', record);
    return result.id;
  },

  getColors: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.colors, 'GET');
    
    return result.records
      .filter((record: any) => record.fields.Project === projectId)
      .map((record: any) => ({
        id: record.id,
        name: record.fields.Name,
        hex: record.fields['Hex Code'],
        usage: record.fields.Usage,
        pantone: record.fields.Pantone
      }));
  }
};

// Font Management
export const FontService = {
  saveFont: async (font: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Name': font.name,
        'Weight': font.weight,
        'Usage': font.usage,
        'Family': font.family,
        'File': font.url ? [{ url: font.url }] : undefined,
        'Project': projectId,
        'Uploaded By': font.uploadedBy
      }
    };

    const result = await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.fonts, 'POST', record);
    return result.id;
  },

  getFonts: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(AIRTABLE_BASES.branding, TABLE_NAMES.fonts, 'GET');
    
    return result.records
      .filter((record: any) => record.fields.Project === projectId)
      .map((record: any) => ({
        id: record.id,
        name: record.fields.Name,
        weight: record.fields.Weight,
        usage: record.fields.Usage,
        family: record.fields.Family,
        url: record.fields.File?.[0]?.url,
        file_name: record.fields.File?.[0]?.filename,
        file_size: record.fields.File?.[0]?.size,
        uploaded_by: record.fields['Uploaded By']
      }));
  }
};

// Knowledge Hub Management
export const KnowledgeService = {
  uploadFile: async (file: File, projectId: string, metadata: any): Promise<string> => {
    // Upload file and get URL
    const fileUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
    
    const record = {
      fields: {
        'File Name': metadata.file_name,
        'Category': metadata.category,
        'Tags': metadata.tags.join(', '),
        'File Type': metadata.file_type,
        'File Size': metadata.file_size,
        'File': [{ url: fileUrl }],
        'Project': projectId,
        'Uploaded By': metadata.uploaded_by,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(AIRTABLE_BASES.knowledge, TABLE_NAMES.knowledgeFiles, 'POST', record);
    return result.id;
  },

  getFiles: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(AIRTABLE_BASES.knowledge, TABLE_NAMES.knowledgeFiles, 'GET');
    
    return result.records
      .filter((record: any) => record.fields.Project === projectId)
      .map((record: any) => ({
        id: record.id,
        file_name: record.fields['File Name'],
        category: record.fields.Category,
        tags: record.fields.Tags ? record.fields.Tags.split(', ') : [],
        file_type: record.fields['File Type'],
        file_size: record.fields['File Size'],
        url: record.fields.File?.[0]?.url,
        uploaded_by: record.fields['Uploaded By'],
        created_at: record.fields['Upload Date']
      }));
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await airtableRequest(AIRTABLE_BASES.knowledge, TABLE_NAMES.knowledgeFiles, 'DELETE');
  }
};

// Social Media Management
export const SocialService = {
  savePost: async (post: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Content': post.content,
        'Platforms': post.platforms,
        'Status': post.status,
        'Scheduled Date': post.scheduledDate,
        'Publish Date': post.publishDate,
        'Created By': post.createdBy,
        'Approved By': post.approvedBy,
        'Project': projectId,
        'Created Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(AIRTABLE_BASES.social, TABLE_NAMES.socialPosts, 'POST', record);
    return result.id;
  },

  getPosts: async (projectId: string, status?: string): Promise<any[]> => {
    const result = await airtableRequest(AIRTABLE_BASES.social, TABLE_NAMES.socialPosts, 'GET');
    
    return result.records
      .filter((record: any) => {
        const matchesProject = record.fields.Project === projectId;
        const matchesStatus = !status || record.fields.Status === status;
        return matchesProject && matchesStatus;
      })
      .map((record: any) => ({
        id: record.id,
        content: record.fields.Content,
        platforms: record.fields.Platforms,
        status: record.fields.Status,
        scheduled_date: record.fields['Scheduled Date'],
        publish_date: record.fields['Publish Date'],
        created_by: record.fields['Created By'],
        approved_by: record.fields['Approved By'],
        created_at: record.fields['Created Date']
      }));
  },

  updatePost: async (postId: string, updates: any): Promise<void> => {
    const record = {
      fields: updates
    };
    
    await airtableRequest(AIRTABLE_BASES.social, TABLE_NAMES.socialPosts, 'PATCH', record);
  },

  deletePost: async (postId: string): Promise<void> => {
    await airtableRequest(AIRTABLE_BASES.social, TABLE_NAMES.socialPosts, 'DELETE');
  }
};
