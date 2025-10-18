// Airtable Services for CoactionConnect2
// Single base with linked tables approach

import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_BASE_URL, TABLE_NAMES } from './config';

// Generic Airtable API call
const airtableRequest = async (table: string, method: string = 'GET', data?: any) => {
  const url = `${AIRTABLE_BASE_URL}/${AIRTABLE_BASE_ID}/${table}`;
  
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

// Project Management
export const ProjectService = {
  // Get all projects
  getProjects: async (): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.projects, 'GET');
    
    return result.records.map((record: any) => ({
      id: record.id,
      name: record.fields['Project Name'],
      description: record.fields.Description,
      primaryColor: record.fields['Primary Color'],
      mainLogo: record.fields['Main Logo'],
      created_at: record.fields['Created Date']
    }));
  },

  // Get project by ID
  getProject: async (projectId: string): Promise<any> => {
    const result = await airtableRequest(TABLE_NAMES.projects, 'GET');
    
    const project = result.records.find((record: any) => 
      record.fields['Project Name'] === projectId
    );
    
    if (project) {
      return {
        id: project.id,
        name: project.fields['Project Name'],
        description: project.fields.Description,
        primaryColor: project.fields['Primary Color'],
        mainLogo: project.fields['Main Logo'],
        created_at: project.fields['Created Date']
      };
    }
    
    return null;
  }
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
        'Logo Name': asset.name,
        'Type': asset.type || assetType,
        'Format': asset.format,
        'Size': asset.size,
        'File': asset.url ? [{ url: asset.url }] : undefined,
        'Project': [projectId], // Link to Projects table
        'Uploaded by': asset.uploadedBy,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(tableName, 'POST', record);
    return result.id;
  },

  // Get assets for a project
  getAssets: async (projectId: string, assetType: string): Promise<any[]> => {
    const tableName = assetType === 'logo' ? TABLE_NAMES.logos : 
                     assetType === 'color' ? TABLE_NAMES.colors : TABLE_NAMES.fonts;
    
    const result = await airtableRequest(tableName, 'GET');
    
    return result.records
      .filter((record: any) => {
        // Check if the linked Project field contains our projectId
        const linkedProjects = record.fields.Project || [];
        return linkedProjects.includes(projectId);
      })
      .map((record: any) => ({
        id: record.id,
        name: record.fields['Logo Name'],
        type: record.fields.Type,
        format: record.fields.Format,
        size: record.fields.Size,
        url: record.fields.File?.[0]?.url,
        project_id: projectId,
        uploaded_by: record.fields['Uploaded by'],
        created_at: record.fields['Upload Date']
      }));
  },

  // Update asset
  updateAsset: async (assetId: string, updates: any, assetType: string): Promise<void> => {
    const tableName = assetType === 'logo' ? TABLE_NAMES.logos : 
                     assetType === 'color' ? TABLE_NAMES.colors : TABLE_NAMES.fonts;
    
    const record = {
      fields: updates
    };
    
    await airtableRequest(tableName, 'PATCH', record);
  },

  // Delete asset
  deleteAsset: async (assetId: string, assetType: string): Promise<void> => {
    const tableName = assetType === 'logo' ? TABLE_NAMES.logos : 
                     assetType === 'color' ? TABLE_NAMES.colors : TABLE_NAMES.fonts;
    
    await airtableRequest(tableName, 'DELETE');
  }
};

// Color Management
export const ColorService = {
  saveColor: async (color: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Color Name': color.name,
        'Hex Code': color.hex,
        'Usage': color.usage,
        'Pantone': color.pantone || '',
        'Project': [projectId], // Link to Projects table
        'Created Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(TABLE_NAMES.colors, 'POST', record);
    return result.id;
  },

  getColors: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.colors, 'GET');
    
    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        return linkedProjects.includes(projectId);
      })
      .map((record: any) => ({
        id: record.id,
        name: record.fields['Color Name'],
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
        'Font Name': font.name,
        'Weight': font.weight,
        'Usage': font.usage,
        'Family': font.family,
        'File': font.url ? [{ url: font.url }] : undefined,
        'File Name': font.file_name,
        'File Size': font.file_size,
        'Project': [projectId], // Link to Projects table
        'Uploaded By': font.uploadedBy,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(TABLE_NAMES.fonts, 'POST', record);
    return result.id;
  },

  getFonts: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.fonts, 'GET');
    
    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        return linkedProjects.includes(projectId);
      })
      .map((record: any) => ({
        id: record.id,
        name: record.fields['Font Name'],
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
        'Project': [projectId], // Link to Projects table
        'Uploaded by': metadata.uploaded_by,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(TABLE_NAMES.knowledgeFiles, 'POST', record);
    return result.id;
  },

  getFiles: async (projectId: string): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.knowledgeFiles, 'GET');
    
    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        return linkedProjects.includes(projectId);
      })
      .map((record: any) => ({
        id: record.id,
        file_name: record.fields['File Name'],
        category: record.fields.Category,
        tags: record.fields.Tags ? record.fields.Tags.split(', ') : [],
        file_type: record.fields['File Type'],
        file_size: record.fields['File Size'],
        url: record.fields.File?.[0]?.url,
        uploaded_by: record.fields['Uploaded by'],
        created_at: record.fields['Upload Date']
      }));
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await airtableRequest(TABLE_NAMES.knowledgeFiles, 'DELETE');
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
        'Project': [projectId], // Link to Projects table
        'Created': new Date().toISOString()
      }
    };

    const result = await airtableRequest(TABLE_NAMES.socialPosts, 'POST', record);
    return result.id;
  },

  getPosts: async (projectId: string, status?: string): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.socialPosts, 'GET');
    
    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        const matchesProject = linkedProjects.includes(projectId);
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
        created_at: record.fields.Created
      }));
  },

  updatePost: async (postId: string, updates: any): Promise<void> => {
    const record = {
      fields: updates
    };
    
    await airtableRequest(TABLE_NAMES.socialPosts, 'PATCH', record);
  },

  deletePost: async (postId: string): Promise<void> => {
    await airtableRequest(TABLE_NAMES.socialPosts, 'DELETE');
  }
};

// Content Bank Management
export const ContentBankService = {
  // Save content to Airtable
  saveContent: async (content: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Content Title': content.title,
        'Content Text': content.text,
        'Category': content.category,
        'Tags': content.tags?.join(', ') || '',
        'Content Type': content.type, // 'caption', 'post', 'hashtag', 'quote'
        'Platform': content.platform || '',
        'Tone': content.tone || '',
        'Project': [projectId],
        'Created By': content.createdBy,
        'Created Date': new Date().toISOString(),
        'Usage Count': 0,
        'Is Active': true
      }
    };

    const result = await airtableRequest(TABLE_NAMES.contentBank, 'POST', { records: [record] });
    return result.records[0].id;
  },

  // Get content for a project
  getContent: async (projectId: string, filters?: { category?: string; type?: string; platform?: string }): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.contentBank, 'GET');

    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        const matchesProject = linkedProjects.includes(projectId);
        const matchesCategory = !filters?.category || record.fields.Category === filters.category;
        const matchesType = !filters?.type || record.fields['Content Type'] === filters.type;
        const matchesPlatform = !filters?.platform || record.fields.Platform === filters.platform;
        const isActive = record.fields['Is Active'] !== false;
        
        return matchesProject && matchesCategory && matchesType && matchesPlatform && isActive;
      })
      .map((record: any) => ({
        id: record.id,
        title: record.fields['Content Title'],
        text: record.fields['Content Text'],
        category: record.fields.Category,
        tags: record.fields.Tags ? record.fields.Tags.split(', ') : [],
        type: record.fields['Content Type'],
        platform: record.fields.Platform,
        tone: record.fields.Tone,
        usageCount: record.fields['Usage Count'] || 0,
        createdBy: record.fields['Created By'],
        createdAt: new Date(record.fields['Created Date'])
      }));
  },

  // Update content usage
  updateUsage: async (contentId: string): Promise<void> => {
    const record = {
      records: [{
        id: contentId,
        fields: {
          'Usage Count': '+1' // Increment usage count
        }
      }]
    };

    await airtableRequest(TABLE_NAMES.contentBank, 'PATCH', record);
  },

  // Delete content
  deleteContent: async (contentId: string): Promise<void> => {
    await airtableRequest(`${TABLE_NAMES.contentBank}/${contentId}`, 'DELETE');
  }
};

// Graphic Templates Management
export const GraphicTemplateService = {
  // Save a new graphic template
  saveTemplate: async (template: any, projectId: string): Promise<string> => {
    const record = {
      fields: {
        'Template Name': template.name,
        'Category': template.category,
        'Image URL': template.imageUrl,
        'Dimensions': template.dimensions || '',
        'Tags': template.tags?.join(', ') || '',
        'Project': [projectId], // Link to Projects table
        'Uploaded By': template.uploadedBy,
        'Upload Date': new Date().toISOString()
      }
    };

    const result = await airtableRequest(TABLE_NAMES.graphicTemplates, 'POST', { records: [record] });
    return result.records[0].id;
  },

  // Get all templates for a project
  getTemplates: async (projectId: string, category?: string): Promise<any[]> => {
    const result = await airtableRequest(TABLE_NAMES.graphicTemplates, 'GET');

    return result.records
      .filter((record: any) => {
        const linkedProjects = record.fields.Project || [];
        const matchesProject = linkedProjects.includes(projectId);
        const matchesCategory = !category || category === 'All' || record.fields.Category === category;
        return matchesProject && matchesCategory;
      })
      .map((record: any) => ({
        id: record.id,
        name: record.fields['Template Name'],
        category: record.fields.Category,
        imageUrl: record.fields['Image URL'],
        dimensions: record.fields.Dimensions,
        tags: record.fields.Tags ? record.fields.Tags.split(', ') : [],
        uploadedBy: record.fields['Uploaded By'],
        uploadedAt: new Date(record.fields['Upload Date'])
      }));
  },

  // Update a template
  updateTemplate: async (templateId: string, updates: any): Promise<void> => {
    const record = {
      records: [{
        id: templateId,
        fields: {
          'Template Name': updates.name,
          'Category': updates.category,
          'Image URL': updates.imageUrl,
          'Dimensions': updates.dimensions,
          'Tags': updates.tags?.join(', ')
        }
      }]
    };

    await airtableRequest(TABLE_NAMES.graphicTemplates, 'PATCH', record);
  },

  // Delete a template
  deleteTemplate: async (templateId: string): Promise<void> => {
    await airtableRequest(`${TABLE_NAMES.graphicTemplates}/${templateId}`, 'DELETE');
  }
};
