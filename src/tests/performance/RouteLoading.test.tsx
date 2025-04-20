import React from 'react';
import { render, screen, fireEvent  } from '../../tests/utils';
import { RouteLoading } from '../../lib/routing';
import { performanceMockInstance } from '../utils';

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: performanceMockInstance,
  writable: true,
});

describe('RouteLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    render(<RouteLoading />);
    expect(screen.getByTestId('route-loading')).toBeInTheDocument();
  });

  it('should track performance metrics', () => {
    render(<RouteLoading />);
    expect(performanceMockInstance.mark).toHaveBeenCalled();
    expect(performanceMockInstance.measure).toHaveBeenCalled();
  });
}); 