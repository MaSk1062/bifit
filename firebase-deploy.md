# Firebase Deployment Guide for BiFyT

## Prerequisites

1. **Firebase CLI**: Install Firebase CLI globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Create a Firebase account at [firebase.google.com](https://firebase.google.com)

3. **Firebase Project**: Create a new Firebase project in the Firebase Console

## Setup Instructions

### 1. Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Select the following services:
# - Hosting
# - Firestore
# - Storage
# - Authentication
```

### 2. Update Project Configuration

1. **Update `.firebaserc`** with your actual Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

2. **Update `src/lib/firebase.ts`** with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### 3. Enable Firebase Services

In the Firebase Console:

1. **Authentication**: Enable Email/Password authentication
2. **Firestore Database**: Create database in production mode
3. **Storage**: Enable Cloud Storage
4. **Hosting**: Configure hosting settings

### 4. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 5. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

## Deployment Commands

### Build and Deploy All
```bash
npm run build && firebase deploy
```

### Deploy Only Hosting
```bash
npm run build && firebase deploy --only hosting
```

### Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Storage Rules
```bash
firebase deploy --only storage
```

## Environment Variables

Create a `.env.production` file for production environment:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Post-Deployment Checklist

1. **Test Authentication**: Verify user registration and login works
2. **Test Firestore**: Verify data is being saved and retrieved correctly
3. **Test Storage**: Verify file uploads work (if implemented)
4. **Check Security Rules**: Verify users can only access their own data
5. **Test Performance**: Check loading times and responsiveness
6. **Monitor Errors**: Check Firebase Console for any errors

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed
   ```bash
   npm install
   ```

2. **Firebase Config Errors**: Verify Firebase configuration in `src/lib/firebase.ts`

3. **Security Rule Errors**: Check Firestore and Storage rules syntax

4. **CORS Issues**: Verify hosting configuration in `firebase.json`

### Useful Commands

```bash
# View deployment history
firebase hosting:history

# Rollback to previous deployment
firebase hosting:rollback

# View logs
firebase hosting:log

# Test locally
firebase serve
```

## Production Considerations

1. **Custom Domain**: Configure custom domain in Firebase Console
2. **SSL Certificate**: Firebase provides automatic SSL
3. **CDN**: Firebase Hosting includes global CDN
4. **Monitoring**: Set up Firebase Analytics and Performance Monitoring
5. **Backup**: Regular backups of Firestore data
6. **Scaling**: Monitor usage and scale as needed

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Security Rules**: Regularly review and update security rules
3. **Authentication**: Implement proper authentication flows
4. **Data Validation**: Validate all user inputs
5. **Rate Limiting**: Consider implementing rate limiting for API calls

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://firebase.google.com/community)

For BiFyT app issues:
- Check the project documentation
- Review the TODO.md file for known issues
- Check the GitHub repository for updates 