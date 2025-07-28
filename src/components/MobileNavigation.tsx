import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Target, 
  // Settings,
  Plus,
  History
} from 'lucide-react';

export function MobileNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      path: '/workouts',
      icon: Activity,
      label: 'Workouts',
      isActive: location.pathname === '/workouts'
    },
    {
      path: '/history',
      icon: History,
      label: 'History',
      isActive: location.pathname === '/history'
    },
    {
      path: '/activity/new',
      icon: Plus,
      label: 'Log Activity',
      isActive: location.pathname === '/activity/new'
    },
    {
      path: '/goals',
      icon: Target,
      label: 'Goals',
      isActive: location.pathname === '/goals'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                item.isActive
                  ? 'text-black bg-gray-50'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 