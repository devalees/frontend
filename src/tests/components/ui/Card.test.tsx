import React from 'react';
import { render, screen } from '@/tests/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders the Card component with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card content');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement.parentElement).toHaveClass('bg-white rounded-lg shadow-sm border border-gray-200');
  });

  it('applies custom className to Card', () => {
    render(
      <Card className="custom-class">
        <div>Card content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card content').parentElement;
    expect(cardElement).toHaveClass('custom-class');
  });
});

describe('CardHeader Component', () => {
  it('renders the CardHeader component with children', () => {
    render(
      <CardHeader>
        <h2>Card Header</h2>
      </CardHeader>
    );
    
    const headerElement = screen.getByText('Card Header');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement.parentElement).toHaveClass('px-6 py-4 border-b border-gray-200');
  });

  it('applies custom className to CardHeader', () => {
    render(
      <CardHeader className="custom-header-class">
        <h2>Card Header</h2>
      </CardHeader>
    );
    
    const headerElement = screen.getByText('Card Header').parentElement;
    expect(headerElement).toHaveClass('custom-header-class');
  });
});

describe('CardContent Component', () => {
  it('renders the CardContent component with children', () => {
    render(
      <CardContent>
        <p>Card content</p>
      </CardContent>
    );
    
    const contentElement = screen.getByText('Card content');
    expect(contentElement).toBeInTheDocument();
    expect(contentElement.parentElement).toHaveClass('p-6');
  });

  it('applies custom className to CardContent', () => {
    render(
      <CardContent className="custom-content-class">
        <p>Card content</p>
      </CardContent>
    );
    
    const contentElement = screen.getByText('Card content').parentElement;
    expect(contentElement).toHaveClass('custom-content-class');
  });
});

describe('CardFooter Component', () => {
  it('renders the CardFooter component with children', () => {
    render(
      <CardFooter>
        <button>Footer Button</button>
      </CardFooter>
    );
    
    const footerElement = screen.getByText('Footer Button');
    expect(footerElement).toBeInTheDocument();
    expect(footerElement.parentElement).toHaveClass('px-6 py-4 border-t border-gray-200');
  });

  it('applies custom className to CardFooter', () => {
    render(
      <CardFooter className="custom-footer-class">
        <button>Footer Button</button>
      </CardFooter>
    );
    
    const footerElement = screen.getByText('Footer Button').parentElement;
    expect(footerElement).toHaveClass('custom-footer-class');
  });
});

describe('Card with all subcomponents', () => {
  it('renders a complete Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <h2>Card Title</h2>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
        <CardFooter>
          <button>Footer Button</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });
}); 