import React from 'react';
import { render, screen } from './utils';
import userEvent from '@testing-library/user-event';

const TestComponent: React.FC = () => {
  return React.createElement('button', { 'data-testid': 'test-button' }, 'Click Me');
};

describe('Fixed User Demo Test', () => {
  it('should click a button using userEvent', async () => {
    render(React.createElement(TestComponent));
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    
    await userEvent.click(button);
    // In a real test, we would verify the click had some effect
  });
});