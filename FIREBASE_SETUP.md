# Firebase Setup Guide for CoactionConnect

## 🚀 Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `coactionconnect` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Required Services

#### Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location close to your users

#### Storage
1. Go to "Storage" in Firebase Console
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore

### 3. Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (`</>`)
4. Register app with name: `CoactionConnect`
5. Copy the config object

### 4. Update Configuration
Replace the placeholder values in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 5. Security Rules (Important!)

#### Firestore Rules
Go to Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Project-specific access
    match /assets/{assetId} {
      allow read, write: if request.auth != null && 
        resource.data.projectId in request.auth.token.projects;
    }
    
    match /colors/{colorId} {
      allow read, write: if request.auth != null && 
        resource.data.projectId in request.auth.token.projects;
    }
    
    match /fonts/{fontId} {
      allow read, write: if request.auth != null && 
        resource.data.projectId in request.auth.token.projects;
    }
    
    match /socialPosts/{postId} {
      allow read, write: if request.auth != null && 
        resource.data.projectId in request.auth.token.projects;
    }
    
    match /knowledgeFiles/{fileId} {
      allow read, write: if request.auth != null && 
        resource.data.projectId in request.auth.token.projects;
    }
  }
}
```

#### Storage Rules
Go to Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔧 Usage

### Migration from localStorage
The app includes a migration service to move existing data:

```typescript
import { MigrationService } from './firebase/migration';

// Check if migration is needed
if (MigrationService.needsMigration(projectId)) {
  // Migrate all data for a project
  await MigrationService.migrateProject(projectId);
}
```

### Using Firebase Services
```typescript
import { AssetService, ColorService, SocialService } from './firebase/services';

// Upload a file
const fileUrl = await AssetService.uploadFile(file, projectId, 'logo');
await AssetService.saveAsset({
  name: 'My Logo',
  type: 'Main branding',
  format: 'PNG',
  size: '2.1 MB',
  url: fileUrl,
  uploadedBy: user.name,
  projectId
});

// Get assets
const logos = await AssetService.getAssets(projectId, 'logo');
```

## 📊 Database Structure

### Collections:
- `assets` - Logo and image files
- `colors` - Brand color palettes
- `fonts` - Typography assets
- `socialPosts` - Social media posts
- `knowledgeFiles` - Knowledge hub documents

### Storage Structure:
```
projects/
  {projectId}/
    logos/
      {timestamp}_{filename}
    fonts/
      {timestamp}_{filename}
    knowledge/
      {timestamp}_{filename}
```

## 🔒 Security Considerations

1. **Authentication**: Implement proper user authentication
2. **Project Access**: Users should only access their assigned projects
3. **File Validation**: Validate file types and sizes
4. **Rate Limiting**: Implement rate limiting for uploads
5. **Backup**: Set up regular backups of Firestore data

## 💰 Cost Optimization

- **Storage**: Monitor file sizes and implement cleanup policies
- **Firestore**: Use efficient queries and pagination
- **Bandwidth**: Optimize images and implement CDN
- **Functions**: Use Firebase Functions for server-side processing

## 🚀 Deployment

After setup, your app will automatically use Firebase for:
- ✅ File uploads and storage
- ✅ Real-time data synchronization
- ✅ Cross-device data sharing
- ✅ Backup and recovery
- ✅ Scalable infrastructure
