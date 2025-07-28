import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileHeader } from '../MobileHeader';

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      email: 'test@example.com',
      displayName: 'Test User',
    },
    logout: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

describe('MobileHeader Component', () => {
  it('renders with default title', () => {
    render(<MobileHeader />);
    expect(screen.getByText('BiFyT')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<MobileHeader title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('shows user email when available', () => {
    render(<MobileHeader />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders menu button', () => {
    render(<MobileHeader />);
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('shows back button when showBackButton is true', () => {
    const onBack = vi.fn();
    render(<MobileHeader showBackButton onBack={onBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    
    render(<MobileHeader showBackButton onBack={onBack} />);
    const backButton = screen.getByRole('button', { name: /back/i });
    
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('toggles menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileHeader />);
    
    const menuButton = screen.getByRole('button');
    await user.click(menuButton);
    
    // Menu items should be visible after clicking
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('closes menu when menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<MobileHeader />);
    
    // Open menu
    const menuButton = screen.getByRole('button');
    await user.click(menuButton);
    
    // Click on a menu item
    const profileLink = screen.getByText('Profile');
    await user.click(profileLink);
    
    // Menu should close (items not visible)
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('applies correct mobile-only styling', () => {
    render(<MobileHeader />);
    const header = screen.getByText('BiFyT').closest('div')?.parentElement;
    expect(header).toHaveClass('md:hidden');
  });

  it('renders with proper touch target sizes', () => {
    render(<MobileHeader />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('min-h-[44px]');
    });
  });
}); 