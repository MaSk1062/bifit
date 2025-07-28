# BiFyT - Fitness Tracking Application

A comprehensive fitness tracking application built with React, TypeScript, and Firebase.

## 🚀 Features

- **User Authentication**: Secure login and registration with Firebase Auth
- **Dashboard**: Real-time fitness metrics and progress tracking
- **Activity Tracking**: Log and monitor various fitness activities
- **Goal Management**: Set and track fitness goals with progress visualization
- **Workout Management**: Create and manage detailed workout routines
- **User Profile**: Comprehensive profile management with health metrics
- **Settings**: Customizable app settings and preferences
- **Advanced Analytics**: Detailed insights and performance analysis

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bifit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to `src/lib/firebase.ts`

4. **Environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Firebase Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init
   ```

4. **Update project configuration**
   - Update `.firebaserc` with your Firebase project ID
   - Update `src/lib/firebase.ts` with your Firebase config

5. **Deploy to Firebase**
   ```bash
   npm run deploy
   ```

### Available Deployment Scripts

- `npm run deploy` - Build and deploy everything
- `npm run deploy:hosting` - Deploy only hosting
- `npm run deploy:firestore` - Deploy only Firestore
- `npm run deploy:storage` - Deploy only Storage
- `npm run deploy:rules` - Deploy security rules

## 📁 Project Structure

```
bifit/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── ui/             # Reusable UI components
│   │   └── ...             # Feature-specific components
│   ├── contexts/           # React contexts
│   ├── lib/                # Firebase configuration
│   └── App.tsx             # Main application component
├── docs/                   # Documentation
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── storage.rules           # Storage security rules
└── firebase-deploy.md      # Deployment guide
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Firebase

## 🔒 Security

The application includes comprehensive security measures:

- **Firestore Security Rules**: Users can only access their own data
- **Storage Security Rules**: Secure file upload and access
- **Authentication**: Firebase Auth with email/password
- **Protected Routes**: Client-side route protection
- **Data Validation**: Input validation and sanitization

## 📊 Features Overview

### Dashboard
- Real-time fitness metrics
- Daily activity summaries
- Goal progress tracking
- Quick access to all features

### Activity Tracking
- Log various fitness activities
- Track duration, distance, and calories
- Activity history and statistics
- Filter and search activities

### Goal Management
- Set multiple fitness goals
- Track progress with visual indicators
- Goal achievement predictions
- Goal history and analytics

### Workout Management
- Create detailed workout routines
- Track sets, reps, and weights
- Exercise database with 17+ exercises
- Workout templates and history

### User Profile
- Comprehensive profile information
- Health metrics (BMI, BMR, TDEE)
- Fitness goals and preferences
- Profile picture support

### Settings
- Notification preferences
- Privacy controls
- Theme and appearance settings
- Data sync and backup options

### Advanced Analytics
- Performance metrics and trends
- Goal achievement analysis
- Activity distribution visualization
- AI-powered insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Firebase Deployment Guide](firebase-deploy.md)
- Review the [TODO.md](docs/TODO.md) for project status
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Social features and friend connections
- [ ] Advanced workout planning
- [ ] Nutrition tracking
- [ ] Integration with fitness devices
- [ ] Push notifications
- [ ] Offline support

---

**BiFyT** - Your personal fitness companion for tracking, analyzing, and achieving your fitness goals.
