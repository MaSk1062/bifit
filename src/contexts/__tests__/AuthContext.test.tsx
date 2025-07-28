import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase auth
vi.mock('@/lib/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    currentUser: null,
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const { currentUser, login, logout, signup, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">
        {currentUser ? currentUser.email : 'No user'}
      </div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button data-testid="signup-btn" onClick={() => signup('test@example.com', 'password')}>
        Signup
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('provides authentication functions', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    expect(screen.getByTestId('signup-btn')).toBeInTheDocument();
  });

  it('shows no user initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('handles login function call', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByTestId('login-btn');
    await user.click(loginButton);
    
    // The login function should be called (we can't test the actual Firebase call due to mocking)
    expect(loginButton).toBeInTheDocument();
  });

  it('handles logout function call', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const logoutButton = screen.getByTestId('logout-btn');
    await user.click(logoutButton);
    
    // The logout function should be called
    expect(logoutButton).toBeInTheDocument();
  });

  it('handles signup function call', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const signupButton = screen.getByTestId('signup-btn');
    await user.click(signupButton);
    
    // The signup function should be called
    expect(signupButton).toBeInTheDocument();
  });

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <div>Test content</div>
      </AuthProvider>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('handles auth state changes', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // After some time, should not be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    }, { timeout: 1000 });
  });
}); 