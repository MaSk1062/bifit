# Firebase Setup Guide

## 🔥 Firebase Configuration

To set up Firebase for your Bifit application, follow these steps:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "bifit-fitness-app")
4. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

### 3. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database
5. Click "Done"

### 4. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "bifit-web")
6. Copy the configuration object

### 5. Configure Environment Variables

Create a `.env` file in your project root with the following content:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration.

### 6. Security Rules (Optional)

For production, you should set up proper Firestore security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Activities belong to users
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Goals belong to users
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Test Your Configuration

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

The application should now connect to Firebase successfully.

## 📁 File Structure

```
src/
├── lib/
│   └── firebase.ts          # Firebase configuration and initialization
├── contexts/
│   └── AuthContext.tsx      # Authentication context
└── components/
    ├── auth/
    │   ├── Login.tsx        # Login component
    │   └── Signup.tsx       # Signup component
    └── ProtectedRoute.tsx   # Route protection
```

## 🔧 Available Firebase Services

The Firebase configuration includes:

- **Authentication**: User login/signup
- **Firestore**: Database for storing user data, activities, goals
- **Storage**: File storage (for profile pictures, etc.)
- **Analytics**: Usage analytics (optional)

## 🚀 Next Steps

Once Firebase is configured, you can:

1. Test user registration and login
2. Create data models for activities and goals
3. Implement CRUD operations for fitness data
4. Add real-time data synchronization
5. Set up proper security rules for production

## 📝 Notes

- Keep your Firebase configuration secure
- Never commit `.env` files to version control
- Use different Firebase projects for development and production
- Set up proper security rules before going to production 