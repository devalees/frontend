import React from 'react';
import { render, screen, fireEvent } from '../utils/fixed-index';
import { Button } from '../../components/ui/Button';

// Mock click handler
const mockOnClick = jest.fn();

describe('Button Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockOnClick.mockClear();
  });

  it('renders a button with the provided text', () => {
    render(<Button>Click Me</Button>);
    
    // Check if the button is rendered with the correct text
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    
    // Get the button and click it
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    fireEvent.click(buttonElement);
    
    // Check if the click handler was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    // Check if the button is disabled
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
    expect(buttonElement).toBeDisabled();
  });

  it('applies the correct size class based on the size prop', () => {
    render(<Button size="small">Small Button</Button>);
    
    // Check if the button has the small size class
    const buttonElement = screen.getByRole('button', { name: /Small Button/i });
    expect(buttonElement).toHaveClass('text-sm'); // assuming 'text-sm' is the class for small buttons
  });

  it('applies the correct variant class based on the variant prop', () => {
    render(<Button variant="default">Primary Button</Button>);
    
    // Check if the button has the primary variant class
    const buttonElement = screen.getByRole('button', { name: /Primary Button/i });
    expect(buttonElement).toHaveClass('bg-primary-600');
  });
}); 