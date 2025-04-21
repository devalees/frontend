/**
 * Button Component Tests
 * 
 * This file contains failing tests for the Button component following the test-driven development approach.
 * These tests will fail until the Button component is implemented to match the expected behavior.
 */

import { renderWithProviders } from '../utils/componentTestUtils';
import { Button } from '../../components/ui/Button';
import React from 'react';
import { fireEvent } from '@testing-library/react';

describe('Button Component', () => {
  // Test variants
  describe('Variants', () => {
    it('should render with primary variant by default', () => {
      const { container } = renderWithProviders(<Button>Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-primary-600');
    });

    it('should render with secondary variant when specified', () => {
      const { container } = renderWithProviders(<Button variant="secondary">Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-secondary-600');
    });

    it('should render with tertiary variant when specified', () => {
      const { container } = renderWithProviders(<Button variant="tertiary">Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-transparent');
    });
  });

  // Test sizes
  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      const { container } = renderWithProviders(<Button>Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('px-4 py-2');
    });

    it('should render with small size when specified', () => {
      const { container } = renderWithProviders(<Button size="small">Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('px-2 py-1 text-sm');
    });

    it('should render with large size when specified', () => {
      const { container } = renderWithProviders(<Button size="large">Click me</Button>);
      expect(container.querySelector('button')).toHaveClass('px-6 py-3 text-lg');
    });
  });

  // Test states
  describe('States', () => {
    it('should render in disabled state when specified', () => {
      const { container } = renderWithProviders(<Button disabled>Click me</Button>);
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('should render in loading state when specified', () => {
      const { container } = renderWithProviders(<Button loading>Click me</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('[data-testid="spinner"]')).toBeInTheDocument();
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      const { container } = renderWithProviders(<Button disabled onClick={handleClick}>Click me</Button>);
      const button = container.querySelector('button');
      button?.click();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Test accessibility
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = renderWithProviders(<Button aria-label="Submit form">Click me</Button>);
      expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn();
      const { container } = renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
      const button = container.querySelector('button');
      fireEvent.keyDown(button!, { key: 'Enter', code: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have proper focus styles', () => {
      const { container } = renderWithProviders(<Button>Click me</Button>);
      const button = container.querySelector('button');
      button?.focus();
      expect(button).toHaveClass('focus:outline-none focus:ring-2 focus:ring-primary-500');
    });
  });
}); 