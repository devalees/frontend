import React from 'react';
import { screen  } from '../../tests/utils';
import { jest } from "@jest/globals";
import { render, renderHook } from './testUtils';

// Mock the useStore hook
jest.mock('../../lib/store', () => ({
  useStore: jest.fn(() => ({
    todos: [],
    addTodo: jest.fn(),
    user: null,
    login: jest.fn()
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Test Utilities', () => {
  describe('render function', () => {
    it('should be defined', () => {
      expect(render).toBeDefined();
    });

    it('should render component correctly', () => {
      const TestComponent = () => <div data-testid="test-component">Test Component</div>;
      
      render(<TestComponent />);
      
      // Verify that the component renders correctly
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should accept custom wrapper', () => {
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="custom-wrapper">{children}</div>
      );
      
      const TestComponent = () => <div data-testid="test-component">Test Component</div>;
      
      render(<TestComponent />, { wrapper: CustomWrapper });
      
      // Verify custom wrapper is applied
      expect(screen.getByTestId('custom-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
    
    it('should preserve custom wrappers and their functionality', () => {
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="custom-wrapper" data-custom-attr="test-value">{children}</div>
      );
      
      const TestComponent = () => <div data-testid="test-component">Test Component</div>;
      
      render(<TestComponent />, { wrapper: CustomWrapper });
      
      // Verify the custom wrapper is preserved with its attributes
      const wrapper = screen.getByTestId('custom-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-custom-attr', 'test-value');
    });
  });

  describe('renderHook function', () => {
    it('should be defined', () => {
      expect(renderHook).toBeDefined();
    });

    it('should render hook correctly', () => {
      const testHook = () => { return { value: 'test' }; };
      
      const { result } = renderHook(() => testHook());
      
      expect(result.current).toEqual({ value: 'test' });
    });

    it('should accept wrapper option', () => {
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="custom-wrapper">{children}</div>
      );
      
      const testHook = () => { return { value: 'test' }; };
      
      const { result } = renderHook(() => testHook(), { wrapper: CustomWrapper });
      
      expect(result.current).toEqual({ value: 'test' });
    });
  });
}); 