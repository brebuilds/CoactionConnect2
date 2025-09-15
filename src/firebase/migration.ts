import { AssetService, ColorService, FontService, SocialService, KnowledgeService } from './services';

// Migration utility to move data from localStorage to Firebase
export const MigrationService = {
  // Migrate branding assets (logos, colors, fonts)
  migrateBrandingAssets: async (projectId: string) => {
    try {
      // Migrate logos
      const savedLogos = localStorage.getItem(`logos-${projectId}`);
      if (savedLogos) {
        const logos = JSON.parse(savedLogos);
        for (const logo of logos) {
          if (logo.asset && logo.asset.startsWith('data:')) {
            // Convert base64 to blob and upload
            const response = await fetch(logo.asset);
            const blob = await response.blob();
            const url = await AssetService.uploadFile(blob, projectId, 'logo');
            
            await AssetService.saveAsset({
              name: logo.name,
              type: logo.type,
              format: logo.format,
              size: logo.size,
              url,
              uploadedBy: logo.uploadedBy,
              projectId
            });
          }
        }
      }

      // Migrate colors
      const savedColors = localStorage.getItem(`color-palette-${projectId}`);
      if (savedColors) {
        const colors = JSON.parse(savedColors);
        for (const color of colors) {
          await ColorService.saveColor({
            name: color.name,
            hex: color.hex,
            usage: color.usage,
            pantone: color.pantone || '',
            projectId
          });
        }
      }

      // Migrate fonts
      const savedFonts = localStorage.getItem(`fonts-${projectId}`);
      if (savedFonts) {
        const fonts = JSON.parse(savedFonts);
        for (const font of fonts) {
          await FontService.saveFont({
            name: font.name,
            weight: font.weight,
            usage: font.usage,
            family: font.family,
            url: font.fontFile,
            fileName: font.fileName,
            fileSize: font.fileSize,
            uploadedBy: font.uploadedBy || 'System',
            projectId
          });
        }
      }

      console.log(`Successfully migrated branding assets for project ${projectId}`);
    } catch (error) {
      console.error('Error migrating branding assets:', error);
    }
  },

  // Migrate social media data
  migrateSocialMedia: async (projectId: string) => {
    try {
      // Migrate pending posts
      const savedPendingPosts = localStorage.getItem(`social-pending-${projectId}`);
      if (savedPendingPosts) {
        const posts = JSON.parse(savedPendingPosts);
        for (const post of posts) {
          await SocialService.savePost({
            content: post.content,
            platforms: post.platforms,
            status: 'pending',
            createdBy: post.createdBy || 'System',
            projectId
          });
        }
      }

      // Migrate scheduled posts
      const savedScheduledPosts = localStorage.getItem(`social-scheduled-${projectId}`);
      if (savedScheduledPosts) {
        const posts = JSON.parse(savedScheduledPosts);
        for (const post of posts) {
          await SocialService.savePost({
            content: post.content,
            platforms: post.platforms,
            status: 'scheduled',
            scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : undefined,
            createdBy: post.createdBy || 'System',
            projectId
          });
        }
      }

      console.log(`Successfully migrated social media data for project ${projectId}`);
    } catch (error) {
      console.error('Error migrating social media data:', error);
    }
  },

  // Migrate knowledge hub files
  migrateKnowledgeFiles: async (projectId: string) => {
    try {
      const savedFiles = localStorage.getItem(`knowledge-files-${projectId}`);
      if (savedFiles) {
        const files = JSON.parse(savedFiles);
        for (const file of files) {
          // Note: This would need the actual file data, not just metadata
          // For now, we'll just migrate the metadata
          await KnowledgeService.uploadFile(
            new File([''], file.fileName, { type: 'text/plain' }), // Placeholder file
            projectId,
            {
              fileName: file.fileName,
              category: file.category,
              tags: file.tags,
              fileType: file.fileType,
              fileSize: file.fileSize,
              uploadedBy: file.uploadedBy,
              projectId
            }
          );
        }
      }

      console.log(`Successfully migrated knowledge files for project ${projectId}`);
    } catch (error) {
      console.error('Error migrating knowledge files:', error);
    }
  },

  // Full migration for a project
  migrateProject: async (projectId: string) => {
    console.log(`Starting migration for project ${projectId}...`);
    
    await MigrationService.migrateBrandingAssets(projectId);
    await MigrationService.migrateSocialMedia(projectId);
    await MigrationService.migrateKnowledgeFiles(projectId);
    
    console.log(`Migration completed for project ${projectId}`);
  },

  // Check if migration is needed
  needsMigration: (projectId: string): boolean => {
    const hasLocalData = 
      localStorage.getItem(`logos-${projectId}`) ||
      localStorage.getItem(`color-palette-${projectId}`) ||
      localStorage.getItem(`fonts-${projectId}`) ||
      localStorage.getItem(`social-pending-${projectId}`) ||
      localStorage.getItem(`social-scheduled-${projectId}`) ||
      localStorage.getItem(`knowledge-files-${projectId}`);
    
    return !!hasLocalData;
  }
};
