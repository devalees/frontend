/**
 * Button Component Tests
 * 
 * This file contains failing tests for the Button component following the test-driven development approach.
 * These tests will fail until the Button component is implemented to match the expected behavior.
 */

import React from 'react';
import { render, screen, fireEvent, describe, it, expect, jest } from '../../tests/utils';

// Import the Button component
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  // Test variants
  describe('Variants', () => {
    it('should render with primary variant by default', () => {
      // This test will fail until the Button component is implemented
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-primary-600');
    });

    it('should render with secondary variant when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button variant="secondary">Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-secondary-600');
    });

    it('should render with tertiary variant when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button variant="tertiary">Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('bg-transparent');
    });
  });

  // Test sizes
  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      // This test will fail until the Button component is implemented
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('px-4 py-2');
    });

    it('should render with small size when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button size="small">Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('px-2 py-1 text-sm');
    });

    it('should render with large size when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button size="large">Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('px-6 py-3 text-lg');
    });
  });

  // Test states
  describe('States', () => {
    it('should render in disabled state when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button disabled>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('should render in loading state when specified', () => {
      // This test will fail until the Button component is implemented
      render(<Button loading>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should not trigger onClick when disabled', () => {
      // This test will fail until the Button component is implemented
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test accessibility
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // This test will fail until the Button component is implemented
      render(<Button aria-label="Submit form">Click me</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should be keyboard accessible', () => {
      // This test will fail until the Button component is implemented
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have proper focus styles', () => {
      // This test will fail until the Button component is implemented
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.focus(button);
      expect(button).toHaveClass('focus:outline-none focus:ring-2 focus:ring-primary-500');
    });
  });
}); 