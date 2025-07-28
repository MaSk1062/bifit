import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileHeader({ title = 'BiFyT', showBackButton = false, onBack }: MobileHeaderProps) {
  const { currentUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Logging out user:', currentUser?.email);
      await logout();
      console.log('Logout successful');
      // The user will be redirected to the landing page automatically by the AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="bg-black text-white md:hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 h-10 w-10 text-white hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              {currentUser?.email && (
                <p className="text-xs text-gray-300 truncate max-w-[200px]">
                  {currentUser.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 h-10 w-10 text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-black"
                onClick={() => setShowMenu(false)}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-black"
                onClick={() => setShowMenu(false)}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-black w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
              <button
                onClick={() => {
                  console.log('Testing logout...');
                  console.log('Current user before logout:', currentUser);
                  handleLogout();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-black w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Test Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 