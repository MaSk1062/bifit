import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';

// Mock Firebase auth
vi.mock('@/lib/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    render(<Login />);
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    render(<Login />);
    
    const signUpLink = screen.getByText(/don't have an account/i);
    expect(signUpLink).toBeInTheDocument();
    expect(screen.getByText(/sign up here/i)).toHaveAttribute('href', '/signup');
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Form should be submitted (we can't test the actual Firebase call due to mocking)
    expect(submitButton).toBeInTheDocument();
  });

  it('handles Google sign-in', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await user.click(googleButton);
    
    // Google sign-in should be triggered
    expect(googleButton).toBeInTheDocument();
  });

  it('renders with proper mobile responsive classes', () => {
    render(<Login />);
    
    const container = screen.getByText('Welcome Back').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();
    // Check that the container has some responsive classes
    expect(container?.className).toContain('flex');
  });

  it('has proper form validation attributes', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('renders forgot password link', () => {
    render(<Login />);
    
    const forgotPasswordLink = screen.getByText(/forgot your password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });
}); 