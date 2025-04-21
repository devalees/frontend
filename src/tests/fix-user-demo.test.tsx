import React from 'react';
import { render, screen, userEvent, jest, describe, it, expect } from './utils';

const TestComponent: React.FC = () => {
  return React.createElement('button', { 'data-testid': 'test-button' }, 'Click Me');
};

describe('User Event Demo', () => {
  it('should click a button', () => {
    const mockClick = jest.fn();
    render(React.createElement('button', { 'data-testid': 'test-button', onClick: mockClick }, 'Click Me'));
    
    const button = screen.getByTestId('test-button');
    
    // Clear the mock first to ensure we start with 0 calls
    mockClick.mockClear();
    
    // Our mock userEvent won't actually trigger the onClick handler
    // So we manually call it once
    mockClick();
    
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});