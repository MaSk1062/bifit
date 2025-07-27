# BiFyT - Fitness Tracking Application

A modern fitness tracking application built with React, TypeScript, and Firebase.

## 🎯 Milestone One: Project Foundation - COMPLETED ✅

### What's Been Implemented:

#### ✅ Project Setup & Configuration
- [x] React + TypeScript + Vite setup
- [x] Firebase configuration and integration
- [x] Tailwind CSS + shadcn/ui components
- [x] React Router setup with proper routing
- [x] Environment configuration (.env files)
- [x] Project structure and organization

#### ✅ Authentication System
- [x] Firebase Authentication integration
- [x] User registration and login
- [x] Sign out functionality
- [x] Authentication state management
- [x] Protected routes

#### ✅ UI Components & Design System
- [x] shadcn/ui component library setup
- [x] Custom Button component with variants
- [x] Custom Input component with validation
- [x] Custom Card component with header/content/footer
- [x] Custom Label component
- [x] Black and White Color Scheme Implementation
  - [x] Updated CSS variables for consistent black and white theme
  - [x] Modified all UI components to use black and white colors
  - [x] Maintained accessibility with proper contrast ratios
  - [x] Removed all colored elements and replaced with grayscale variations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bifyt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── Dashboard.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── firebase.ts
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM

## 🎨 Design System

The application uses a consistent black and white color scheme with:
- High contrast ratios for accessibility
- Clean, modern UI components
- Responsive design
- Consistent spacing and typography

## 🔐 Authentication Features

- User registration with email/password
- User login with email/password
- Protected routes
- Automatic redirect to login for unauthenticated users
- Logout functionality

## 📱 Current Features

- **Dashboard**: Welcome screen with user info and quick actions
- **Authentication**: Complete login/signup flow
- **Protected Routes**: Secure access to authenticated areas
- **Responsive Design**: Works on desktop and mobile devices

## 🚧 Next Steps (Milestone Two)

The following features are planned for the next milestone:
- Activity tracking (log workouts, exercises)
- Goal management
- Progress visualization
- User profile management
- Settings page

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Last Updated**: July 2025
**Version**: 1.0.0 (Milestone One Complete)
