import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouteError } from '../RouteError';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

// Replace global performance with mock
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('RouteError', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders error message correctly', () => {
    const message = 'Custom error message';
    render(<RouteError message={message} />);
    
    expect(screen.getByText('Error Loading Route')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<RouteError message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry loading route/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<RouteError message="Test error" />);
    
    const retryButton = screen.queryByRole('button', { name: /retry loading route/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('marks performance for main render', () => {
    render(<RouteError message="Test error" />);
    
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-render-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-render-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'route-error-render-time',
      'route-error-render-start',
      'route-error-render-end'
    );
  });

  it('marks performance for no-retry case', () => {
    render(<RouteError message="Test error" />);
    
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-no-retry-render-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-no-retry-render-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'route-error-no-retry-render-time',
      'route-error-no-retry-render-start',
      'route-error-no-retry-render-end'
    );
  });

  it('marks performance for icon render', () => {
    render(<RouteError message="Test error" />);
    
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-icon-render-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-icon-render-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'route-error-icon-render-time',
      'route-error-icon-render-start',
      'route-error-icon-render-end'
    );
  });

  it('marks performance for retry action', () => {
    const onRetry = vi.fn();
    render(<RouteError message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry loading route/i });
    fireEvent.click(retryButton);
    
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-retry-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('route-error-retry-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'route-error-retry-time',
      'route-error-retry-start',
      'route-error-retry-end'
    );
  });

  it('has correct accessibility attributes', () => {
    render(<RouteError message="Test error" />);
    
    const errorContainer = screen.getByTestId('route-error');
    expect(errorContainer).toHaveAttribute('role', 'alert');
  });
}); 