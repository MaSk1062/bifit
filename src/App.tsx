import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/components/auth/Login';
import { Signup } from '@/components/auth/Signup';
import { Dashboard } from '@/components/Dashboard';
import { ActivityLog } from '@/components/ActivityLog';
import { History } from '@/components/History';
import { WorkoutManagement } from '@/components/WorkoutManagement';
import { UserProfile } from '@/components/UserProfile';
import { Settings } from '@/components/Settings';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { GoalManagement } from '@/components/GoalManagement';
import { MobileNavigation } from '@/components/MobileNavigation';
import { LandingPage } from '@/components/LandingPage';

// Create a client
const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isProtectedRoute = ['/dashboard', '/activity/new', '/history', '/workouts', '/profile', '/settings', '/analytics', '/goals'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/activity/new" 
          element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workouts" 
          element={
            <ProtectedRoute>
              <WorkoutManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AdvancedAnalytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <GoalManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<LandingPage />} />
      </Routes>
      {isProtectedRoute && <MobileNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
