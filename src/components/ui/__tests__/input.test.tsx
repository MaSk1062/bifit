import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex', 'h-9', 'w-full', 'rounded-md');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Input onChange={handleChange} placeholder="Test input" />);
    const input = screen.getByPlaceholderText('Test input');
    
    await user.type(input, 'Hello');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />);
    expect(screen.getByPlaceholderText('Text input')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email input" />);
    expect(screen.getByPlaceholderText('Email input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password input" />);
    expect(screen.getByPlaceholderText('Password input')).toHaveAttribute('type', 'password');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} placeholder="Ref test" />);
    expect(ref).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom input" />);
    const input = screen.getByPlaceholderText('Custom input');
    expect(input).toHaveClass('custom-class');
  });

  it('supports controlled value', () => {
    render(<Input value="Controlled value" readOnly placeholder="Controlled" />);
    const input = screen.getByPlaceholderText('Controlled');
    expect(input).toHaveValue('Controlled value');
  });
}); 