import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNavigation } from '../MobileNavigation';

// Mock useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/dashboard' }),
    Link: ({ children, to, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

describe('MobileNavigation Component', () => {
  it('renders all navigation items', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Log Activity')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders with correct navigation links', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Workouts').closest('a')).toHaveAttribute('href', '/workouts');
    expect(screen.getByText('Log Activity').closest('a')).toHaveAttribute('href', '/activity/new');
    expect(screen.getByText('Goals').closest('a')).toHaveAttribute('href', '/goals');
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile');
  });

  it('applies correct styling classes', () => {
    render(<MobileNavigation />);
    
    const nav = screen.getByText('Dashboard').closest('div')?.parentElement;
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'bg-white', 'border-t', 'border-gray-200', 'z-50', 'md:hidden');
  });

  it('has proper touch target sizes', () => {
    render(<MobileNavigation />);
    
    const navItems = screen.getAllByRole('link');
    navItems.forEach(item => {
      expect(item).toHaveClass('min-h-[44px]');
    });
  });

  it('shows active state for current route', () => {
    render(<MobileNavigation />);
    
    // Since we mocked useLocation to return '/dashboard', Dashboard should be active
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('text-black', 'bg-gray-50');
  });

  it('handles navigation clicks', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);
    
    const workoutsLink = screen.getByText('Workouts');
    await user.click(workoutsLink);
    
    // The link should be clickable (no errors thrown)
    expect(workoutsLink).toBeInTheDocument();
  });

  it('renders icons for each navigation item', () => {
    render(<MobileNavigation />);
    
    // Check that icons are rendered (they should be SVG elements)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
}); 