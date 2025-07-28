import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';

describe('Card Component', () => {
  it('renders Card with content', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    
    const card = screen.getByText('Card content').closest('div');
    expect(card).toBeInTheDocument();
    // Check that the card has some styling classes
    expect(card?.className).toContain('rounded-xl');
  });

  it('renders CardHeader with title and description', () => {
    render(
      <CardHeader>
        <CardTitle>Test Title</CardTitle>
        <CardDescription>Test Description</CardDescription>
      </CardHeader>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toHaveClass('leading-none', 'font-semibold');
    expect(screen.getByText('Test Description')).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('renders CardContent with proper styling', () => {
    render(
      <CardContent>
        <div>Content</div>
      </CardContent>
    );
    
    const content = screen.getByText('Content').closest('div');
    expect(content).toBeInTheDocument();
    // Check that the content has some styling classes
    expect(content?.className).toContain('p-6');
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>This is a complete card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
      </Card>
    );
    
    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('This is a complete card')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });
}); 