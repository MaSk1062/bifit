import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div data-testid="test-component">
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  );
};

const Button = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  );
};

describe('Simple Component Tests', () => {
  it('renders a component with title', () => {
    render(<TestComponent title="Test Title">Test content</TestComponent>);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders a button component', () => {
    const handleClick = () => console.log('clicked');
    render(<Button onClick={handleClick}>Click me</Button>);
    
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders multiple components', () => {
    render(
      <div>
        <TestComponent title="First">First content</TestComponent>
        <TestComponent title="Second">Second content</TestComponent>
      </div>
    );
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });
});

describe('Conditional Rendering', () => {
  const ConditionalComponent = ({ show }: { show: boolean }) => {
    return (
      <div>
        {show && <div data-testid="conditional">This is shown when true</div>}
        <div data-testid="always">This is always shown</div>
      </div>
    );
  };

  it('shows conditional content when condition is true', () => {
    render(<ConditionalComponent show={true} />);
    
    expect(screen.getByTestId('conditional')).toBeInTheDocument();
    expect(screen.getByTestId('always')).toBeInTheDocument();
  });

  it('hides conditional content when condition is false', () => {
    render(<ConditionalComponent show={false} />);
    
    expect(screen.queryByTestId('conditional')).not.toBeInTheDocument();
    expect(screen.getByTestId('always')).toBeInTheDocument();
  });
});

describe('Props Testing', () => {
  const PropsComponent = ({ 
    name, 
    age, 
    isActive, 
    items 
  }: { 
    name: string; 
    age: number; 
    isActive: boolean; 
    items: string[]; 
  }) => {
    return (
      <div data-testid="props-component">
        <h2>{name}</h2>
        <p>Age: {age}</p>
        <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  it('renders props correctly', () => {
    const props = {
      name: 'John Doe',
      age: 30,
      isActive: true,
      items: ['Item 1', 'Item 2', 'Item 3']
    };

    render(<PropsComponent {...props} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Age: 30')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
}); 