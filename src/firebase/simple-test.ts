import { db } from './config';
import { collection, addDoc } from 'firebase/firestore';

// Simple Firebase test
export const simpleFirebaseTest = async () => {
  try {
    console.log('🔥 Starting simple Firebase test...');
    
    // Just try to add a simple document
    const testCollection = collection(db, 'test');
    const docRef = await addDoc(testCollection, {
      message: 'Hello Firebase!',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Simple test successful! Document ID:', docRef.id);
    return { success: true, docId: docRef.id };
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    return { success: false, error: error.message };
  }
};
