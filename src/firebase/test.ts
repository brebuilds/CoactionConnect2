import { db, storage } from './config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore
    console.log('📊 Testing Firestore...');
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      message: 'Hello from CoactionConnect!',
      timestamp: new Date(),
      test: true
    });
    console.log('✅ Firestore test successful! Document ID:', testDoc.id);
    
    // Test Storage
    console.log('📁 Testing Storage...');
    const testFile = new File(['Hello Firebase Storage!'], 'test.txt', { type: 'text/plain' });
    const storageRef = ref(storage, 'test/test.txt');
    const uploadResult = await uploadBytes(storageRef, testFile);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('✅ Storage test successful! File URL:', downloadURL);
    
    console.log('🎉 All Firebase services are working correctly!');
    return { success: true, firestoreId: testDoc.id, storageUrl: downloadURL };
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test data operations
export const testDataOperations = async () => {
  try {
    console.log('🧪 Testing data operations...');
    
    // Test adding a color
    const colorDoc = await addDoc(collection(db, 'colors'), {
      name: 'Test Color',
      hex: '#FF0000',
      usage: 'Testing',
      projectId: 'test-project',
      createdAt: new Date()
    });
    console.log('✅ Color added successfully! ID:', colorDoc.id);
    
    // Test reading data
    const colorsSnapshot = await getDocs(collection(db, 'colors'));
    console.log('✅ Colors read successfully! Count:', colorsSnapshot.size);
    
    return { success: true, colorId: colorDoc.id, colorCount: colorsSnapshot.size };
    
  } catch (error) {
    console.error('❌ Data operations test failed:', error);
    return { success: false, error: error.message };
  }
};
