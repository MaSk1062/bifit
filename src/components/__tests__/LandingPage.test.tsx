import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPage } from '../LandingPage';
import { useAuth } from '@/contexts/AuthContext';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('LandingPage Component', () => {
  const mockUseAuth = useAuth as any;

  it('renders unauthenticated user view when no user is logged in', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Check for unauthenticated user content
    expect(screen.getByText('Transform Your')).toBeInTheDocument();
    expect(screen.getByText('Fitness Journey')).toBeInTheDocument();
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Your Free Account')).toBeInTheDocument();
    
    // Check for features
    expect(screen.getByText('Activity Tracking')).toBeInTheDocument();
    expect(screen.getByText('Goal Management')).toBeInTheDocument();
    expect(screen.getByText('Progress Analytics')).toBeInTheDocument();
  });

  it('renders authenticated user view when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Check for authenticated user content
    expect(screen.getByText('Welcome back, Test User! 👋')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Log Activity')).toBeInTheDocument();
    
    // Check for quick action cards
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Your Goals')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders authenticated user view with email when no display name', () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: '123',
        email: 'test@example.com',
        displayName: null,
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Should show email username (part before @)
    expect(screen.getByText('Welcome back, test! 👋')).toBeInTheDocument();
  });

  it('renders navigation links correctly for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Check navigation links
    const signInLink = screen.getByText('Sign In');
    const getStartedLink = screen.getByText('Get Started');
    
    expect(signInLink).toBeInTheDocument();
    expect(getStartedLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
    expect(getStartedLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('renders navigation links correctly for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      currentUser: {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Check navigation links
    const dashboardLink = screen.getByText('Go to Dashboard');
    const logActivityLink = screen.getByText('Log Activity');
    
    expect(dashboardLink).toBeInTheDocument();
    expect(logActivityLink).toBeInTheDocument();
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    expect(logActivityLink.closest('a')).toHaveAttribute('href', '/activity/new');
  });

  it('renders all feature cards for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    // Check all 6 feature cards are present
    const features = [
      'Activity Tracking',
      'Goal Management', 
      'Progress Analytics',
      'Health Monitoring',
      'Community Support',
      'Smart Recommendations'
    ];

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('renders BiFyT logo and branding', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
    });

    render(<LandingPage />);

    expect(screen.getByText('BiFyT')).toBeInTheDocument();
  });
}); 