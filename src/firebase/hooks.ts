import { useState, useEffect } from 'react';
import { AssetService, ColorService, FontService } from './services';
import { FirebaseAsset, FirebaseColor, FirebaseFont } from './services';

// Custom hooks for Firebase integration

export const useFirebaseAssets = (projectId: string, assetType: string) => {
  const [assets, setAssets] = useState<FirebaseAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const firebaseAssets = await AssetService.getAssets(projectId, assetType);
        setAssets(firebaseAssets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadAssets();
    }
  }, [projectId, assetType]);

  const uploadAsset = async (file: File, metadata: Omit<FirebaseAsset, 'id' | 'url' | 'uploadDate' | 'projectId'>) => {
    try {
      const url = await AssetService.uploadFile(file, projectId, assetType);
      const assetId = await AssetService.saveAsset({
        ...metadata,
        url,
        projectId
      });
      
      // Refresh assets
      const updatedAssets = await AssetService.getAssets(projectId, assetType);
      setAssets(updatedAssets);
      
      return assetId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload asset');
      throw err;
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      await AssetService.deleteAsset(assetId, projectId, assetType);
      setAssets(assets.filter(asset => asset.id !== assetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      throw err;
    }
  };

  return { assets, loading, error, uploadAsset, deleteAsset };
};

export const useFirebaseColors = (projectId: string) => {
  const [colors, setColors] = useState<FirebaseColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadColors = async () => {
      try {
        setLoading(true);
        const firebaseColors = await ColorService.getColors(projectId);
        setColors(firebaseColors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load colors');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadColors();
    }
  }, [projectId]);

  const addColor = async (color: Omit<FirebaseColor, 'id' | 'projectId'>) => {
    try {
      const colorId = await ColorService.saveColor({ ...color, projectId });
      const updatedColors = await ColorService.getColors(projectId);
      setColors(updatedColors);
      return colorId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add color');
      throw err;
    }
  };

  const updateColor = async (colorId: string, updates: Partial<FirebaseColor>) => {
    try {
      await ColorService.updateColor(colorId, updates);
      const updatedColors = await ColorService.getColors(projectId);
      setColors(updatedColors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update color');
      throw err;
    }
  };

  const deleteColor = async (colorId: string) => {
    try {
      await ColorService.deleteColor(colorId);
      setColors(colors.filter(color => color.id !== colorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete color');
      throw err;
    }
  };

  return { colors, loading, error, addColor, updateColor, deleteColor };
};

export const useFirebaseFonts = (projectId: string) => {
  const [fonts, setFonts] = useState<FirebaseFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        const firebaseFonts = await FontService.getFonts(projectId);
        setFonts(firebaseFonts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fonts');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadFonts();
    }
  }, [projectId]);

  const addFont = async (font: Omit<FirebaseFont, 'id' | 'uploadDate' | 'projectId'>, file?: File) => {
    try {
      let url: string | undefined;
      if (file) {
        url = await AssetService.uploadFile(file, projectId, 'font');
      }
      
      const fontId = await FontService.saveFont({ 
        ...font, 
        url,
        projectId 
      });
      
      const updatedFonts = await FontService.getFonts(projectId);
      setFonts(updatedFonts);
      return fontId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add font');
      throw err;
    }
  };

  const updateFont = async (fontId: string, updates: Partial<FirebaseFont>) => {
    try {
      await FontService.updateFont(fontId, updates);
      const updatedFonts = await FontService.getFonts(projectId);
      setFonts(updatedFonts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update font');
      throw err;
    }
  };

  const deleteFont = async (fontId: string) => {
    try {
      await FontService.deleteFont(fontId);
      setFonts(fonts.filter(font => font.id !== fontId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete font');
      throw err;
    }
  };

  return { fonts, loading, error, addFont, updateFont, deleteFont };
};
