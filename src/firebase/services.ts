import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './config';

// Types
export interface FirebaseAsset {
  id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  url: string;
  uploadDate: Timestamp;
  uploadedBy: string;
  projectId: string;
}

export interface FirebaseColor {
  id: string;
  name: string;
  hex: string;
  usage: string;
  pantone?: string;
  projectId: string;
}

export interface FirebaseFont {
  id: string;
  name: string;
  weight: string;
  usage: string;
  family: string;
  url?: string;
  fileName?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadDate?: Timestamp;
  projectId: string;
}

export interface FirebaseSocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';
  scheduledDate?: Timestamp;
  publishDate?: Timestamp;
  createdBy: string;
  approvedBy?: string;
  projectId: string;
  createdAt: Timestamp;
}

export interface FirebaseKnowledgeFile {
  id: string;
  fileName: string;
  category: string;
  tags: string[];
  fileType: string;
  fileSize: string;
  url: string;
  uploadedBy: string;
  uploadDate: Timestamp;
  projectId: string;
}

// Asset Management
export const AssetService = {
  // Upload file to Firebase Storage
  uploadFile: async (file: File, projectId: string, assetType: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `projects/${projectId}/${assetType}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // Save asset metadata to Firestore
  saveAsset: async (asset: Omit<FirebaseAsset, 'id' | 'uploadDate'>): Promise<string> => {
    const docRef = doc(collection(db, 'assets'));
    const assetData = {
      ...asset,
      id: docRef.id,
      uploadDate: Timestamp.now()
    };
    await setDoc(docRef, assetData);
    return docRef.id;
  },

  // Get assets for a project
  getAssets: async (projectId: string, assetType: string): Promise<FirebaseAsset[]> => {
    const q = query(
      collection(db, 'assets'),
      where('projectId', '==', projectId),
      where('type', '==', assetType),
      orderBy('uploadDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as FirebaseAsset));
  },

  // Delete asset
  deleteAsset: async (assetId: string, projectId: string, assetType: string): Promise<void> => {
    // Delete from Firestore
    await deleteDoc(doc(db, 'assets', assetId));
    
    // Delete from Storage (you'd need to store the file path)
    // This is a simplified version - in practice you'd store the storage path
  }
};

// Color Management
export const ColorService = {
  saveColor: async (color: Omit<FirebaseColor, 'id'>): Promise<string> => {
    const docRef = doc(collection(db, 'colors'));
    const colorData = {
      ...color,
      id: docRef.id
    };
    await setDoc(docRef, colorData);
    return docRef.id;
  },

  getColors: async (projectId: string): Promise<FirebaseColor[]> => {
    const q = query(
      collection(db, 'colors'),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as FirebaseColor));
  },

  updateColor: async (colorId: string, updates: Partial<FirebaseColor>): Promise<void> => {
    await updateDoc(doc(db, 'colors', colorId), updates);
  },

  deleteColor: async (colorId: string): Promise<void> => {
    await deleteDoc(doc(db, 'colors', colorId));
  }
};

// Font Management
export const FontService = {
  saveFont: async (font: Omit<FirebaseFont, 'id' | 'uploadDate'>): Promise<string> => {
    const docRef = doc(collection(db, 'fonts'));
    const fontData = {
      ...font,
      id: docRef.id,
      uploadDate: Timestamp.now()
    };
    await setDoc(docRef, fontData);
    return docRef.id;
  },

  getFonts: async (projectId: string): Promise<FirebaseFont[]> => {
    const q = query(
      collection(db, 'fonts'),
      where('projectId', '==', projectId),
      orderBy('uploadDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as FirebaseFont));
  },

  updateFont: async (fontId: string, updates: Partial<FirebaseFont>): Promise<void> => {
    await updateDoc(doc(db, 'fonts', fontId), updates);
  },

  deleteFont: async (fontId: string): Promise<void> => {
    await deleteDoc(doc(db, 'fonts', fontId));
  }
};

// Social Media Management
export const SocialService = {
  savePost: async (post: Omit<FirebaseSocialPost, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = doc(collection(db, 'socialPosts'));
    const postData = {
      ...post,
      id: docRef.id,
      createdAt: Timestamp.now()
    };
    await setDoc(docRef, postData);
    return docRef.id;
  },

  getPosts: async (projectId: string, status?: string): Promise<FirebaseSocialPost[]> => {
    let q = query(
      collection(db, 'socialPosts'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as FirebaseSocialPost));
  },

  updatePost: async (postId: string, updates: Partial<FirebaseSocialPost>): Promise<void> => {
    await updateDoc(doc(db, 'socialPosts', postId), updates);
  },

  deletePost: async (postId: string): Promise<void> => {
    await deleteDoc(doc(db, 'socialPosts', postId));
  }
};

// Knowledge Hub Management
export const KnowledgeService = {
  uploadFile: async (file: File, projectId: string, metadata: Omit<FirebaseKnowledgeFile, 'id' | 'url' | 'uploadDate'>): Promise<string> => {
    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `projects/${projectId}/knowledge/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    // Save metadata to Firestore
    const docRef = doc(collection(db, 'knowledgeFiles'));
    const fileData = {
      ...metadata,
      id: docRef.id,
      url,
      uploadDate: Timestamp.now()
    };
    await setDoc(docRef, fileData);
    return docRef.id;
  },

  getFiles: async (projectId: string): Promise<FirebaseKnowledgeFile[]> => {
    const q = query(
      collection(db, 'knowledgeFiles'),
      where('projectId', '==', projectId),
      orderBy('uploadDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as FirebaseKnowledgeFile));
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await deleteDoc(doc(db, 'knowledgeFiles', fileId));
  }
};
